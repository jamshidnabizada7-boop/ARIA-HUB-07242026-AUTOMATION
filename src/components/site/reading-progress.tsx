'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

// Reading progress bar — a thin gradient line at the top of the viewport
// that fills as the user scrolls down the page.
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-primary via-chart-2 to-chart-3"
      aria-hidden
    />
  );
}
