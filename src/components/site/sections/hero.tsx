'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Play, Sparkles, Star, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/hooks/use-t';
import type { Counter } from '@/lib/types';
import { SmartImage } from '../smart-image';
import { MagneticButton } from '../magnetic-button';

export function Hero({ counters }: { counters: Counter[] }) {
  const t = useT();
  const sectionRef = useRef<HTMLElement>(null);
  const stat1 = counters.find((c) => c.label.toLowerCase().includes('client') || c.label.toLowerCase().includes('project')) || counters[0];
  const stat2 = counters[1] || counters[0];
  const showStat2 = !!stat1 && !!stat2 && stat1.id !== stat2.id;

  // Mouse parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });

  // Layers move at different rates for depth
  const orb1X = useTransform(sx, [-0.5, 0.5], [-30, 30]);
  const orb1Y = useTransform(sy, [-0.5, 0.5], [-20, 20]);
  const orb2X = useTransform(sx, [-0.5, 0.5], [25, -25]);
  const orb2Y = useTransform(sy, [-0.5, 0.5], [15, -15]);
  const globeX = useTransform(sx, [-0.5, 0.5], [-12, 12]);
  const globeY = useTransform(sy, [-0.5, 0.5], [-12, 12]);
  const card1X = useTransform(sx, [-0.5, 0.5], [18, -18]);
  const card1Y = useTransform(sy, [-0.5, 0.5], [12, -12]);
  const card2X = useTransform(sx, [-0.5, 0.5], [-16, 16]);
  const card2Y = useTransform(sy, [-0.5, 0.5], [-10, 10]);

  // Spotlight position (CSS custom props)
  const [spotlight, setSpotlight] = useState({ x: 50, y: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = sectionRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    mx.set(px - 0.5);
    my.set(py - 0.5);
    setSpotlight({ x: px * 100, y: py * 100 });
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      onMouseMove={handleMouseMove}
      className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-16"
    >
      {/* Background layers */}
      <div className="absolute inset-0 -z-10">
        <SmartImage
          src="/images/hero/hero-bg.png"
          alt=""
          priority={true}
          className="absolute inset-0 h-full w-full opacity-60 dark:opacity-80"
          imgClassName="h-full w-full object-cover"
          gradient="from-primary/40 via-chart-2/30 to-background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background dark:from-background/30 dark:via-background/50 dark:to-background" />
        <div className="absolute inset-0 bg-grid opacity-[0.15]" />
        {/* Spotlight overlay */}
        <div
          className="absolute inset-0 opacity-40 transition-opacity duration-300 dark:opacity-60"
          style={{
            background: `radial-gradient(600px circle at ${spotlight.x}% ${spotlight.y}%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 60%)`,
          }}
        />
        {/* floating orbs with parallax */}
        <motion.div
          style={{ x: orb1X, y: orb1Y }}
          className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-float-slow"
        />
        <motion.div
          style={{ x: orb2X, y: orb2Y, animationDelay: '2s' }}
          className="absolute -right-32 bottom-1/4 h-[28rem] w-[28rem] rounded-full bg-chart-2/20 blur-3xl animate-float-slow"
        />
      </div>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* Left: copy */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t('hero.badge')}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 text-balance text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            {t('hero.title')}{' '}
            <span className="text-gradient">{t('hero.titleHighlight')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <MagneticButton
              href="#services"
              className="group inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-chart-2 px-6 text-base font-semibold text-primary-foreground shadow-float transition-opacity hover:opacity-90"
            >
              {t('hero.ctaPrimary')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl-flip" />
            </MagneticButton>
            <MagneticButton
              href="#contact"
              className="group inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-card/50 px-6 text-base font-semibold backdrop-blur-sm transition-colors hover:bg-accent"
            >
              <Play className="h-4 w-4 fill-current" />
              {t('hero.ctaSecondary')}
            </MagneticButton>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center gap-6"
          >
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-chart-4 text-chart-4" />
              ))}
              <span className="ms-1 text-sm font-medium">{t('hero.ratingText')}</span>
            </div>
            <div className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
              <span className="inline-flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> {t('hero.bankSecurity')}</span>
              <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-chart-2" /> {t('hero.fastProcessing')}</span>
            </div>
          </motion.div>
        </div>

        {/* Right: visual with parallax */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative lg:col-span-5"
        >
          <div className="relative mx-auto aspect-square max-w-md">
            <motion.div
              style={{ x: globeX, y: globeY }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-primary/30 to-chart-2/30 blur-2xl" />
              <div className="glass-card relative h-full overflow-hidden rounded-[2.5rem] shadow-premium">
                <SmartImage
                  src="/images/hero/hero-globe.png"
                  alt="Global network"
                  priority={true}
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover"
                  gradient="from-primary/30 via-chart-2/20 to-chart-3/20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>
            </motion.div>

            {/* Floating stat cards with parallax */}
            <motion.div
              style={{ x: card1X, y: card1Y }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-6 top-1/4 glass-card rounded-2xl p-3 shadow-float"
            >
              <p className="text-2xl font-black text-gradient-static">{stat1?.value}{stat1?.suffix}</p>
              <p className="text-[11px] font-medium text-muted-foreground">{stat1?.label}</p>
            </motion.div>
            {showStat2 && (
            <motion.div
              style={{ x: card2X, y: card2Y }}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -right-4 bottom-1/4 glass-card rounded-2xl p-3 shadow-float"
            >
              <p className="text-2xl font-black text-gradient-static">{stat2?.value}{stat2?.suffix}</p>
              <p className="text-[11px] font-medium text-muted-foreground">{stat2?.label}</p>
            </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        aria-hidden="true"
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <div className="flex h-9 w-5 items-start justify-center rounded-full border-2 border-foreground/30 p-1">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-1.5 w-1.5 rounded-full bg-foreground/60"
          />
        </div>
      </motion.div>
    </section>
  );
}
