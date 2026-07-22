'use client';

import { useEffect } from 'react';
import type { SiteData } from '@/lib/types';
import { Navbar } from './navbar';
import { Hero } from './sections/hero';
import { ServicesSection } from './sections/services';
import { WhyChooseUsSection } from './sections/why-choose-us';
import { ProcessSection } from './sections/process';
import { VisasSection } from './sections/visas';
import { OpportunitiesSection } from './sections/opportunities';
import { CountersSection } from './sections/counters';
import { PricingSection } from './sections/pricing';
import { TeamSection } from './sections/team';
import { GallerySection } from './sections/gallery';
import { TestimonialsSection } from './sections/testimonials';
import { PartnersSection } from './sections/partners';
import { FaqsSection } from './sections/faqs';
import { NewsSection } from './sections/news';
import { PaymentsSection } from './sections/payments';
import { PromoteSection } from './sections/promote';
import { ContactSection } from './sections/contact';
import { ComparisonSection } from './sections/comparison';
import { CtaBannerSection } from './sections/cta-banner';
import { Footer } from './footer';
import { FloatingSocial } from './floating-social';
import { ScrollToTop } from './scroll-to-top';
import { CookieBanner } from './cookie-banner';
import { ReadingProgress } from './reading-progress';
import { TrustBar } from './trust-bar';
import { SectionIndicator } from './section-indicator';
import { CursorSpotlight } from './cursor-spotlight';
import { useLangStore } from '@/lib/lang-store';
import { useT } from '@/hooks/use-t';

export function Home({ data }: { data: SiteData }) {
  const setLanguages = useLangStore((s) => s.setLanguages);
  const t = useT();

  useEffect(() => {
    setLanguages(data.languages);
  }, [data.languages, setLanguages]);

  // Track visit once per session (guarded against React StrictMode double-fire)
  useEffect(() => {
    if (sessionStorage.getItem('aria-tracked')) return;
    sessionStorage.setItem('aria-tracked', '1');
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: '/' }) }).catch(() => {});
  }, []);

  const sectionMap: Record<string, React.ReactNode> = {
    hero: <Hero counters={data.counters} />,
    services: <ServicesSection services={data.services} />,
    whyChooseUs: <WhyChooseUsSection />,
    process: <ProcessSection steps={data.processSteps} />,
    visas: <VisasSection visas={data.visas} />,
    opportunities: <OpportunitiesSection opportunities={data.opportunities} categories={data.opportunityCategories} />,
    counters: <CountersSection counters={data.counters} />,
    pricing: <PricingSection packages={data.pricingPackages} />,
    team: <TeamSection members={data.teamMembers} />,
    gallery: <GallerySection items={data.gallery} />,
    testimonials: <TestimonialsSection testimonials={data.testimonials} />,
    partners: <PartnersSection partners={data.partners} />,
    faqs: <FaqsSection faqs={data.faqs} />,
    news: <NewsSection news={data.news} />,
    payments: <PaymentsSection methods={data.paymentMethods} />,
    promote: <PromoteSection />,
    contact: <ContactSection settings={data.settings} departments={data.departments} branches={data.branches} />,
    comparison: <ComparisonSection rows={data.comparisonRows} />,
    ctaBanner: <CtaBannerSection banners={data.ctaBanners} />,
  };

  // Derive the section indicator from the DB-driven sections list (no DOM probing / no setState in effect).
  const labelByKey: Record<string, string> = {
    services: t('services.title'), whyChooseUs: t('why.title'), process: t('process.title'),
    visas: t('visas.title'), opportunities: t('opportunities.title'), counters: t('counters.eyebrow'),
    pricing: t('pricing.title'), team: t('team.title'), gallery: t('gallery.title'),
    testimonials: t('testimonials.title'), faqs: t('faqs.title'), news: t('news.title'),
    contact: t('contact.title'),
  };
  const idByKey: Record<string, string> = {
    services: 'services', whyChooseUs: 'why-choose-us', process: 'process', visas: 'visas',
    opportunities: 'opportunities', counters: 'counters', pricing: 'pricing', team: 'team',
    gallery: 'gallery', testimonials: 'testimonials', faqs: 'faqs', news: 'news', contact: 'contact',
  };
  const indicatorSections = [
    { id: 'home', label: t('nav.getStarted') },
    ...data.sections
      .filter((s) => s.enabled && labelByKey[s.key])
      .sort((a, b) => a.order - b.order)
      .map((s) => ({ id: idByKey[s.key], label: labelByKey[s.key] })),
  ];

  // Render sections in DB order; always include hero first + contact + footer
  const orderedSections = [...data.sections]
    .filter((s) => s.enabled && sectionMap[s.key])
    .sort((a, b) => a.order - b.order);

  return (
    <div className="flex min-h-screen flex-col">
      <ReadingProgress />
      <CursorSpotlight />
      <Navbar
        menu={data.menu}
        languages={data.languages}
        siteName={data.settings?.siteName || 'ARIA HUB'}
        logoUrl={data.settings?.logoUrl ?? null}
      />
      <main className="flex-1">
        {/* Hero always first */}
        {sectionMap.hero}
        {/* Trust badges bar */}
        <TrustBar />
        {/* Dynamic sections (skip hero since rendered above) */}
        {orderedSections.filter((s) => s.key !== 'hero').map((s) => (
          <div key={s.key}>{sectionMap[s.key]}</div>
        ))}
        {/* Ensure payments, promote, contact exist if not in sections */}
        {!orderedSections.some((s) => s.key === 'payments') && sectionMap.payments}
        {!orderedSections.some((s) => s.key === 'promote') && sectionMap.promote}
        {!orderedSections.some((s) => s.key === 'contact') && sectionMap.contact}
      </main>
      <Footer
        settings={data.settings}
        footer={data.footer}
        socialLinks={data.socialLinks}
      />
      <FloatingSocial socials={data.socialLinks} settings={data.settings} />
      <ScrollToTop />
      <SectionIndicator sections={indicatorSections} />
      <CookieBanner />
    </div>
  );
}
