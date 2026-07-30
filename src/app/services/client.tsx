'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, X, Clock, Tag, ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon, CheckCircle2, MapPin, Building, Link2, Share2, Printer, CalendarDays, ExternalLink, MessageSquare, Briefcase, HelpCircle, Phone, Mail, Award } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/site/section-heading';
import { Icon } from '@/components/site/icon';
import { SmartImage } from '@/components/site/smart-image';
import { DetailModal } from '@/components/site/detail-modal';
import { useT } from '@/hooks/use-t';
import { useLangStore } from '@/lib/lang-store';
import { getLocalizedContent } from '@/lib/i18n-content';
import type { Service } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ServicesClient({
  services,
  currentPage,
  totalPages,
}: {
  services: Service[];
  currentPage: number;
  totalPages: number;
}) {
  const t = useT();
  const router = useRouter();
  const [selected, setSelected] = useState<Service | null>(null);
  
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    router.push(`/services?page=${newPage}`);
  };

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('services.eyebrow') || 'Services'}
          title={t('services.title') || 'What We Offer'}
          subtitle={t('services.subtitle') || 'Explore our comprehensive range of services'}
        />

        {services.length === 0 ? (
          <div className="mt-14 grid place-items-center py-16 text-muted-foreground">{t('empty.services') || 'No services found.'}</div>
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {services.map((s, i) => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: (i % 3) * 0.05 }}
                >
                  <ServiceCard service={s} t={t} onOpen={() => setSelected(s)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2" dir="ltr">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1 px-4 text-sm font-medium">
              <span>Page</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                {currentPage}
              </span>
              <span>of {totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-10 w-10 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
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
  
  const title = getLocalizedContent(service.title, service.titleI18n as any, lang);
  const excerpt = getLocalizedContent(service.excerpt, service.excerptI18n as any, lang);

  const handleMove = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) return;
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
      <Card className="relative overflow-hidden border-border/60 p-0 h-full flex flex-col">
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
        </div>
        <div className="flex flex-col flex-1 p-5 pt-8">
          <h3 dir="auto" className="text-xl font-bold leading-tight transition-colors group-hover:text-primary">{title}</h3>
          <p dir="auto" className="mt-3 line-clamp-2 flex-1 text-sm text-muted-foreground">{excerpt}</p>
          <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">{t('common.viewDetails')}</span>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowRight className="h-4 w-4 rtl-flip" />
            </div>
          </div>
        </div>
      </Card>
    </button>
  );
}

function ServiceDetail({ service, t }: { service: Service; t: (k: string) => string }) {
  const lang = useLangStore((s) => s.code);
  const isRtl = lang === 'fa' || lang === 'ps';
  
  const title = getLocalizedContent(service.title, service.titleI18n as any, lang);
  const description = getLocalizedContent(service.description, service.descriptionI18n as any, lang);
  const features = service.features as string[];
  const unincluded = service.unincluded as string[];

  return (
    <div>
      <div className="relative aspect-[21/9] w-full overflow-hidden">
        <SmartImage src={service.image} alt={title} className="absolute inset-0 h-full w-full" imgClassName="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 text-white sm:bottom-6 sm:left-8 sm:right-8">
          {service.icon && (
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary shadow-lg ring-4 ring-white/10">
              <Icon name={service.icon} className="h-6 w-6 text-primary-foreground" />
            </div>
          )}
          <h2 dir="auto" className="text-2xl font-bold tracking-tight drop-shadow-md sm:text-3xl lg:text-4xl">{title}</h2>
        </div>
      </div>
      <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-8" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-10">
          <div className="lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary">{t('common.overview')}</h3>
            {description && (
              <div dir="auto" className="prose prose-sm max-w-none text-muted-foreground sm:prose-base prose-p:leading-relaxed">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{description}</ReactMarkdown>
              </div>
            )}
          </div>
          <div className="space-y-6">
            {(service.duration || service.price) && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('detail.details')}</h3>
                <div className="space-y-4">
                  {service.duration && (
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-background text-primary"><Clock className="h-4 w-4" /></div>
                      <div><p className="text-[10px] uppercase text-muted-foreground">{t('common.duration')}</p><p className="text-sm font-semibold">{service.duration}</p></div>
                    </div>
                  )}
                  {service.price && (
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-background text-primary"><Tag className="h-4 w-4" /></div>
                      <div><p className="text-[10px] uppercase text-muted-foreground">{t('pricing.price')}</p><p className="text-sm font-semibold">{service.price}</p></div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {features?.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-bold text-foreground">{t('pricing.included')}</h3>
                <ul className="space-y-2">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-chart-2" /><span dir="auto">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {unincluded?.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-bold text-foreground">{t('pricing.notIncluded')}</h3>
                <ul className="space-y-2">
                  {unincluded.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive/70" /><span dir="auto" className="line-through opacity-70">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-chart-2 font-semibold shadow-float" size="lg">
              {t('common.bookCall')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
