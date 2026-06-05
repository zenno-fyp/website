import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { GlassCard } from "./GlassCard";
import { Bell, Bot, MessageCircle, UsersRound } from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { appUsageCategoryColor, getAppIconForName, getAppRowVisual } from "./analyticsTheme";
import { LANDING_DEVELOPER_TRENDS_WEEK } from "./landingChartData";
import { LandingDeveloperTrendsChart } from "./LandingDeveloperTrendsChart";
import { fadeUp, landingViewport, LANDING_EASE, staggerDelay } from "./landingMotion";

const topApps = [
  { name: "Visual Studio Code", hours: 32.0, percent: 32 },
  { name: "Brave", hours: 18.0, percent: 22 },
  { name: "MongoDB Compass", hours: 12.5, percent: 16 },
  { name: "AWS Console", hours: 12.5, percent: 16 },
  { name: "ChatGPT", hours: 10.0, percent: 14 },
];

/** Apps & Languages · usage by category (same labels/colours as web + mobile) */
const APP_CATEGORY_HOURS = [
  { name: "Development", hours: 28.5 },
  { name: "Browser", hours: 12.0 },
  { name: "Communication", hours: 8.2 },
  { name: "Design", hours: 5.0 },
  { name: "Productivity", hours: 3.8 },
  { name: "Other", hours: 1.0 },
] as const;

const appCategoryWeekTotal = APP_CATEGORY_HOURS.reduce((a, x) => a + x.hours, 0);

const agentPrefs = [
  {
    label: "Work schedule",
    value: "Standard Day",
    hint: "Active 8 AM – 8 PM",
  },
  {
    label: "Focus style",
    value: "Moderate",
    hint: "75-min break reminders",
  },
  {
    label: "Wellbeing goal",
    value: "Stay Focused",
    hint: "Celebrate deep work, flag distractions",
  },
] as const;

const nudgeExamples = [
  {
    time: "10:42",
    message:
      "You've been in flow for about 2 hours. With Moderate focus, consider a short break before the next block.",
  },
  {
    time: "14:05",
    message: "Quiet hours are on, so we will deliver non-urgent nudges after your window ends.",
  },
  {
    time: "16:20",
    message: "Debugging is up vs. last week. Open Developer Trends to compare categories side by side.",
  },
] as const;

export function FeatureDeepDive() {
  const pieWrapRef = useRef<HTMLDivElement>(null);
  const pieChartInView = useInView(pieWrapRef, { once: true, amount: 0.35, margin: "-48px 0px" });

  return (
    <section className="landing-section">
      <div className="max-w-7xl mx-auto landing-deep-dive-stack">
        {/* Section A: Work Patterns */}
        <div className="landing-grid-2">
          <motion.div
            initial={{ opacity: 0, x: -22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={landingViewport}
            transition={fadeUp(0.88, 0)}
          >
            <h2 className="landing-h2-lg">See your work patterns</h2>
            <p className="landing-lead" style={{ marginBottom: "1.25rem" }}>
              Developer Trends tracks focus the same way on web and mobile, including flow, debugging, research, communication, and
              distracted hours. Apps &amp; Languages adds{" "}
              <span style={{ color: "#E5E7EB" }}>inferred app categories</span> (Development, Browser, Communication, …)
              so you see where applications sit, not just raw screen time.
            </p>

            <GlassCard className="landing-pad-card">
              <div style={{ color: "#6F7885", fontSize: "0.875rem", marginBottom: "0.35rem" }}>
                This week · hours by app category
              </div>
              <div style={{ color: "#6F7885", fontSize: "0.75rem", marginBottom: "0.75rem", lineHeight: 1.45 }}>
                Grouped like Apps &amp; Languages, with the same categories on web and mobile
              </div>
              <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
                <span
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "#F5F7FA",
                    fontFamily: "Space Grotesk, sans-serif",
                  }}
                >
                  {appCategoryWeekTotal.toFixed(1)}h
                </span>
                <span style={{ fontSize: "0.8125rem", color: "#6F7885" }}>Tracked app time</span>
              </div>
              <motion.div
                ref={pieWrapRef}
                className="w-full landing-chart-pie-h"
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={landingViewport}
                transition={{ duration: 0.7, ease: LANDING_EASE }}
              >
                {pieChartInView ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={APP_CATEGORY_HOURS.map((d) => ({ name: d.name, value: d.hours }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="58%"
                        outerRadius="88%"
                        paddingAngle={2}
                        stroke="rgba(15, 15, 20, 0.9)"
                        strokeWidth={2}
                        isAnimationActive
                        animationBegin={120}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      >
                        {APP_CATEGORY_HOURS.map((entry) => (
                          <Cell key={entry.name} fill={appUsageCategoryColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${value.toFixed(1)}h`, "Time"]}
                        contentStyle={{
                          backgroundColor: "rgba(17, 24, 39, 0.98)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          borderRadius: "12px",
                          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                          color: "#F9FAFB",
                        }}
                        labelStyle={{
                          color: "#F9FAFB",
                          fontWeight: 600,
                          marginBottom: "0.25rem",
                        }}
                        itemStyle={{ color: "#E5E7EB" }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "12px", color: "#9CA3AF", paddingTop: "8px" }}
                        formatter={(value) => <span style={{ color: "#A7B0BE" }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    className="h-full w-full rounded-2xl"
                    style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    aria-hidden
                  />
                )}
              </motion.div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={landingViewport}
            transition={fadeUp(0.88, 0.08)}
            className="flex w-full min-w-0 flex-col gap-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={landingViewport}
              transition={{ duration: 0.65, ease: LANDING_EASE }}
            >
            <GlassCard className="landing-pad-card">
              <div className="landing-chart-trends-h">
                <LandingDeveloperTrendsChart
                  fillContainer
                  data={LANDING_DEVELOPER_TRENDS_WEEK}
                  title="Developer Trends · weekly hours"
                />
              </div>
            </GlassCard>
            </motion.div>
            <GlassCard className="landing-pad-card">
              <div className="flex gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg"
                  style={{
                    background: "linear-gradient(to bottom right, #5B6FD8, #7C4DFF)",
                  }}
                  aria-hidden
                >
                  <UsersRound className="h-7 w-7 text-white" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "#F5F7FA",
                      fontFamily: "Space Grotesk, sans-serif",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Find peers
                  </h3>
                  <p style={{ fontSize: "0.9375rem", color: "#A7B0BE", lineHeight: 1.6, margin: 0 }}>
                    Search teammates by skills, projects, apps, and bio, with the same discovery experience as the dashboard
                    Peers screen on web and mobile.
                  </p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="landing-pad-card">
              <div className="flex gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg"
                  style={{
                    background: "linear-gradient(to bottom right, #7C3AED, #5B6FD8)",
                  }}
                  aria-hidden
                >
                  <MessageCircle className="h-7 w-7 text-white" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "#F5F7FA",
                      fontFamily: "Space Grotesk, sans-serif",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Chats
                  </h3>
                  <p style={{ fontSize: "0.9375rem", color: "#A7B0BE", lineHeight: 1.6, margin: 0 }}>
                    Direct messages with peers use a conversation list and thread view aligned with the in-app Chats experience,
                    including real-time updates when you are signed in.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Section B: Tools & Languages */}
        <div className="landing-grid-2">
          <motion.div
            initial={{ opacity: 0, x: -22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={landingViewport}
            transition={fadeUp(0.88, 0)}
            className="landing-fd-swap-a"
          >
            <GlassCard className="landing-pad-card">
              <div style={{ color: "#6F7885", fontSize: "0.875rem", marginBottom: "1rem" }}>
                Top apps · this week
              </div>

              <div className="space-y-4">
                {topApps.map((app) => {
                  const Icon = getAppIconForName(app.name);
                  const { color, linearGradient } = getAppRowVisual(app.name);
                  return (
                    <div
                      key={app.name}
                      className="p-4 rounded-2xl"
                      style={{
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        background: "rgba(255, 255, 255, 0.02)",
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                          style={{ background: linearGradient }}
                        >
                          <Icon className="w-5 h-5 text-white" aria-hidden />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-3 mb-2">
                            <span style={{ fontSize: "1rem", color: "#F5F7FA" }} className="truncate font-medium">
                              {app.name}
                            </span>
                            <div className="text-right flex-shrink-0">
                              <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#F5F7FA" }}>
                                {app.hours}h
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "#6F7885" }}>{app.percent.toFixed(0)}%</div>
                            </div>
                          </div>
                          <div className="relative w-full h-1.5 rounded-full overflow-hidden bg-gray-700/80">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${app.percent}%` }}
                              viewport={landingViewport}
                              transition={{ duration: 1.05, delay: 0.12, ease: LANDING_EASE }}
                              className="absolute top-0 left-0 h-full rounded-full"
                              style={{
                                background: `linear-gradient(to right, ${color}, ${color}dd)`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={landingViewport}
            transition={fadeUp(0.88, 0.06)}
            className="landing-fd-swap-b"
          >
            <h2 className="landing-h2-lg">Tools, languages, and projects in one place</h2>
            <p className="landing-lead">
              The same top-apps treatment as the dashboard and mobile: hashed colours per app, hours, and share of
              focus.
            </p>
          </motion.div>
        </div>

        {/* Section C: Zenno Agent */}
        <div className="landing-grid-2">
          <motion.div
            initial={{ opacity: 0, x: -22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={landingViewport}
            transition={fadeUp(0.88, 0)}
          >
            <div className="mb-6">
              <h2 className="landing-h2-lg" style={{ marginBottom: "1rem" }}>
                Nudges that follow your Zenno Agent settings
              </h2>
              <p className="landing-lead" style={{ margin: 0 }}>
                Schedules, focus styles, and wellbeing goals come straight from the agent screen, so reminders line up
                with how you actually work, not a generic template.
              </p>
            </div>

            <div className="space-y-3">
              {agentPrefs.map((pref) => (
                <div
                  key={pref.label}
                  className="p-4 rounded-2xl"
                  style={{
                    background: "rgba(91, 111, 216, 0.1)",
                    border: "1px solid rgba(91, 111, 216, 0.3)",
                  }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <span style={{ color: "#A7B0BE", fontSize: "0.9375rem" }}>{pref.label}</span>
                    <div className="text-right">
                      <div style={{ color: "#F5F7FA", fontSize: "1rem", fontWeight: 600 }}>{pref.value}</div>
                      <div style={{ color: "#6F7885", fontSize: "0.75rem", marginTop: "0.25rem" }}>{pref.hint}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={landingViewport}
            transition={fadeUp(0.88, 0.08)}
            className="flex min-w-0 flex-col gap-8"
          >
            <div className="flex shrink-0 items-start gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-xl"
                style={{
                  background: "linear-gradient(to bottom right, #7C4DFF, #5B6FD8)",
                }}
                aria-hidden
              >
                <Bot className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <div className="min-w-0 pt-1">
                <div
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    color: "#F5F7FA",
                    fontFamily: "Space Grotesk, sans-serif",
                    marginBottom: "0.25rem",
                  }}
                >
                  Nudge feed
                </div>
                <p style={{ fontSize: "0.875rem", color: "#6F7885", lineHeight: "1.5", margin: 0 }}>
                  Examples from a typical day, with timing and tone that follow your agent settings.
                </p>
              </div>
            </div>
            <div className="min-w-0 space-y-4">
              {nudgeExamples.map((nudge, index) => (
                <motion.div
                  key={nudge.time}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={landingViewport}
                  transition={fadeUp(0.72, staggerDelay(index, 0.1))}
                >
                  <GlassCard className="p-4">
                    <div className="flex gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(91, 111, 216, 0.16)",
                          border: "1px solid rgba(91, 111, 216, 0.3)",
                        }}
                      >
                        <Bell className="w-5 h-5" style={{ color: "#7C4DFF" }} />
                      </div>
                      <div>
                        <div style={{ color: "#6F7885", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                          {nudge.time}
                        </div>
                        <div style={{ color: "#F5F7FA", fontSize: "0.9375rem", lineHeight: "1.5" }}>
                          {nudge.message}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
