import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { LANDING_DEVELOPER_TRENDS_WEEK } from './landingChartData';
import { LandingDeveloperTrendsChart } from './LandingDeveloperTrendsChart';
import { CATEGORY_COLORS } from './analyticsTheme';
import { fadeUp } from './landingMotion';

const heroFlowWeekTotal = LANDING_DEVELOPER_TRENDS_WEEK.reduce((a, p) => a + p.flow_hours, 0);

const trendData = [
  { id: 'w1', week: 'W1', value: 32 },
  { id: 'w2', week: 'W2', value: 38 },
  { id: 'w3', week: 'W3', value: 35 },
  { id: 'w4', week: 'W4', value: 42 },
  { id: 'w5', week: 'W5', value: 45 },
];

export function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative landing-hero overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]"
          style={{ background: 'rgba(91, 111, 216, 0.15)' }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px]"
          style={{ background: 'rgba(124, 77, 255, 0.1)' }}
          animate={{
            x: [0, -40, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="landing-hero-columns w-full">
          {/* Left side */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={fadeUp(0.88, 0.14)}
          >
            <h1 className="landing-h1 mb-6 tracking-tight">
              Clarity for Your Coding Habits. Focus for Your Best Work.
            </h1>

            <p className="landing-lead mb-8 max-w-lg">
              Zenno tracks your desktop activity, maps your focus patterns across apps, languages, and projects, then delivers AI nudges that respect your rhythm, helping you code with more awareness and intention.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={() => navigate('/auth')}
                className="rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'nowrap',
                  gap: '0.5rem',
                  whiteSpace: 'nowrap',
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #5B6FD8 0%, #7C4DFF 100%)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  boxShadow: '0 8px 24px rgba(91, 111, 216, 0.3)',
                }}
              >
                <span>Join Now</span>
                <ArrowRight
                  className="shrink-0"
                  style={{ width: '1.375rem', height: '1.375rem' }}
                  aria-hidden
                />
              </button>
            </div>

            <div className="flex flex-wrap gap-6" style={{ color: '#9CA3AF', fontSize: '0.9375rem' }}>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" style={{ color: '#7C4DFF' }} />
                <span>Privacy-aware tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" style={{ color: '#7C4DFF' }} />
                <span>Built for developers</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" style={{ color: '#7C4DFF' }} />
                <span>Actionable AI nudges</span>
              </div>
            </div>
          </motion.div>

          {/* Right side - Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 36, rotateX: 12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={fadeUp(1.05, 0.32)}
            className="relative"
            style={{ perspective: '1000px' }}
          >
            <div className="relative">
              {/* Main dashboard card */}
              <GlassCard className="landing-pad-card mb-4">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div style={{ color: '#6F7885', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      Flow Hours This Week
                    </div>
                    <div className="landing-hero-stat-xl">
                      {heroFlowWeekTotal.toFixed(1)}h
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full" style={{
                    background: 'rgba(124, 77, 255, 0.16)',
                    color: '#7C4DFF',
                    fontSize: '0.875rem'
                  }}>
                    +12%
                  </div>
                </div>
                <LandingDeveloperTrendsChart
                  data={LANDING_DEVELOPER_TRENDS_WEEK}
                  height={140}
                  mode="flow_only"
                  showLegend={false}
                />
              </GlassCard>

              {/* Floating mini cards */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={fadeUp(0.82, 0.72)}
                >
                  <GlassCard className="p-4">
                    <div style={{ color: '#6F7885', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                      Top Language
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F5F7FA' }}>
                      TypeScript
                    </div>
                    <div style={{ color: '#7C4DFF', fontSize: '0.875rem' }}>
                      62% usage
                    </div>
                  </GlassCard>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={fadeUp(0.82, 0.82)}
                >
                  <GlassCard className="p-4">
                    <div style={{ color: '#6F7885', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                      Nudges Sent
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F5F7FA' }}>
                      12
                    </div>
                    <ResponsiveContainer width="100%" height={40}>
                      <LineChart data={trendData}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={CATEGORY_COLORS.flow}
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive
                          animationDuration={1100}
                          animationEasing="ease-out"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </GlassCard>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
