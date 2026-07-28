'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, MapPin, Building2, ArrowUpRight, ExternalLink, CheckCircle2, Award, FileText, Globe, Briefcase, DollarSign, GraduationCap, Clock, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/site/section-heading';
import { SmartImage } from '@/components/site/smart-image';
import { DetailModal } from '@/components/site/detail-modal';
import { useT } from '@/hooks/use-t';
import { useLangStore } from '@/lib/lang-store';
import { getLocalizedContent } from '@/lib/i18n-content';
import type { Opportunity, OpportunityCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

export function OpportunitiesClient({
  opportunities,
  categories,
  currentPage,
  totalPages,
  currentCategory,
  phone,
}: {
  opportunities: Opportunity[];
  categories: OpportunityCategory[];
  currentPage: number;
  totalPages: number;
  currentCategory: string;
  phone?: string | null;
}) {
  const t = useT();
  const router = useRouter();
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const lang = useLangStore((s) => s.code);
  const isRtl = lang === 'fa' || lang === 'ps';

  const tabs = [{ id: 'all', name: t('common.all') || 'All' }, ...categories.map((c) => ({ id: c.slug, name: c.name }))];

  const handleTabClick = (tabId: string) => {
    router.push(`/opportunities?category=${tabId}&page=1`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    router.push(`/opportunities?category=${currentCategory}&page=${newPage}`);
  };

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('opportunities.eyebrow') || 'Opportunities'}
          title={t('opportunities.title') || 'Latest Opportunities'}
          subtitle={t('opportunities.subtitle') || 'Browse all available jobs, scholarships, and programs.'}
        />

        {/* Tabs */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
                currentCategory === tab.id
                  ? 'border-primary bg-primary text-primary-foreground shadow-float'
                  : 'border-border bg-card/50 text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        {opportunities.length === 0 ? (
          <div className="mt-10 grid place-items-center py-16 text-muted-foreground">{t('empty.opportunities') || 'No opportunities found.'}</div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {opportunities.map((o, i) => (
                <motion.div
                  key={o.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: (i % 3) * 0.05 }}
                >
                  <OpportunityCard opportunity={o} t={t} phone={phone} onOpen={() => setSelected(o)} />
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
        {selected && <OpportunityDetail opportunity={selected} t={t} phone={phone} />}
      </DetailModal>
    </section>
  );
}

// Below are copied from the original opportunities section

function OpportunityCard({ opportunity, t, onOpen, phone }: { opportunity: Opportunity; t: (k: string) => string; onOpen: () => void; phone?: string | null }) {
  const lang = useLangStore((s) => s.code);
  
  const title = getLocalizedContent(opportunity.title, opportunity.titleI18n as any, lang);
  const description = getLocalizedContent(opportunity.description, opportunity.descriptionI18n as any, lang);
  
  const deadline = opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : null;
  const plainDescription = description ? description.replace(/<[^>]*>?/gm, '') : '';

  const whatsappMessage = `Hello ARIA HUB! I am interested in applying for this opportunity:\n\nTitle: ${title}\nSource: ${opportunity.sourceName || 'ARIA HUB'}`;
  const applyLink = phone ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}` : opportunity.applyUrl;

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
        <h3 dir="auto" className="line-clamp-2 text-base font-bold leading-tight transition-colors group-hover:text-primary">{title}</h3>
        <p dir="auto" className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-2">{plainDescription}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-medium text-muted-foreground">
          {opportunity.organization && (
            <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{opportunity.organization}</span>
          )}
          {opportunity.country && (
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{opportunity.country}</span>
          )}
        </div>
        {deadline && (
          <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-accent/60 px-3 py-1.5 text-xs font-medium">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">{t('opportunities.deadline') || 'Deadline'}:</span>
            <span className="font-semibold">{deadline}</span>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Button onClick={onOpen} variant="outline" size="sm" className="flex-1 rounded-lg text-xs">
            <FileText className="me-1 h-3.5 w-3.5" />{t('detail.viewDetails') || 'View Details'}
          </Button>
          {applyLink && (
            <Button asChild size="sm" className="flex-1 rounded-lg bg-gradient-to-r from-primary to-chart-2 text-xs">
              <a href={applyLink} target="_blank" rel="noopener noreferrer">
                {t('opportunities.apply') || 'Apply Now'}
                <ArrowUpRight className="ms-1 h-3.5 w-3.5 rtl-flip" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

const FormattedContent = ({ content }: { content: string }) => {
  if (!content) return null;
  
  if (/<(p|ul|ol|li|br|div|h[1-6])[>\s]/i.test(content)) {
    return <div dir="auto" className="text-sm leading-relaxed text-foreground/80 space-y-4 whitespace-pre-wrap [&_*]:!bg-transparent" dangerouslySetInnerHTML={{ __html: content }} />;
  }

  const cleanLine = (l: string) => l.replace(/^\s*#+\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1').trim();
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  
  if (lines.length === 1) {
    return <p dir="auto" className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{cleanLine(lines[0])}</p>;
  }

  return (
    <ul dir="auto" className="space-y-2 text-sm leading-relaxed text-foreground/80">
      {lines.map((rawLine, i) => {
        let line = cleanLine(rawLine);
        const isHeading = rawLine.startsWith('#') || line.endsWith(':');
        
        if (line.startsWith('- ') || line.startsWith('* ')) {
          line = line.substring(2).trim();
        }

        if (isHeading) {
          return <li key={i} dir="auto" className="mt-4 font-semibold text-foreground list-none">{line}</li>;
        }
        
        return (
          <li key={i} dir="auto" className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span className="flex-1 whitespace-pre-wrap">{line}</span>
          </li>
        );
      })}
    </ul>
  );
};

function OpportunityDetail({ opportunity, t, phone }: { opportunity: Opportunity; t: (k: string) => string; phone?: string | null }) {
  const lang = useLangStore((s) => s.code);
  const isRtl = lang === 'fa' || lang === 'ps';
  
  const title = getLocalizedContent(opportunity.title, opportunity.titleI18n as any, lang);
  const description = getLocalizedContent(opportunity.description, opportunity.descriptionI18n as any, lang);
  const eligibility = getLocalizedContent(opportunity.eligibility, opportunity.eligibilityI18n as any, lang);
  const benefits = getLocalizedContent(opportunity.benefits, opportunity.benefitsI18n as any, lang);
  const requirements = getLocalizedContent(opportunity.requirements, opportunity.requirementsI18n as any, lang);
  const responsibilities = getLocalizedContent(opportunity.responsibilities, opportunity.responsibilitiesI18n as any, lang);
  const guidelines = getLocalizedContent((opportunity as any).guidelines, (opportunity as any).guidelinesI18n, lang);
  
  const jobType = getLocalizedContent(opportunity.jobType, opportunity.jobTypeI18n as any, lang);
  const salary = getLocalizedContent(opportunity.salary, opportunity.salaryI18n as any, lang);
  const educationReq = getLocalizedContent(opportunity.educationReq, opportunity.educationReqI18n as any, lang);
  const experience = getLocalizedContent(opportunity.experience, opportunity.experienceI18n as any, lang);

  const translateKey = (key: string) => {
    const map: Record<string, {fa: string, ps: string}> = {
      'Organization': {fa: 'سازمان', ps: 'سازمان'},
      'Location': {fa: 'موقعیت', ps: 'موقعیت'},
      'Job Type': {fa: 'نوع شغل', ps: 'د دندې ډول'},
      'Salary': {fa: 'معاش', ps: 'معاش'},
      'Education': {fa: 'تحصیلات', ps: 'زده کړه'},
      'Experience': {fa: 'تجربه', ps: 'تجربه'},
      'Vacancy Number': {fa: 'شماره بست', ps: 'د بست شمیره'},
      'No. of Jobs': {fa: 'تعداد بست', ps: 'د دندو شمیر'},
      'City': {fa: 'شهر', ps: 'ښار'},
      'Contract Duration': {fa: 'مدت قرارداد', ps: 'د قرارداد موده'},
      'Gender': {fa: 'جنسیت', ps: 'جنسیت'},
      'Nationality': {fa: 'ملیت', ps: 'تابعیت'},
      'Employment Type': {fa: 'نوع استخدام', ps: 'د کار ډول'},
      'Category': {fa: 'دسته بندی', ps: 'کټګورۍ'},
    };
    if (lang === 'fa') return map[key]?.fa || key;
    if (lang === 'ps') return map[key]?.ps || key;
    return key;
  };
  
  const getExtractedDataValue = (key: string, defaultVal: any) => {
    if (lang === 'en') return defaultVal;
    if (opportunity.extractedDataI18n && (opportunity.extractedDataI18n as any)[lang] && (opportunity.extractedDataI18n as any)[lang][key]) {
      return (opportunity.extractedDataI18n as any)[lang][key];
    }
    return defaultVal;
  };
  
  const deadline = opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;

  const whatsappMessage = `Hello ARIA HUB! I am interested in applying for this opportunity:\n\nTitle: ${title}\nSource: ${opportunity.sourceName || 'ARIA HUB'}`;
  const applyLink = phone ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}` : opportunity.applyUrl;

  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden">
        <SmartImage src={opportunity.image} alt={title} className="absolute inset-0 h-full w-full" imgClassName="h-full w-full object-cover" gradient="from-primary/30 via-chart-2/20 to-chart-3/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 text-white">
          {opportunity.category && (
            <span className="rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm">{opportunity.category.name}</span>
          )}
          <h2 dir="auto" className="mt-2 text-2xl font-bold drop-shadow sm:text-3xl">{title}</h2>
        </div>
      </div>

      <div className="max-h-[55vh] overflow-y-auto p-6 sm:p-8" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {opportunity.organization && (
            <MetaItem icon={Building2} label={translateKey("Organization")} value={getExtractedDataValue("Organization", opportunity.organization)} />
          )}
          {opportunity.country && (
            <MetaItem icon={MapPin} label={translateKey("Location")} value={getExtractedDataValue("Location", opportunity.country)} />
          )}
          {deadline && (
            <MetaItem icon={CalendarDays} label={t('opportunities.deadline') || 'Deadline'} value={deadline} />
          )}
          {jobType && (
            <MetaItem icon={Briefcase} label={translateKey("Job Type")} value={jobType} />
          )}
          {salary && (
            <MetaItem icon={DollarSign} label={translateKey("Salary")} value={salary} />
          )}
          {educationReq && (
            <MetaItem icon={GraduationCap} label={translateKey("Education")} value={educationReq} />
          )}
          {experience && (
            <MetaItem icon={Clock} label={translateKey("Experience")} value={experience} />
          )}
          {opportunity.website && (
            <a href={opportunity.website} target="_blank" rel="noopener noreferrer" className="flex flex-col rounded-xl border border-border/60 bg-accent/30 p-3 transition-colors hover:border-primary/40">
              <Globe className="mb-1 h-4 w-4 text-primary" />
              <p className="text-[10px] font-medium uppercase text-muted-foreground">{t('admin.table.website') || 'Website'}</p>
              <p className="truncate text-xs font-bold text-primary">Visit ↗</p>
            </a>
          )}
          {opportunity.extractedData && typeof opportunity.extractedData === 'object' && Object.entries(opportunity.extractedData)
            .filter(([key]) => !['Organization', 'Category', 'Location', 'Closing Date', 'Employment Type', 'Job Type', 'Education', 'Experience', 'Salary'].includes(key))
            .map(([key, val]) => {
              if (!val) return null;
              const localizedVal = getExtractedDataValue(key, val);
              return <MetaItem key={key} icon={Info} label={translateKey(key)} value={String(localizedVal)} />;
            })}
        </div>

        {description && (
          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-muted-foreground"><Info className="h-4 w-4 text-primary" />{t('opportunities.overview') || 'Overview'}</h3>
            <FormattedContent content={description} />
          </div>
        )}

        {requirements && (
          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold"><CheckCircle2 className="h-4 w-4 text-chart-3" />{t('opportunities.requirements') || 'Requirements'}</h3>
            <FormattedContent content={requirements} />
          </div>
        )}

        {responsibilities && (
          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold"><CheckCircle2 className="h-4 w-4 text-chart-3" />{t('opportunities.responsibilities') || 'Responsibilities'}</h3>
            <FormattedContent content={responsibilities} />
          </div>
        )}

        {eligibility && (
          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold"><CheckCircle2 className="h-4 w-4 text-chart-3" />{t('opportunities.eligibility') || 'Eligibility'}</h3>
            <FormattedContent content={eligibility} />
          </div>
        )}

        {benefits && (
          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold"><Award className="h-4 w-4 text-chart-4" />{t('opportunities.benefits') || 'Benefits'}</h3>
            <FormattedContent content={benefits} />
          </div>
        )}

        {guidelines && (
          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold"><Info className="h-4 w-4 text-primary" />{t('opportunities.guidelines') || 'Submission Guidelines'}</h3>
            <FormattedContent content={guidelines} />
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {applyLink && (
            <Button asChild className="h-11 rounded-xl bg-gradient-to-r from-primary to-chart-2">
              <a href={applyLink} target="_blank" rel="noopener noreferrer">
                {t('opportunities.apply') || 'Apply'}<ArrowUpRight className="ms-2 h-4 w-4 rtl-flip" />
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
      <p dir="auto" className="text-xs font-bold">{value}</p>
    </div>
  );
}
