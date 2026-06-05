import { motion } from "motion/react";
import { GlassCard } from "./GlassCard";
import { fadeUp, landingViewport, staggerDelay } from "./landingMotion";
import { BarChart3, Code2, Folder, Sparkles } from "lucide-react";
import { LandingTopLanguagesPreview } from "./LandingTopLanguagesPreview";

const features = [
  {
    icon: BarChart3,
    title: "Performance & trends",
    description:
      "Flow, debugging, research, communication, and distracted time, with the same breakdown as Developer Trends in the app.",
  },
  {
    icon: Code2,
    title: "Apps & languages",
    description:
      "Top apps, language mix, and inferred categories (Development, Browser, Communication, …), matching the Apps & Languages views on web and mobile.",
  },
  {
    icon: Folder,
    title: "Projects & skills",
    description:
      "Tie activity to projects and skills so you know where attention is going over the week.",
  },
  {
    icon: Sparkles,
    title: "Zenno Agent",
    description:
      "Preferences for schedule, focus style, and wellbeing, with nudges that respect quiet hours and your goals.",
  },
];

export function CorePlatform() {
  return (
    <section id="features" className="landing-section" style={{ background: "#0F0F14" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={landingViewport}
          transition={fadeUp(0.82, 0)}
          className="text-center landing-mb-heading"
        >
          <h2 className="landing-h2">Everything you need to understand how you work</h2>
          <p className="landing-lead max-w-2xl mx-auto" style={{ margin: "0 auto" }}>
            Desktop agent, web dashboard, and Zenno Agent, connected the same way as in the product.
          </p>
        </motion.div>

        <div className="landing-grid-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={landingViewport}
            transition={fadeUp(0.88, 0.06)}
          >
            <GlassCard className="landing-pad-card">
              <LandingTopLanguagesPreview />
            </GlassCard>
          </motion.div>

          <div className="grid gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: 22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={landingViewport}
                transition={fadeUp(0.78, staggerDelay(index, 0.09))}
              >
                <GlassCard className="p-6" hover>
                  <div className="flex gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "rgba(91, 111, 216, 0.16)",
                        border: "1px solid rgba(91, 111, 216, 0.3)",
                      }}
                    >
                      <feature.icon className="w-6 h-6" style={{ color: "#7C4DFF" }} />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 700,
                          color: "#F5F7FA",
                          marginBottom: "0.5rem",
                          fontFamily: "Space Grotesk, sans-serif",
                        }}
                      >
                        {feature.title}
                      </h3>
                      <p style={{ fontSize: "1rem", color: "#A7B0BE", lineHeight: "1.6" }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
