import type { LucideIcon } from "lucide-react";
import { Bot, Chrome, Cloud, Code, Database, Terminal } from "lucide-react";

/**
 * Category colors: same as DeveloperTrendsCard / MetricsDetailPage (`TREND_FILTERS`)
 * and the mobile analytics screens.
 */
export const CATEGORY_COLORS = {
  flow: "#5B6FD8",
  debugging: "#FF6B6B",
  research: "#4ECDC4",
  communication: "#FFD93D",
  distracted: "#FF6B9D",
} as const;

/** TopAppUsageCard / mobile `APP_COLOR_PALETTE`: hash pick for app rows */
const APP_STYLE_PALETTE: { color: string; linearGradient: string }[] = [
  { color: "#5B6FD8", linearGradient: "linear-gradient(to bottom right, #5B6FD8, #7C4DFF)" },
  { color: "#4ECDC4", linearGradient: "linear-gradient(to bottom right, #4ECDC4, #44A6A0)" },
  { color: "#FB542B", linearGradient: "linear-gradient(to bottom right, #FB542B, #FF8C42)" },
  { color: "#FF6B9D", linearGradient: "linear-gradient(to bottom right, #FF6B9D, #FF8FA3)" },
  { color: "#FFD93D", linearGradient: "linear-gradient(to bottom right, #FFD93D, #FFC93D)" },
];

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Inferred app categories: same keys/colours as `AppLanguagesDetailPage` and mobile `_kCategoryColors`.
 */
export const APP_USAGE_CATEGORY_COLORS: Record<string, string> = {
  Development: "#5B6FD8",
  Browser: "#4285F4",
  Design: "#F24E1E",
  Communication: "#7C3AED",
  Productivity: "#9B59B6",
  Other: "#6B7280",
};

export function appUsageCategoryColor(category: string): string {
  return APP_USAGE_CATEGORY_COLORS[category] ?? APP_STYLE_PALETTE[hashString(category) % APP_STYLE_PALETTE.length].color;
}

export function getAppRowVisual(appName: string): { color: string; linearGradient: string } {
  return APP_STYLE_PALETTE[hashString(appName) % APP_STYLE_PALETTE.length];
}

/** Mirrors TopAppUsageCard `getAppIcon` / mobile `_appIcon` */
export function getAppIconForName(appName: string): LucideIcon {
  const n = appName.toLowerCase();
  if (n.includes("code") || n.includes("vscode") || n.includes("vs ")) return Code;
  if (n.includes("chrome") || n.includes("firefox") || n.includes("edge") || n.includes("brave")) return Chrome;
  if (n.includes("chatgpt") || n.includes("chat gpt") || n.includes("openai")) return Bot;
  if (n.includes("mongo")) return Database;
  if (n.includes("aws") || n.includes("amazon") || n.includes("console.aws")) return Cloud;
  if (n.includes("terminal") || n.includes("cmd") || n.includes("powershell")) return Terminal;
  return Code;
}

/**
 * Landing-only language bar colors: distinct hues so segments read clearly on dark backgrounds.
 */
export const LANDING_LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3B82F6",
  Dart: "#14B8A6",
  Python: "#F59E0B",
  /** Docker Compose, GitHub Actions, CI; common alongside TS/Python in this repo */
  YAML: "#A855F7",
};

/**
 * Rough language mix for the Zenno monorepo: TS (web + Nest API), Dart (Flutter), Python (NLP),
 * YAML (infra & workflows).
 */
export const LANGUAGE_MOCK = [
  { name: "TypeScript", value: 36, bar: LANDING_LANGUAGE_COLORS.TypeScript },
  { name: "Dart", value: 28, bar: LANDING_LANGUAGE_COLORS.Dart },
  { name: "Python", value: 22, bar: LANDING_LANGUAGE_COLORS.Python },
  { name: "YAML", value: 14, bar: LANDING_LANGUAGE_COLORS.YAML },
] as const;
