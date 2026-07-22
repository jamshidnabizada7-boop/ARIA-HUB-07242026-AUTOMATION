'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, X, Clock, Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '../section-heading';
import { Icon } from '../icon';
import { SmartImage } from '../smart-image';
import { DetailModal } from '../detail-modal';
import { useT } from '@/hooks/use-t';
import { useLangStore } from '@/lib/lang-store';
import { getLocalizedContent } from '@/lib/i18n-content';
import type { Service } from '@/lib/types';

export function ServicesSection({ services }: { services: Service[] }) {
  const t = useT();
  const [selected, setSelected] = useState<Service | null>(null);

  return (
    <section id="services" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-dots opacity-[0.4] mask-fade-b" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('services.eyebrow')}
          title={t('services.title')}
          subtitle={t('services.subtitle')}
        />
        {services.length === 0 ? (
          <div className="mt-14 grid place-items-center py-16 text-muted-foreground">{t('empty.services')}</div>
        ) : (
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            >
              <ServiceCard service={s} t={t} onOpen={() => setSelected(s)} />
            </motion.div>
          ))}
        </div>
        )}
      </div>

      <DetailModal open={!!selected} onClose={() => setSelected(null)}>
        {selected && <ServiceDetail service={selected} t={t} />}
      </DetailModal>
    </section>
  );
}

function ServiceCard({ service, t, onOpen }: { service: Service; t: (k: string) => string; onOpen: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const lang = useLangStore((s) => s.code);
  
  // Get localized content
  const title = getLocalizedContent(service.title, service.titleI18n as any, lang);
  const excerpt = getLocalizedContent(service.excerpt, service.excerptI18n as any, lang);

  // 3D tilt on mouse move
  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-6px)`;
  };
  const handleLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = '';
  };

  return (
    <button
      ref={ref}
      onClick={onOpen}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="group relative block w-full overflow-hidden rounded-3xl text-left shadow-premium transition-[transform,box-shadow] duration-200 will-change-transform hover:shadow-float"
      style={{ transition: 'transform 0.2s ease, box-shadow 0.5s ease' }}
    >
      <Card className="relative overflow-hidden border-border/60 p-0">
        {/* image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <SmartImage
            src={service.image}
            alt={title}
            className="absolute inset-0 h-full w-full"
            imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            gradient="from-primary/25 via-chart-2/15 to-chart-3/15"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          {service.icon && (
            <div className="absolute -bottom-5 left-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-chart-2 text-primary-foreground shadow-float ring-4 ring-card">
              <Icon name={service.icon} className="h-5 w-5" />
            </div>
          )}
          {service.featured && (
            <span className="absolute right-3 top-3 rounded-full bg-chart-4/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-black backdrop-blur-sm">
              Featured
            </span>
          )}
        </div>
        {/* content */}
        <div className="p-5 pt-8">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold leading-snug">{title}</h3>
            {service.price && (
              <span className="shrink-0 rounded-lg bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">
                {service.price}
              </span>
            )}
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{excerpt}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            {t('services.explore')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl-flip" />
          </span>
        </div>
        {/* hover glow */}
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </Card>
    </button>
  );
}

function ServiceDetail({ service, t }: { service: Service; t: (k: string) => string }) {
  const lang = useLangStore((s) => s.code);
  
  // Get localized content
  const title = getLocalizedContent(service.title, service.titleI18n as any, lang);
  const excerpt = getLocalizedContent(service.excerpt, service.excerptI18n as any, lang);
  const description = getLocalizedContent(service.description, service.descriptionI18n as any, lang);
  
  const gallery: string[] = service.gallery ? ((): string[] => { try { return JSON.parse(service.gallery); } catch { return []; } })() : [];
  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden">
        <SmartImage
          src={service.image}
          alt={title}
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover"
          gradient="from-primary/30 via-chart-2/20 to-chart-3/20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        {service.icon && (
          <div className="absolute bottom-5 left-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-chart-2 text-primary-foreground shadow-float ring-4 ring-card">
            <Icon name={service.icon} className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="max-h-[55vh] overflow-y-auto p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {service.category && (
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                <Tag className="h-3 w-3" />{service.category.name}
              </span>
            )}
            <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
          </div>
          {service.price && (
            <span className="rounded-xl bg-gradient-to-r from-primary to-chart-2 px-4 py-2 text-sm font-bold text-primary-foreground shadow-float">
              {service.price}
            </span>
          )}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{excerpt}</p>
        <div className="mt-4 prose prose-sm max-w-none text-foreground/80">
          <p className="whitespace-pre-line leading-relaxed">{description}</p>
        </div>

        {gallery.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-2">
            {gallery.slice(0, 3).map((g, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                <SmartImage src={g} alt="" className="absolute inset-0 h-full w-full" imgClassName="h-full w-full object-cover" gradient="from-primary/20 to-chart-2/20" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="h-11 rounded-xl bg-gradient-to-r from-primary to-chart-2">
            <a href="#contact">{t('nav.getStarted')}<ArrowRight className="ms-2 h-4 w-4 rtl-flip" /></a>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-xl">
            <a href="#contact"><Clock className="me-2 h-4 w-4" />Book a call</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
