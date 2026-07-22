'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionIndicatorProps {
  sections: { id: string; label: string }[];
}

// Vertical dot indicator on the right side that shows current section
// and allows quick navigation. Hidden on mobile and when hero is in view.
export function SectionIndicator({ sections }: SectionIndicatorProps) {
  const [active, setActive] = useState<string>('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      setVisible(scrollY > window.innerHeight * 0.8);

      // Find active section
      let current = '';
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top <= window.innerHeight * 0.4 && r.bottom >= window.innerHeight * 0.4) {
            current = s.id;
          }
        }
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [sections]);

  if (sections.length === 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-2 lg:flex"
          aria-label="Section navigation"
        >
          {sections.map((s) => {
            const isActive = active === s.id;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="group flex items-center gap-2"
                aria-label={s.label}
              >
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-medium opacity-0 transition-all duration-200 group-hover:opacity-100',
                    isActive ? 'bg-card text-foreground shadow-float' : 'bg-card/80 text-muted-foreground'
                  )}
                >
                  {s.label}
                </span>
                <span
                  className={cn(
                    'block rounded-full transition-all duration-300',
                    isActive
                      ? 'h-6 w-1.5 bg-gradient-to-b from-primary to-chart-2'
                      : 'h-1.5 w-1.5 bg-border group-hover:bg-primary/60'
                  )}
                />
              </a>
            );
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
