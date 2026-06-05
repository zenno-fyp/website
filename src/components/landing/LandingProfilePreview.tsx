import { motion } from "motion/react";
import { Calendar, Clock, Flame, Github, Linkedin, Mail, Zap } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { LANGUAGE_MOCK, LANDING_LANGUAGE_COLORS } from "./analyticsTheme";
import { fadeUp, landingViewport } from "./landingMotion";

function langColor(name: string): string {
  return LANDING_LANGUAGE_COLORS[name] ?? "#5B6FD8";
}

/** Stacked bar as one gradient: avoids flex % width bugs that collapse segments to one color */
function languageBarGradient(langs: { name: string; percent: number }[]): string {
  let acc = 0;
  const stops: string[] = [];
  for (const lang of langs) {
    const c = langColor(lang.name);
    const start = acc;
    acc += lang.percent;
    const end = Math.min(100, acc);
    stops.push(`${c} ${start}%`, `${c} ${end}%`);
  }
  return `linear-gradient(to right, ${stops.join(", ")})`;
}

export function LandingProfilePreview() {
  const MOCK_PROJECT_LANGS = LANGUAGE_MOCK.map((l) => ({ name: l.name, percent: l.value }));

  const norm = (() => {
    const sum = MOCK_PROJECT_LANGS.reduce((a, l) => a + l.percent, 0);
    return sum <= 0 ? MOCK_PROJECT_LANGS : MOCK_PROJECT_LANGS.map((l) => ({ ...l, percent: (l.percent / sum) * 100 }));
  })();

  return (
    <section id="profile" className="landing-section" style={{ background: "#0A0A0F" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={landingViewport}
          transition={fadeUp(0.82, 0)}
          className="text-center landing-mb-heading"
        >
          <h2 className="landing-h2">
            A profile that connects you with peers
            <br />
            and hiring teams
          </h2>
          <p className="landing-lead max-w-2xl mx-auto" style={{ margin: "0 auto", lineHeight: 1.6 }}>
            Your Zenno profile is built to showcase how you actually work: projects, languages, apps, and skills pulled from
            live activity, so teammates can find you and recruiters and HR get a credible, up-to-date picture of your
            craft, not a static résumé.
          </p>
        </motion.div>

        <div className="landing-grid-2 landing-grid-2-stretch">
          <motion.div
            className="flex min-w-0"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={landingViewport}
            transition={fadeUp(0.85, 0.05)}
          >
            <GlassCard className="flex h-full w-full flex-col p-8 rounded-3xl border border-white/10 shadow-lg" hover={false}>
              <div className="landing-profile-inner">
                <div className="flex shrink-0 flex-col items-center gap-4">
                  <div
                    className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-4 border-transparent text-3xl font-semibold text-white shadow-2xl ring-2 ring-[#5B6FD8]/40"
                    style={{
                      background: "linear-gradient(135deg, #5B6FD8 0%, #7C4DFF 100%)",
                    }}
                    aria-hidden
                  >
                    ZA
                  </div>
                  <div className="flex gap-2">
                    <a
                      href="https://github.com/zubiiabbasi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-gray-300 transition-colors hover:border-white/25 hover:text-white"
                      aria-label="GitHub profile"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/zubiiabbasi/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-gray-300 transition-colors hover:border-white/25 hover:text-white"
                      aria-label="LinkedIn profile"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col space-y-4">
                  <h3 className="landing-profile-name">Zubair Abbas</h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                    <Mail className="h-4 w-4 shrink-0" />
                    zubairabbas.dev@gmail.com
                  </div>
                  <p className="max-w-2xl leading-relaxed text-gray-300">
                    Full-stack engineer on Zenno, shipping the analytics dashboard, API, mobile app, and desktop agent so
                    developers get one clear picture of how they work.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                    <Calendar className="h-4 w-4 shrink-0" />
                    Joined March 2025
                  </div>

                  <div className="landing-profile-metrics">
                    {[
                      { label: "Streak", value: "12d", icon: "flame" as const },
                      { label: "Projects", value: "8" },
                      { label: "App hours", value: "142h" },
                      { label: "Flow focus", value: "68%" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="flex flex-col items-center justify-center rounded-2xl bg-white/5 p-4 text-center shadow-md"
                        style={{ minHeight: "5.75rem" }}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          {s.icon === "flame" ? (
                            <Flame
                              className="h-5 w-5 shrink-0"
                              strokeWidth={2.25}
                              aria-hidden
                              style={{
                                color: "#FF4500",
                                filter: "drop-shadow(0 0 4px rgba(255, 69, 0, 0.85)) drop-shadow(0 0 10px rgba(255, 140, 0, 0.45))",
                              }}
                            />
                          ) : null}
                          <span className="text-2xl font-semibold tabular-nums text-white">{s.value}</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            className="flex min-w-0"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={landingViewport}
            transition={fadeUp(0.85, 0.12)}
          >
            <GlassCard className="flex h-full w-full flex-col rounded-2xl border border-white/10 p-6 shadow-md backdrop-blur-xl" hover={false}>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-lg font-semibold text-white">Zenno</h4>
                  <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                    The Zenno monorepo you see in this workspace: a NestJS backend and shared API, the React web
                    dashboard, a Flutter mobile app, the desktop tracking agent, and Python NLP services for intelligent
                    nudges, surfaced together as projects and skills on your profile.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 shrink-0" />
                      Last active Apr 18, 2:40 PM
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-4 w-4 shrink-0" />
                      38.2h in apps
                    </span>
                    <span className="flex items-center gap-1.5 text-purple-300">
                      <Flame className="h-4 w-4 shrink-0" />
                      Flow focus 64%
                    </span>
                  </div>
                </div>
              </div>

              <p className="mb-2 shrink-0 text-sm font-medium text-gray-300">Language distribution</p>
              <div
                className="mb-2 h-2.5 w-full max-w-full overflow-hidden rounded-full ring-1 ring-inset ring-white/10"
                role="img"
                aria-label="Language share"
                style={{
                  background: languageBarGradient(norm),
                }}
              />
              <div className="mb-6 flex flex-wrap gap-3">
                {norm.map((lang) => (
                  <div key={lang.name} className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 shrink-0 rounded-full ring-1 ring-white/20"
                      style={{ backgroundColor: langColor(lang.name) }}
                    />
                    <span className="text-xs text-gray-400">
                      {lang.name} ({lang.percent.toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>

              <p className="mb-2 text-sm font-medium text-gray-300">Top apps</p>
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  "Visual Studio Code · 32h",
                  "Brave · 18h",
                  "MongoDB · 12h",
                  "AWS · 12h",
                  "ChatGPT · 10h",
                ].map((t) => (
                  <span
                    key={t}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-300"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <p className="mb-2 text-sm font-medium text-gray-300">Top skills</p>
              <div className="flex flex-wrap gap-2">
                {["Frontend", "Backend", "Mobile app", "DevOps", "NLP"].map((s) => (
                  <span
                    key={s}
                    className="rounded-lg bg-gradient-to-r from-[#5B6FD8] to-[#7C4DFF] px-2.5 py-1 text-xs text-white"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
