import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from './GlassCard';
import { fadeUp, landingViewport, staggerDelay } from './landingMotion';
import { Eye, Shuffle, TrendingDown } from 'lucide-react';

const problems: {
  icon: typeof Eye;
  title: string;
  problem: ReactNode;
  outcome: string;
}[] = [
  {
    icon: Eye,
    title: 'Hidden work patterns',
    problem: (
      <>
        You code all day but still don't know
        <br />
        where your time goes.
      </>
    ),
    outcome: 'Zenno turns passive activity into understandable patterns.'
  },
  {
    icon: Shuffle,
    title: 'Context switching and distraction',
    problem: 'Constant app-hopping fragments your focus without you noticing.',
    outcome: 'See exactly when and how often you lose flow state.'
  },
  {
    icon: TrendingDown,
    title: 'No feedback loop for focus',
    problem: 'You have no way to measure or improve your coding rhythm.',
    outcome: 'Get actionable insights and nudges tailored to your work style.'
  }
];

export function ProblemToOutcome() {
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
          <h2 className="landing-h2">
            You code all day but still don't know
            <br />
            where your time goes.
          </h2>
          <p className="landing-lead max-w-2xl" style={{ margin: '0 auto' }}>
            Zenno transforms hidden patterns into clarity.
          </p>
        </motion.div>

        <div className="landing-grid-3-6">
          {problems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={landingViewport}
              transition={fadeUp(0.78, staggerDelay(index, 0.1))}
            >
              <GlassCard className="landing-pad-card h-full" hover>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{
                    background: 'rgba(91, 111, 216, 0.16)',
                    border: '1px solid rgba(91, 111, 216, 0.3)'
                  }}
                >
                  <item.icon className="w-6 h-6" style={{ color: '#7C4DFF' }} />
                </div>

                <h3
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#F5F7FA',
                    marginBottom: '1rem',
                    fontFamily: 'Space Grotesk, sans-serif'
                  }}
                >
                  {item.title}
                </h3>

                <p style={{ fontSize: '1rem', color: '#6F7885', marginBottom: '1rem', lineHeight: '1.6' }}>
                  {item.problem}
                </p>

                <p style={{ fontSize: '1rem', color: '#A7B0BE', lineHeight: '1.6' }}>
                  {item.outcome}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
