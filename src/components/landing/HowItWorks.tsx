import { Fragment } from "react";
import { motion } from "motion/react";
import { Monitor, BarChart2, LayoutDashboard, Sparkles } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { fadeUp, landingViewport, staggerDelay } from "./landingMotion";

const steps = [
  {
    icon: Monitor,
    title: "Zenno runs quietly on desktop",
    description:
      "The desktop agent captures focus time, apps, and languages locally. It stays lightweight and built to stay out of your flow.",
  },
  {
    icon: BarChart2,
    title: "Activity becomes metrics you can use",
    description:
      "We organize time into flow, debugging, meetings, and more, using the same signals that power your performance and trend views.",
  },
  {
    icon: LayoutDashboard,
    title: "Your dashboard ties it together",
    description:
      "Open the web app for metrics, trends, apps & languages, skills and projects, with patterns for the week in one place.",
  },
  {
    icon: Sparkles,
    title: "Zenno Agent nudges when it helps",
    description:
      "Configure the agent in-app; get reminders that respect your schedule and preferences, not generic noise.",
  },
];

function HorizontalConnector() {
  return (
    <div
      className="flex items-center justify-center shrink-0 self-stretch"
      style={{ width: "clamp(1rem, 2.5vw, 2rem)", padding: "0 2px" }}
      aria-hidden
    >
      <div
        style={{
          height: "2px",
          width: "100%",
          minWidth: "1rem",
          borderRadius: "1px",
          background:
            "linear-gradient(90deg, rgba(124, 77, 255, 0.2) 0%, rgba(124, 77, 255, 0.9) 35%, rgba(91, 111, 216, 0.75) 65%, rgba(124, 77, 255, 0.2) 100%)",
          boxShadow: "0 0 12px rgba(124, 77, 255, 0.25)",
        }}
      />
    </div>
  );
}

function StepCard({ step }: { step: (typeof steps)[0] }) {
  const Icon = step.icon;
  return (
    <GlassCard className="landing-step-card-pad h-full" hover>
      <div
        className="flex flex-col items-center text-center"
        style={{ gap: "0.75rem" }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
          style={{
            background: "rgba(91, 111, 216, 0.16)",
            border: "1px solid rgba(91, 111, 216, 0.35)",
            boxShadow: "inset 0 1px 0 rgba(124, 77, 255, 0.08)",
          }}
        >
          <Icon
            className="w-7 h-7"
            style={{ color: "#7C4DFF" }}
            strokeWidth={1.75}
          />
        </div>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "#F5F7FA",
            lineHeight: 1.35,
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          {step.title}
        </h3>
        <p
          style={{
            fontSize: "0.875rem",
            color: "#A7B0BE",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {step.description}
        </p>
      </div>
    </GlassCard>
  );
}

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="landing-section"
      style={{ background: "#0F0F14" }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={landingViewport}
          transition={fadeUp(0.82, 0)}
          className="text-center landing-mb-heading"
        >
          <h2
            style={{
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              fontWeight: 700,
              color: "#F5F7FA",
              fontFamily: "Space Grotesk, sans-serif",
              marginBottom: "1rem",
            }}
          >
            How It Works
          </h2>
          <p className="landing-lead max-w-2xl mx-auto" style={{ margin: "0 auto", lineHeight: 1.6 }}>
            Desktop agent, web dashboard, and Zenno Agent, wired the same way as
            the product you use every day.
          </p>
        </motion.div>

        {/* Horizontal row at all breakpoints; narrow viewports scroll sideways */}
        <div className="how-it-works-row">
          {steps.map((step, index) => (
            <Fragment key={step.title}>
              <motion.div
                className="how-it-works-step"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={landingViewport}
                transition={fadeUp(0.72, staggerDelay(index, 0.07))}
              >
                <StepCard step={step} />
              </motion.div>
              {index < steps.length - 1 ? <HorizontalConnector /> : null}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
