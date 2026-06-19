import axios, { AxiosError, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { invalidateCacheOnAuthChange } from '@/utils/requestCache';

/**
 * Ensures requests hit `/api/v1/...` even when VITE_API_BASE_URL is set to origin only
 * (e.g. `http://localhost:3000`), which otherwise produces 404s for `/dashboard/...`.
 */
function normalizeApiBaseUrl(raw: string | undefined): string {
  const fallback = 'http://localhost:3000';
  const base = (raw && raw.trim()) || fallback;
  const trimmed = base.replace(/\/+$/, '');
  if (/\/api\/v\d+$/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed}/api/v1`;
}

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL as string | undefined);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor - add Firebase token to all requests
api.interceptors.request.use(
  async (config) => {
    try {
      const { firebaseUser } = useAuthStore.getState();

      if (!firebaseUser) {
        return Promise.reject(
          new AxiosError(
            'Not signed in yet. Wait for authentication, then retry.',
            'ERR_NO_FIREBASE_USER',
            config,
          ),
        );
      }

      const token = await firebaseUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error('Failed to get Firebase token:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — retry once with a force-refreshed token on 401
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retried?: boolean };
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retried
    ) {
      originalRequest._retried = true;
      const { firebaseUser } = useAuthStore.getState();
      if (firebaseUser) {
        try {
          const freshToken = await firebaseUser.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${freshToken}`;
          return api(originalRequest);
        } catch {
          // refresh itself failed — fall through to logout
        }
      }
      invalidateCacheOnAuthChange();
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

// ============= Performance Metrics Types =============
export interface PerformanceMetric {
  value: number;
  change_percent: number;
}

export interface UsageTrendDay {
  date: string;
  day_name: string;
  flow_hours: number;
  debugging_hours: number;
  research_hours: number;
  communication_hours: number;
  distracted_hours: number;
}

export interface PerformanceMetricsResponse {
  period: string;
  performance_summary: {
    avg_typing_intensity: PerformanceMetric;    // KPM - Keystrokes Per Minute. Duration-weighted average across the window: Σ(kpm_i × duration_min_i) / Σ duration_min_i.
    avg_mouse_click_rate: PerformanceMetric;    // CPM - Clicks Per Minute. Duration-weighted average across the window: Σ(cpm_i × duration_min_i) / Σ duration_min_i.
    avg_corrections: PerformanceMetric;         // % - Correction Rate, calculated as (total_deletions / total_estimated_keystrokes) × 100
    daily_active_average: PerformanceMetric;    // Hours - Average active hours per day, calculated as Total context duration / active_days
  };
  usage_trend_graph: UsageTrendDay[];
}

// ============= Performance Metrics API =============
export async function fetchPerformanceMetrics(
  period: 'current_week' | 'previous_week' = 'current_week',
): Promise<PerformanceMetricsResponse> {
  const response = await api.get<PerformanceMetricsResponse>('/dashboard/performance-metrics', {
    params: period !== 'current_week' ? { period } : undefined,
  });
  return response.data;
}

/** Daily behavior aggregates (matches activity.behavior + context per calendar day). */
export interface DailyBehaviorMetrics {
  date: string;
  day_name: string;
  typing_intensity_kpm: number;
  mouse_click_rate_cpm: number;
  correction_rate_percent: number;
  active_hours: number;
  idle_hours: number;
  total_deletion_key_presses: number;
  total_mouse_movement_distance: number;
}

export type DetailPeriod = 'week' | 'month' | '90days' | '6months';

export interface PerformanceMetricsDetailResponse {
  period: string;
  performance_summary: PerformanceMetricsResponse['performance_summary'];
  daily_series: DailyBehaviorMetrics[];
  usage_trend_graph: UsageTrendDay[];
}

export async function fetchPerformanceMetricsDetail(
  period: DetailPeriod = 'week',
): Promise<PerformanceMetricsDetailResponse> {
  const response = await api.get<PerformanceMetricsDetailResponse>(
    '/dashboard/performance-metrics-detail',
    { params: { period } },
  );
  return response.data;
}

// ============= Tool Usage Types =============
export interface TopApp {
  name: string;
  duration_hours: number;
  percent_of_total: number;
  change_percent: number;
}

export interface TopAppsResponse {
  total_usage_hours: number;
  usage_increase_from_yesterday_percent: number;
  apps: TopApp[];
}

export interface LanguageSummary {
  total_lines_of_code: number;
  total_files: number;
  total_languages_used: number;
}

export interface Language {
  name: string;
  percent: number;
  loc: number;
  files: number;
}

export interface LanguageDistribution {
  summary: LanguageSummary;
  languages: Language[];
}

export interface ToolUsageResponse {
  period: string;
  top_apps: TopAppsResponse;
  language_distribution: LanguageDistribution;
}

export interface DailyAppUsage {
  date: string;
  day_name: string;
  total_hours: number;
}

export interface AppCategoryUsage {
  category: string;
  hours: number;
  percent_of_total: number;
}

/** Apps & languages detail: expanded lists + grouped app-hours chart. */
export interface ToolUsageDetailResponse {
  period: string;
  unique_apps_count: number;
  vs_prior_period_percent: number;
  /** Inferred from app names (server-side rules). */
  category_breakdown: AppCategoryUsage[];
  daily_app_usage: DailyAppUsage[];
  top_apps: TopAppsResponse;
  /** All-time from project code snapshots — unaffected by period filter. */
  language_distribution: LanguageDistribution;
}

export type AppDetailPeriod = "week" | "month" | "90days" | "6months";

// ============= Tool Usage API =============
export async function fetchToolUsage(): Promise<ToolUsageResponse> {
  const response = await api.get<ToolUsageResponse>('/dashboard/tool-usage');
  return response.data;
}

export async function fetchToolUsageDetail(period: AppDetailPeriod = "week"): Promise<ToolUsageDetailResponse> {
  const response = await api.get<ToolUsageDetailResponse>('/dashboard/tool-usage-detail', { params: { period } });
  return response.data;
}

// ============= Project Insights Types =============
export interface Skill {
  name: string;
  percent: number;
}

export interface ProjectDetail {
  name: string;
  /** Friendly label; use when non-empty, else `name`. */
  display_name?: string | null;
  last_active: string; // ISO 8601 string in local timezone (no Z)
}

export interface ProjectInsightsResponse {
  strongest_skills: Skill[];
  current_projects: ProjectDetail[];
}

// ============= Project Insights API =============
export async function fetchProjectInsights(): Promise<ProjectInsightsResponse> {
  const response = await api.get<ProjectInsightsResponse>('/dashboard/project-insights');
  return response.data;
}

// ============= Skills & projects detail =============
export interface SkillsProjectsSummary {
  total_projects: number;
  /** Active time: sum of activity.apps across all projects (hours). */
  total_app_time_hours: number;
  unique_skills_count: number;
  total_lines_of_code: number;
}

export interface SkillTimeEntry {
  name: string;
  duration_hours: number;
  percent_of_total: number;
}

export interface ProjectLanguageLine {
  name: string;
  lines: number;
}

export interface ProjectSkillTime {
  name: string;
  duration_sec: number;
  duration_hours: number;
}

export interface ProjectOverviewItem {
  name: string;
  display_name: string | null;
  description: string;
  last_active: string | null;
  first_seen: string | null;
  total_lines: number;
  total_files: number;
  top_languages: ProjectLanguageLine[];
  skills: ProjectSkillTime[];
  /** Active hours in apps for this project from activity.apps. */
  app_time_hours: number;
}

export interface SkillsProjectsDetailResponse {
  summary: SkillsProjectsSummary;
  skills: SkillTimeEntry[];
  projects: ProjectOverviewItem[];
}

export async function fetchSkillsProjectsDetail(): Promise<SkillsProjectsDetailResponse> {
  const response = await api.get<SkillsProjectsDetailResponse>('/dashboard/skills-projects-detail');
  return response.data;
}

export interface ProjectLanguageShare {
  name: string;
  lines: number;
  percent: number;
}

export interface ProjectSkillRow {
  name: string;
  duration_sec: number;
  duration_hours: number;
}

export interface ProjectBehaviorSummary {
  avg_typing_kpm: number;
  avg_mouse_cpm: number;
  total_idle_hours: number;
}

export interface ProjectNamedHoursRow {
  name: string;
  duration_hours: number;
  percent: number;
}

export interface ProjectContextBreakdown {
  flow_hours: number;
  debugging_hours: number;
  research_hours: number;
  communication_hours: number;
  distracted_hours: number;
  other_hours: number;
}

export interface ProjectDetailResponse {
  project_name: string;
  display_name: string | null;
  description: string;
  first_seen: string | null;
  last_active: string | null;
  /** Hours in desktop apps while this project was active (activity.apps). */
  app_time_hours: number;
  total_lines: number;
  total_files: number;
  /** Lines of code by language from the latest project snapshot (current_loc). */
  languages: ProjectLanguageShare[];
  top_apps: ProjectNamedHoursRow[];
  languages_by_active_time: ProjectNamedHoursRow[];
  context_breakdown: ProjectContextBreakdown;
  behavior: ProjectBehaviorSummary;
  skills: ProjectSkillRow[];
}

type ProjectDetailApiPayload = Omit<
  ProjectDetailResponse,
  "top_apps" | "languages_by_active_time" | "context_breakdown" | "behavior" | "skills"
> & {
  top_apps?: ProjectNamedHoursRow[];
  languages_by_active_time?: ProjectNamedHoursRow[];
  context_breakdown?: ProjectContextBreakdown;
  behavior?: ProjectBehaviorSummary;
  skills?: ProjectSkillRow[];
};

export interface UpdateProjectBody {
  display_name?: string;
  description?: string;
}

const emptyProjectContextBreakdown: ProjectContextBreakdown = {
  flow_hours: 0,
  debugging_hours: 0,
  research_hours: 0,
  communication_hours: 0,
  distracted_hours: 0,
  other_hours: 0,
};

const emptyProjectBehavior: ProjectBehaviorSummary = {
  avg_typing_kpm: 0,
  avg_mouse_cpm: 0,
  total_idle_hours: 0,
};

function normalizeProjectDetailResponse(data: ProjectDetailApiPayload): ProjectDetailResponse {
  const skills = (data.skills ?? []).map((s) => ({
    ...s,
    duration_sec: s.duration_sec ?? Math.round((s.duration_hours || 0) * 3600),
  }));
  return {
    ...data,
    top_apps: data.top_apps ?? [],
    languages_by_active_time: data.languages_by_active_time ?? [],
    context_breakdown: data.context_breakdown ?? emptyProjectContextBreakdown,
    behavior: data.behavior ?? emptyProjectBehavior,
    skills,
  };
}

export async function fetchProjectDetail(projectName: string): Promise<ProjectDetailResponse> {
  const path = `/dashboard/projects/${encodeURIComponent(projectName)}`;
  const response = await api.get<ProjectDetailApiPayload>(path);
  return normalizeProjectDetailResponse(response.data);
}

export async function patchProject(
  projectName: string,
  body: UpdateProjectBody,
): Promise<ProjectDetailResponse> {
  const path = `/dashboard/projects/${encodeURIComponent(projectName)}`;
  const response = await api.patch<ProjectDetailApiPayload>(path, body);
  return normalizeProjectDetailResponse(response.data);
}

/** Permanently removes the project and all daily activity rows for it (server-side). */
export async function deleteProject(projectName: string): Promise<void> {
  const path = `/dashboard/projects/${encodeURIComponent(projectName)}`;
  await api.delete(path);
}

// ============= Profile page =============

export interface ProfileProjectInsight {
  kind: "flow_focus" | "dominant_context" | "none";
  flow_focus_percent?: number;
  label?: string;
  percent?: number;
}

export interface ProfileProjectSkillRow {
  name: string;
  duration_sec: number;
  duration_hours: number;
  percent: number;
}

export interface ProfileProjectLanguageShare {
  name: string;
  percent: number;
}

export interface ProfileProjectAppRow {
  name: string;
  duration_hours: number;
  percent: number;
}

export interface ProfileProjectCard {
  project_name: string;
  display_name: string | null;
  description: string;
  last_active: string | null;
  app_time_hours: number;
  languages: ProfileProjectLanguageShare[];
  top_apps: ProfileProjectAppRow[];
  top_skills: ProfileProjectSkillRow[];
  insight: ProfileProjectInsight;
}

export interface ProfileGlobalSkillRow {
  name: string;
  duration_hours: number;
  percent: number;
}

export interface ProfileGlobalAppRow {
  name: string;
  duration_hours: number;
  percent: number;
}

export interface ProfileGlobalLanguageRow {
  name: string;
  lines: number;
  percent: number;
}

export interface ProfilePageResponse {
  streak_days: number;
  total_app_time_hours: number;
  total_projects: number;
  global_flow_focus_percent: number | null;
  top_skills: ProfileGlobalSkillRow[];
  top_apps: ProfileGlobalAppRow[];
  top_languages: ProfileGlobalLanguageRow[];
  projects: ProfileProjectCard[];
}

export async function fetchProfilePage(): Promise<ProfilePageResponse> {
  const response = await api.get<ProfilePageResponse>("/dashboard/profile-page");
  return response.data;
}

export interface PublicProfileUser {
  name: string;
  profilePhoto: string | null;
  description: string;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  createdAt: string | null;
}

type PublicProfileUserApi = PublicProfileUser & {
  profile_photo?: string | null;
};

export interface PublicProfileResponse {
  user: PublicProfileUser;
  profile: ProfilePageResponse;
}

function normalizePublicUser(raw: PublicProfileUserApi): PublicProfileUser {
  return {
    name: raw.name,
    profilePhoto: raw.profilePhoto ?? raw.profile_photo ?? null,
    description: raw.description ?? "",
    github_url: raw.github_url ?? null,
    linkedin_url: raw.linkedin_url ?? null,
    twitter_url: raw.twitter_url ?? null,
    createdAt: raw.createdAt ?? null,
  };
}

export async function fetchPublicProfile(userId: string): Promise<PublicProfileResponse> {
  const response = await api.get<{ user: PublicProfileUserApi; profile: ProfilePageResponse }>(
    `/dashboard/users/${encodeURIComponent(userId)}/public-profile`,
  );
  return {
    user: normalizePublicUser(response.data.user),
    profile: response.data.profile,
  };
}

// ============= Peers directory =============

export interface PeerCard {
  user_id: string;
  name: string;
  profilePhoto: string | null;
  bio: string;
  top_skills: string[];
  top_projects: string[];
  top_apps: string[];
}

type PeerCardApi = PeerCard & { profile_photo_url?: string | null };

function normalizePeerCard(raw: PeerCardApi): PeerCard {
  return {
    user_id: raw.user_id,
    name: raw.name,
    profilePhoto: raw.profilePhoto ?? raw.profile_photo_url ?? null,
    bio: raw.bio ?? "",
    top_skills: raw.top_skills ?? [],
    top_projects: raw.top_projects ?? [],
    top_apps: raw.top_apps ?? [],
  };
}

export async function fetchPeersSearch(q: string): Promise<PeerCard[]> {
  const response = await api.get<{ peers: PeerCardApi[] }>("/dashboard/peers/search", {
    params: { q: q.trim() || undefined },
  });
  return (response.data.peers ?? []).map(normalizePeerCard);
}

/** WebSocket namespace is on the API origin without the `/api/v1` suffix. */
export function getBackendOriginForSocket(): string {
  return API_BASE_URL.replace(/\/api\/v\d+$/i, "");
}

// ============= Zenno Agent Types =============

export type WorkSchedule = 'morning' | 'standard' | 'evening' | 'night_owl';
export type FocusStyle = 'deep' | 'moderate' | 'pomodoro';
export type WellbeingGoal = 'focused' | 'burnout' | 'habits' | 'minimal';
export type AgentTone = 'friendly' | 'motivational' | 'professional' | 'casual';

export interface AgentPreferences {
  user_id: string;
  work_schedule: WorkSchedule;
  focus_style: FocusStyle;
  wellbeing_goal: WellbeingGoal;
  nudge_enabled: boolean;
  notification_sound: boolean;
  agent_tone: AgentTone;
  updatedAt?: string;
}

export interface UpdateAgentPreferencesBody {
  work_schedule?: WorkSchedule;
  focus_style?: FocusStyle;
  wellbeing_goal?: WellbeingGoal;
  nudge_enabled?: boolean;
  notification_sound?: boolean;
  agent_tone?: AgentTone;
}

export interface AgentNudgeStats {
  total_nudges: number;
  today_nudges: number;
  this_week_nudges: number;
  total_suppressed: number;
  /**
   * Map of suppression reason → count, populated by the desktop agent.
   * Examples: `quiet_hours`, `too_recent`, `aggregation_failed`,
   * `display_failed`, `unknown` (for legacy rows). Optional for
   * back-compat with older backends.
   */
  suppressed_by_reason?: Record<string, number>;
}

// ============= Zenno Agent API =============

export async function fetchAgentPreferences(): Promise<AgentPreferences> {
  const response = await api.get<{ success: boolean; data: AgentPreferences }>(
    '/agent/preferences',
  );
  return response.data.data;
}

export async function updateAgentPreferences(
  body: UpdateAgentPreferencesBody,
): Promise<AgentPreferences> {
  const response = await api.put<{ success: boolean; data: AgentPreferences }>(
    '/agent/preferences',
    body,
  );
  return response.data.data;
}

export async function fetchAgentNudgeStats(): Promise<AgentNudgeStats> {
  const response = await api.get<{ success: boolean; data: AgentNudgeStats }>(
    '/agent/nudges/stats',
  );
  return response.data.data;
}

// ============= Chat (REST + used with Socket.IO `/chat`) =============

export interface ChatOtherUser {
  id: string;
  name: string;
  profilePhoto: string | null;
}

export interface ChatConversationSummary {
  id: string;
  other_user: ChatOtherUser;
  last_message_text: string;
  last_message_at: string;
  unread_count: number;
}

export interface ChatMessageItem {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

export async function fetchChatConversations(): Promise<ChatConversationSummary[]> {
  const r = await api.get<{ conversations: ChatConversationSummary[] }>("/chat/conversations");
  return r.data.conversations ?? [];
}

export async function openChatWithUser(userId: string): Promise<string> {
  const r = await api.post<{ conversation_id: string }>("/chat/conversations/with-user", { userId });
  return r.data.conversation_id;
}

export async function fetchChatMessages(conversationId: string, before?: string): Promise<ChatMessageItem[]> {
  const r = await api.get<{ messages: ChatMessageItem[] }>(`/chat/conversations/${conversationId}/messages`, {
    params: before ? { before } : undefined,
  });
  return r.data.messages ?? [];
}

export async function markChatRead(conversationId: string): Promise<void> {
  await api.post(`/chat/conversations/${conversationId}/read`);
}

export async function deleteChatConversation(conversationId: string): Promise<void> {
  await api.delete(`/chat/conversations/${conversationId}`);
}

export async function reportChatConversation(conversationId: string, reason?: string): Promise<void> {
  await api.post(`/chat/conversations/${conversationId}/report`, {
    reason: reason?.trim() || undefined,
  });
}

// ============= Notifications Types =============

export interface NotificationItem {
  _id: string;
  user_id: string;
  type: 'chat_message' | 'new_project' | 'daily_digest' | 'test';
  title: string;
  body: string;
  data: Record<string, string>;
  read_at: string | null;
  push_sent_at: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  push_enabled: boolean;
  chat_enabled: boolean;
  new_project_enabled: boolean;
  daily_digest_enabled: boolean;
}

// ============= Notifications API =============

export async function registerFcmDevice(
  token: string,
  platform: 'web' | 'android' | 'ios',
  deviceLabel: string,
): Promise<void> {
  await api.post('/notifications/devices', { token, platform, device_label: deviceLabel });
}

export async function unregisterFcmDevice(token: string): Promise<void> {
  await api.delete(`/notifications/devices/${encodeURIComponent(token)}`);
}

export async function fetchNotifications(
  page = 1,
): Promise<{ items: NotificationItem[]; unreadCount: number; hasMore: boolean }> {
  const r = await api.get<{ items: NotificationItem[]; unreadCount: number; hasMore: boolean }>(
    '/notifications',
    { params: { page } },
  );
  return r.data;
}

export async function fetchUnreadCount(): Promise<number> {
  const r = await api.get<{ count: number }>('/notifications/unread-count');
  return r.data.count;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.post(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post('/notifications/read-all');
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const r = await api.get<{ data: NotificationPreferences }>('/notifications/preferences');
  return r.data.data;
}

export async function updateNotificationPreferences(
  partial: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  const r = await api.put<{ data: NotificationPreferences }>('/notifications/preferences', partial);
  return r.data.data;
}

export default api;
