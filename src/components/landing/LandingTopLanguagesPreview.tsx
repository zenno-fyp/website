import { Code2, FileCode } from "lucide-react";
import { LANDING_LANGUAGE_COLORS } from "./analyticsTheme";

/** Dashboard bar colors + Shell (scripts / CI) for this preview */
function getLanguageColor(name: string): string {
  if (name === "Shell") return "#84CC16";
  return LANDING_LANGUAGE_COLORS[name] ?? "#5B6FD8";
}

const MOCK_LANGUAGES = [
  { name: "TypeScript", percent: 32.0, loc: 113_600, files: 400 },
  { name: "Dart", percent: 24.0, loc: 85_200, files: 200 },
  { name: "Python", percent: 20.0, loc: 71_000, files: 180 },
  { name: "YAML", percent: 12.0, loc: 42_600, files: 95 },
  { name: "Shell", percent: 12.0, loc: 42_600, files: 85 },
] as const;

export function LandingTopLanguagesPreview() {
  const languages = MOCK_LANGUAGES;
  const topLanguage = languages[0];
  const rest = languages.slice(1);
  const totalLines = languages.reduce((a, l) => a + l.loc, 0);
  const totalFiles = languages.reduce((a, l) => a + l.files, 0);
  const totalLanguages = languages.length;

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl"
        style={{ background: "linear-gradient(to bottom right, rgba(147, 51, 234, 0.2), rgba(37, 99, 235, 0.15))" }}
      />
      <div
        className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full blur-3xl"
        style={{ background: "linear-gradient(to bottom right, rgba(124, 77, 255, 0.2), rgba(147, 51, 234, 0.15))" }}
      />

      <div className="relative z-10">
        <h3 className="mb-6" style={{ fontWeight: 700, color: "#F5F7FA", fontSize: "1.125rem" }}>
          Language Distribution
        </h3>

        {/* Featured: same gradient hero as dashboard */}
        <div
          className="relative mb-6 overflow-hidden rounded-2xl p-5 text-white shadow-xl"
          style={{
            background: "linear-gradient(to bottom right, #5B6FD8, #7C4DFF)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(to bottom right, rgba(255,255,255,0.1), transparent)",
            }}
            aria-hidden
          />
          <div className="relative z-10 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/25 shadow-lg backdrop-blur-md"
              >
                <Code2 className="h-6 w-6 text-white" aria-hidden />
              </div>
              <div>
                <p className="text-sm opacity-90">Most Used</p>
                <p className="text-xl font-semibold">{topLanguage.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tabular-nums">{topLanguage.percent.toFixed(1)}%</p>
            </div>
          </div>
          <div className="relative z-10 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 opacity-80" aria-hidden />
              <span className="opacity-90">{topLanguage.loc.toLocaleString()} lines</span>
            </div>
            <span className="opacity-60">•</span>
            <span className="opacity-90">{topLanguage.files} files</span>
          </div>
        </div>

        {/* Secondary languages: grid + thin progress like dashboard */}
        <div className="grid grid-cols-2 gap-3">
          {rest.map((lang) => (
            <div
              key={lang.name}
              className="rounded-2xl border p-4 shadow-sm backdrop-blur-xl transition-all"
              style={{
                background: "rgba(17, 24, 39, 0.4)",
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm text-gray-300">{lang.name}</p>
                <p className="text-lg font-semibold tabular-nums text-white">{lang.percent.toFixed(1)}%</p>
              </div>
              <div className="relative w-full">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, lang.percent)}%`,
                      backgroundColor: getLanguageColor(lang.name),
                    }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>{lang.loc.toLocaleString()} lines</span>
                  <span>{lang.files} files</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="my-6 h-px w-full" style={{ background: "rgba(255, 255, 255, 0.1)" }} />

        <div className="flex flex-wrap items-stretch justify-between gap-3">
          {[
            { label: "Total Lines", value: `${(totalLines / 1000).toFixed(1)}K` },
            { label: "Total Files", value: String(totalFiles) },
            { label: "Total Languages", value: String(totalLanguages) },
          ].map((s) => (
            <div
              key={s.label}
              className="flex-1 rounded-xl border px-3 py-3 text-center"
              style={{
                background: "rgba(17, 24, 39, 0.35)",
                borderColor: "rgba(255, 255, 255, 0.06)",
                minWidth: "5.5rem",
              }}
            >
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="mt-1 text-lg font-semibold text-white tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
