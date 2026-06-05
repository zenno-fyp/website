import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { fadeUp, landingViewport } from './landingMotion';

export function FinalCTA() {
  const navigate = useNavigate();
  return (
    <section className="landing-section">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={landingViewport}
          transition={fadeUp(0.95, 0)}
          className="relative rounded-3xl overflow-hidden text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(91, 111, 216, 0.2) 0%, rgba(124, 77, 255, 0.15) 100%)',
            border: '1px solid rgba(124, 77, 255, 0.3)',
            boxShadow: '0 20px 60px rgba(91, 111, 216, 0.2)',
            /* Explicit padding: large Tailwind p-* values are not in the app CSS bundle */
            padding: 'clamp(2.75rem, 7vw, 5.5rem) clamp(1.75rem, 6vw, 4.5rem)',
          }}
        >
          {/* Animated background glow */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(124, 77, 255, 0.15), transparent 70%)'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <div
            className="relative z-10"
            style={{
              maxWidth: '52rem',
              marginLeft: 'auto',
              marginRight: 'auto',
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 4.5vw, 3.5rem)',
                fontWeight: 700,
                color: '#F5F7FA',
                fontFamily: 'Space Grotesk, sans-serif',
                lineHeight: 1.2,
                marginBottom: '1.75rem',
              }}
            >
              Build with more awareness. Focus with more intention.
            </h2>

            <p
              className="landing-lead-lg max-w-2xl mx-auto"
              style={{
                marginBottom: '2.25rem',
              }}
            >
              Join developers who are gaining clarity on their coding habits and reclaiming their focus.
            </p>

            <div className="flex flex-wrap justify-center" style={{ marginTop: '0.5rem' }}>
              <button
                onClick={() => navigate('/auth')}
                className="rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'nowrap',
                  gap: '0.5rem',
                  whiteSpace: 'nowrap',
                  padding: '1.125rem 2.25rem',
                  background: 'linear-gradient(135deg, #5B6FD8 0%, #7C4DFF 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  boxShadow: '0 8px 32px rgba(91, 111, 216, 0.4)',
                }}
              >
                <span>Join Now</span>
                <ArrowRight
                  className="shrink-0"
                  style={{ width: '1.5rem', height: '1.5rem' }}
                  aria-hidden
                />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
