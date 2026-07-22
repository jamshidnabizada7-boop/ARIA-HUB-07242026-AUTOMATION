'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe2, Zap, ShieldCheck, BadgeDollarSign, Users2, Award, ArrowUpRight } from 'lucide-react';
import { SectionHeading } from '../section-heading';
import { useT } from '@/hooks/use-t';
import { cn } from '@/lib/utils';

export function WhyChooseUsSection() {
  const t = useT();
  const features = [
    { icon: Globe2, key: 'f1', color: 'from-primary to-chart-2', glow: 'bg-primary/20' },
    { icon: Zap, key: 'f2', color: 'from-chart-2 to-chart-3', glow: 'bg-chart-2/20' },
    { icon: ShieldCheck, key: 'f3', color: 'from-chart-3 to-chart-4', glow: 'bg-chart-3/20' },
    { icon: BadgeDollarSign, key: 'f4', color: 'from-chart-4 to-primary', glow: 'bg-chart-4/20' },
    { icon: Users2, key: 'f5', color: 'from-primary to-chart-4', glow: 'bg-primary/20' },
    { icon: Award, key: 'f6', color: 'from-chart-2 to-primary', glow: 'bg-chart-2/20' },
  ];

  return (
    <section id="why-choose-us" className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute -left-40 top-1/3 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-40 bottom-1/3 h-80 w-80 rounded-full bg-chart-2/5 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('why.eyebrow')}
          title={t('why.title')}
          subtitle={t('why.subtitle')}
        />
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            >
              <FeatureCard feature={f} index={i} t={t} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index, t }: { feature: any; index: number; t: (k: string) => string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, on: false });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSpotlight({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
      on: true,
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setSpotlight((s) => ({ ...s, on: false }))}
      className="group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-float"
    >
      {/* Cursor spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: spotlight.on
            ? `radial-gradient(300px circle at ${spotlight.x}% ${spotlight.y}%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 70%)`
            : 'transparent',
        }}
      />

      {/* Number badge */}
      <span className="absolute right-5 top-5 text-5xl font-black leading-none text-foreground/5 transition-colors group-hover:text-foreground/10">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Icon with animated rings */}
      <div className="relative mb-5 inline-block">
        {/* Pulsing ring */}
        <span className={cn('absolute inset-0 rounded-2xl blur-md transition-opacity duration-500 group-hover:opacity-100', feature.glow)} />
        <div className={cn('relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-float transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6', feature.color)}>
          <feature.icon className="h-5 w-5 transition-transform duration-500 group-hover:scale-110" />
        </div>
        {/* Rotating ring on hover */}
        <motion.span
          className="absolute -inset-1 rounded-2xl border border-dashed border-primary/30 opacity-0 group-hover:opacity-100"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <h3 className="relative text-lg font-bold">{t(`why.${feature.key}.title`)}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{t(`why.${feature.key}.desc`)}</p>

      {/* Arrow that appears on hover */}
      <ArrowUpRight className="absolute bottom-5 right-5 h-5 w-5 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 rtl-flip" style={{ transform: 'translateX(-8px)' }} />
    </div>
  );
}
