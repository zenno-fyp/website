import { motion } from "motion/react";
import { X, Check } from "lucide-react";
import { fadeUp, landingViewport, staggerDelay } from "./landingMotion";

const comparisons = [
  {
    typical: "Screen-time totals",
    zenno: "Flow, debugging, apps & languages from how you actually code",
  },
  {
    typical: "Generic productivity pings",
    zenno: "Zenno Agent nudges shaped by your schedule, focus style, and goals",
  },
  {
    typical: "Charts you never reopen",
    zenno: "Same Developer Trends on web and mobile, plus your live profile",
  },
  {
    typical: "Résumé claims without proof",
    zenno: "Projects, skills, and tools tied to tracked activity, not guesswork",
  },
] as const;

export function WhyDifferent() {
  return (
    <section className="landing-section">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={landingViewport}
          transition={fadeUp(0.82, 0)}
          className="text-center landing-mb-heading"
        >
          <h2 className="landing-h2">Why Zenno feels different</h2>
          <p className="landing-lead mx-auto" style={{ margin: "0 auto", lineHeight: 1.6, maxWidth: "44rem" }}>
            Built around the desktop agent, developer-grade metrics, and a profile that reflects real work, so you get
            clarity without another generic productivity layer.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="landing-grid-2-md mb-6">
            <div className="text-center pb-4 border-b" style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#6F7885",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                Typical trackers
              </h3>
            </div>
            <div className="text-center pb-4 border-b" style={{ borderColor: "rgba(124, 77, 255, 0.3)" }}>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#7C4DFF",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                Zenno
              </h3>
            </div>
          </div>

          {comparisons.map((item, index) => (
            <motion.div
              key={item.typical}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={landingViewport}
              transition={fadeUp(0.75, staggerDelay(index, 0.08))}
              className="landing-grid-2-md py-5 border-b"
              style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
            >
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6F7885" }} />
                <span style={{ fontSize: "1.0625rem", color: "#A7B0BE", lineHeight: 1.5 }}>{item.typical}</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#7C4DFF" }} />
                <span style={{ fontSize: "1.0625rem", color: "#F5F7FA", fontWeight: 600, lineHeight: 1.5 }}>
                  {item.zenno}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
