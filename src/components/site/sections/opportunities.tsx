'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, MapPin, Building2, ArrowUpRight, ExternalLink, CheckCircle2, Award, FileText, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '../section-heading';
import { SmartImage } from '../smart-image';
import { DetailModal } from '../detail-modal';
import { useT } from '@/hooks/use-t';
import { useLangStore } from '@/lib/lang-store';
import { getLocalizedContent } from '@/lib/i18n-content';
import type { Opportunity, OpportunityCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

export function OpportunitiesSection({
  opportunities,
  categories,
}: {
  opportunities: Opportunity[];
  categories: OpportunityCategory[];
}) {
  const t = useT();
  const [active, setActive] = useState<string>('all');
  const [selected, setSelected] = useState<Opportunity | null>(null);

  const filtered = active === 'all' ? opportunities : opportunities.filter((o) => o.category?.slug === active);
  const tabs = [{ id: 'all', name: t('common.all') }, ...categories.map((c) => ({ id: c.slug, name: c.name }))];

  return (
    <section id="opportunities" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('opportunities.eyebrow')}
          title={t('opportunities.title')}
          subtitle={t('opportunities.subtitle')}
        />

        {/* Tabs */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
                active === tab.id
                  ? 'border-primary bg-primary text-primary-foreground shadow-float'
                  : 'border-border bg-card/50 text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="mt-10 grid place-items-center py-16 text-muted-foreground">{t('empty.opportunities')}</div>
        ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((o, i) => (
              <motion.div
                key={o.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: (i % 3) * 0.05 }}
              >
                <OpportunityCard opportunity={o} t={t} onOpen={() => setSelected(o)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        )}
      </div>

      <DetailModal open={!!selected} onClose={() => setSelected(null)}>
        {selected && <OpportunityDetail opportunity={selected} t={t} />}
      </DetailModal>
    </section>
  );
}

function OpportunityCard({ opportunity, t, onOpen }: { opportunity: Opportunity; t: (k: string) => string; onOpen: () => void }) {
  const lang = useLangStore((s) => s.code);
  
  // Get localized content
  const title = getLocalizedContent(opportunity.title, opportunity.titleI18n as any, lang);
  const description = getLocalizedContent(opportunity.description, opportunity.descriptionI18n as any, lang);
  
  const deadline = opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border-border/60 p-0 shadow-premium transition-all duration-500 hover:-translate-y-1.5 hover:shadow-float">
      <button onClick={onOpen} className="block w-full text-left">
        <div className="relative aspect-[16/9] overflow-hidden">
          <SmartImage
            src={opportunity.image}
            alt={title}
            className="absolute inset-0 h-full w-full"
            imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            gradient="from-primary/30 via-chart-2/20 to-chart-3/20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          {opportunity.category && (
            <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground backdrop-blur-sm">
              {opportunity.category.name}
            </span>
          )}
          {opportunity.featured && (
            <span className="absolute right-3 top-3 rounded-full bg-chart-4 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
              Featured
            </span>
          )}
        </div>
      </button>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-bold leading-snug">{title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {opportunity.organization && (
            <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{opportunity.organization}</span>
          )}
          {opportunity.country && (
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{opportunity.country}</span>
          )}
        </div>
        <p className="mt-3 line-clamp-2 flex-1 text-sm text-muted-foreground">{description}</p>
        {deadline && (
          <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-accent/60 px-3 py-1.5 text-xs font-medium">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">{t('opportunities.deadline')}:</span>
            <span className="font-semibold">{deadline}</span>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Button onClick={onOpen} variant="outline" size="sm" className="flex-1 rounded-lg text-xs">
            <FileText className="me-1 h-3.5 w-3.5" />{t('detail.viewDetails')}
          </Button>
          <Button asChild size="sm" className="flex-1 rounded-lg bg-gradient-to-r from-primary to-chart-2 text-xs">
            <a href={opportunity.applyUrl || '#contact'} target={opportunity.applyUrl ? '_blank' : undefined}>
              {t('opportunities.apply')}
              <ArrowUpRight className="ms-1 h-3.5 w-3.5 rtl-flip" />
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function OpportunityDetail({ opportunity, t }: { opportunity: Opportunity; t: (k: string) => string }) {
  const lang = useLangStore((s) => s.code);
  
  // Get localized content
  const title = getLocalizedContent(opportunity.title, opportunity.titleI18n as any, lang);
  const description = getLocalizedContent(opportunity.description, opportunity.descriptionI18n as any, lang);
  const eligibility = getLocalizedContent(opportunity.eligibility, opportunity.eligibilityI18n as any, lang);
  const benefits = getLocalizedContent(opportunity.benefits, opportunity.benefitsI18n as any, lang);
  
  const deadline = opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;
  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden">
        <SmartImage src={opportunity.image} alt={title} className="absolute inset-0 h-full w-full" imgClassName="h-full w-full object-cover" gradient="from-primary/30 via-chart-2/20 to-chart-3/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 text-white">
          {opportunity.category && (
            <span className="rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm">{opportunity.category.name}</span>
          )}
          <h2 className="mt-2 text-2xl font-bold drop-shadow sm:text-3xl">{title}</h2>
        </div>
      </div>

      <div className="max-h-[55vh] overflow-y-auto p-6 sm:p-8">
        {/* Meta row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {opportunity.organization && (
            <MetaItem icon={Building2} label="Organization" value={opportunity.organization} />
          )}
          {opportunity.country && (
            <MetaItem icon={MapPin} label="Location" value={opportunity.country} />
          )}
          {deadline && (
            <MetaItem icon={CalendarDays} label={t('opportunities.deadline')} value={deadline} />
          )}
          {opportunity.website && (
            <a href={opportunity.website} target="_blank" rel="noopener noreferrer" className="flex flex-col rounded-xl border border-border/60 bg-accent/30 p-3 transition-colors hover:border-primary/40">
              <Globe className="mb-1 h-4 w-4 text-primary" />
              <p className="text-[10px] font-medium uppercase text-muted-foreground">Website</p>
              <p className="truncate text-xs font-bold text-primary">Visit ↗</p>
            </a>
          )}
        </div>

        {description && (
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Overview</h3>
            <p className="text-sm leading-relaxed text-foreground/80">{description}</p>
          </div>
        )}

        {eligibility && (
          <div className="mt-5 rounded-xl border border-border/60 bg-accent/20 p-4">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold"><CheckCircle2 className="h-4 w-4 text-chart-3" />Eligibility</h3>
            <p className="text-sm leading-relaxed text-foreground/80">{eligibility}</p>
          </div>
        )}

        {benefits && (
          <div className="mt-4 rounded-xl border border-border/60 bg-accent/20 p-4">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold"><Award className="h-4 w-4 text-chart-4" />Benefits</h3>
            <p className="text-sm leading-relaxed text-foreground/80">{benefits}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {opportunity.applyUrl && (
            <Button asChild className="h-11 rounded-xl bg-gradient-to-r from-primary to-chart-2">
              <a href={opportunity.applyUrl} target="_blank" rel="noopener noreferrer">
                {t('opportunities.apply')}<ArrowUpRight className="ms-2 h-4 w-4 rtl-flip" />
              </a>
            </Button>
          )}
          {opportunity.website && (
            <Button asChild variant="outline" className="h-11 rounded-xl">
              <a href={opportunity.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="me-2 h-4 w-4" />Visit Website
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-border/60 bg-accent/30 p-3">
      <Icon className="mb-1 h-4 w-4 text-primary" />
      <p className="text-[10px] font-medium uppercase text-muted-foreground">{label}</p>
      <p className="text-xs font-bold">{value}</p>
    </div>
  );
}
