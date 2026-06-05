/**
 * Shared motion presets for landing sections: smooth ease-out, consistent timing.
 */
export const LANDING_EASE = [0.22, 1, 0.36, 1] as const;

/** Viewport: trigger once, slightly before full entry for a softer reveal */
export const landingViewport = {
  once: true,
  amount: 0.3,
  margin: "-40px 0px" as const,
};

export function fadeUp(duration = 0.85, delay = 0) {
  return {
    duration,
    delay,
    ease: LANDING_EASE,
  };
}

export function fadeSlide(duration = 0.85, delay = 0) {
  return { duration, delay, ease: LANDING_EASE };
}

export function staggerDelay(index: number, step = 0.065) {
  return index * step;
}
