import { db } from '../src/lib/db';

async function main() {
  console.log('🌱 Seeding ARIA HUB...');

  // ── Languages ──────────────────────────────────────────────
  const langs = [
    { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', isDefault: false, order: 1, flag: '🇬🇧' },
    { code: 'fa', name: 'Persian', nativeName: 'فارسی', direction: 'rtl', isDefault: true, order: 0, flag: '🇦🇫' },
    { code: 'ps', name: 'Pashto', nativeName: 'پښتو', direction: 'rtl', isDefault: false, order: 2, flag: '🇦🇫' },
  ];
  for (const l of langs) {
    await db.language.upsert({ where: { code: l.code }, update: l, create: l });
  }

  // ── Site settings ──────────────────────────────────────────
  await db.siteSetting.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      siteName: 'ARIA HUB',
      tagline: 'Professional Business Services Platform',
      description: 'Premium business, visa, and global opportunity services — your gateway to the world.',
      logoUrl: '/images/logo-mark.png',
      logoDarkUrl: '/images/logo-mark.png',
      faviconUrl: '/images/logo-mark.png',
      primaryColor: '#0A66C2',
      secondaryColor: '#0EA5E9',
      accentColor: '#22D3EE',
      email: 'contact@ariahub.com',
      phone: '+93 70 000 0000',
      address: 'Shahr-e-Naw, Kabul, Afghanistan',
      currency: 'USD',
      timezone: 'Asia/Karachi',
      socialPosition: 'right',
      mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3304.4!2d69.1!3d34.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDMwJzAwLjAiTiA2OcKwMDYnMDAuMCJF!5e0!3m2!1sen!2s!4v0',
    },
  });

  // ── Sections ───────────────────────────────────────────────
  const sections = [
    { key: 'hero', title: 'Hero', subtitle: 'Main banner', order: 0 },
    { key: 'services', title: 'Our Services', subtitle: 'What we offer', order: 1 },
    { key: 'whyChooseUs', title: 'Why Choose Us', subtitle: 'Our advantages', order: 2 },
    { key: 'process', title: 'How It Works', subtitle: 'Our process', order: 3 },
    { key: 'visas', title: 'Featured Visas', subtitle: 'Popular destinations', order: 4 },
    { key: 'opportunities', title: 'Latest Opportunities', subtitle: 'Jobs, scholarships & more', order: 5 },
    { key: 'counters', title: 'Our Impact', subtitle: 'Numbers that speak', order: 6 },
    { key: 'pricing', title: 'Pricing', subtitle: 'Transparent packages', order: 7 },
    { key: 'team', title: 'Our Team', subtitle: 'Meet the experts', order: 8 },
    { key: 'gallery', title: 'Gallery', subtitle: 'Moments & milestones', order: 9 },
    { key: 'testimonials', title: 'Testimonials', subtitle: 'What clients say', order: 10 },
    { key: 'partners', title: 'Our Partners', subtitle: 'Trusted by leaders', order: 11 },
    { key: 'faqs', title: 'FAQs', subtitle: 'Frequently asked', order: 12 },
    { key: 'news', title: 'Latest News', subtitle: 'Insights & updates', order: 13 },
    { key: 'contact', title: 'Get in Touch', subtitle: 'Contact us', order: 14 },
  ];
  for (const s of sections) {
    await db.section.upsert({ where: { key: s.key }, update: {}, create: s });
  }

  // ── Menu items (nested) ────────────────────────────────────
  await db.menuItem.deleteMany({});
  const menus = [
    { label: 'Home', url: '#home', order: 0 },
    { label: 'Services', url: '#services', order: 1 },
    { label: 'Visas', url: '#visas', order: 2 },
    { label: 'Opportunities', url: '#opportunities', order: 3 },
    { label: 'Promote', url: '#promote', order: 4 },
    { label: 'Gallery', url: '#gallery', order: 5 },
    { label: 'Payments', url: '#payments', order: 6 },
    { label: 'Contact', url: '#contact', order: 7 },
  ];
  for (const m of menus) {
    await db.menuItem.create({ data: m });
  }
  // Add a sample nested dropdown under Services
  const servicesMenu = await db.menuItem.findFirst({ where: { label: 'Services' } });
  if (servicesMenu) {
    await db.menuItem.create({ data: { label: 'Business Setup', url: '#services', parentId: servicesMenu.id, order: 0 } });
    await db.menuItem.create({ data: { label: 'Legal Services', url: '#services', parentId: servicesMenu.id, order: 1 } });
    await db.menuItem.create({ data: { label: 'Travel & Visa', url: '#services', parentId: servicesMenu.id, order: 2 } });
    const nested = await db.menuItem.create({ data: { label: 'Translation', url: '#services', parentId: servicesMenu.id, order: 3 } });
    await db.menuItem.create({ data: { label: 'Document Translation', url: '#services', parentId: nested.id, order: 0 } });
    await db.menuItem.create({ data: { label: 'Interpretation', url: '#services', parentId: nested.id, order: 1 } });
  }
  // Opportunities dropdown
  const oppMenu = await db.menuItem.findFirst({ where: { label: 'Opportunities' } });
  if (oppMenu) {
    const labels = ['Jobs', 'Scholarships', 'Internships', 'Competitions', 'Conferences', 'Volunteer', 'Exchange Programs', 'Training'];
    labels.forEach((label, i) => {
      db.menuItem.create({ data: { label, url: '#opportunities', parentId: oppMenu.id, order: i } });
    });
  }

  // ── Service categories ─────────────────────────────────────
  await db.serviceCategory.deleteMany({});
  const catNames = ['Business', 'Legal', 'Travel', 'Translation', 'Consulting', 'Finance'];
  const catMap: Record<string, string> = {};
  for (let i = 0; i < catNames.length; i++) {
    const c = await db.serviceCategory.create({ data: { name: catNames[i], slug: catNames[i].toLowerCase(), order: i } });
    catMap[catNames[i]] = c.id;
  }

  // ── Services ───────────────────────────────────────────────
  await db.service.deleteMany({});
  const services = [
    { title: 'Business Setup & Registration', slug: 'business-setup', cat: 'Business', icon: 'Briefcase', image: '/images/services/business.png', excerpt: 'Launch your company with full legal compliance and expert guidance.', description: 'From entity selection to registration, licensing, and tax setup — we handle every step of your business establishment with precision and speed.', price: 'From $1,200', featured: true },
    { title: 'Legal Services & Documentation', slug: 'legal-services', cat: 'Legal', icon: 'Scale', image: '/images/services/legal.png', excerpt: 'Contracts, agreements, and legal documentation handled by experts.', description: 'Comprehensive legal support including contract drafting, compliance review, and document authentication for individuals and enterprises.', price: 'From $300', featured: true },
    { title: 'Visa & Travel Assistance', slug: 'visa-travel', cat: 'Travel', icon: 'Plane', image: '/images/services/travel.png', excerpt: 'Seamless visa processing for tourism, business, and study.', description: 'End-to-end visa application support including documentation, appointment booking, and embassy coordination across 50+ countries.', price: 'From $250', featured: true },
    { title: 'Professional Translation', slug: 'translation', cat: 'Translation', icon: 'Languages', image: '/images/services/translation.png', excerpt: 'Certified translation in 30+ languages by native experts.', description: 'Accurate, certified translations for legal, medical, technical, and business documents with notarization available on request.', price: 'From $0.12/word', featured: true },
    { title: 'Strategic Consulting', slug: 'consulting', cat: 'Consulting', icon: 'Lightbulb', image: '/images/services/consulting.png', excerpt: 'Data-driven strategies to scale and optimize your operations.', description: 'Market entry analysis, operational optimization, and growth strategy consulting delivered by seasoned industry advisors.', price: 'From $200/hr', featured: true },
    { title: 'Financial & Tax Services', slug: 'finance', cat: 'Finance', icon: 'Wallet', image: '/images/services/finance.png', excerpt: 'Bookkeeping, tax filing, and financial planning made simple.', description: 'Full-cycle financial management including accounting, tax compliance, payroll, and investment advisory services.', price: 'From $500/mo', featured: false },
  ];
  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    await db.service.create({ data: { title: s.title, slug: s.slug, categoryId: catMap[s.cat], excerpt: s.excerpt, description: s.description, icon: s.icon, image: s.image, price: s.price, featured: s.featured, status: 'published', sort: i, gallery: JSON.stringify([s.image]) } });
  }

  // ── Visas ──────────────────────────────────────────────────
  await db.visa.deleteMany({});
  const visas = [
    { country: 'United States', countryCode: 'us', visaType: 'B1/B2 Tourist', image: '/images/visas/usa.png', duration: '6 months stay', processingTime: '7-14 days', fee: '$185', requirements: ['Valid passport', 'DS-160 confirmation', 'Photo', 'Visa fee receipt'], documents: ['Bank statements', 'Employment letter', 'Travel itinerary'], featured: true, description: 'The US B1/B2 visa allows business and tourism travel to the United States for up to 180 days per entry.' },
    { country: 'Canada', countryCode: 'ca', visaType: 'Visitor Visa', image: '/images/visas/canada.png', duration: '6 months stay', processingTime: '14-30 days', fee: '$100 CAD', requirements: ['Valid passport', 'Invitation letter', 'Financial proof'], documents: ['Travel history', 'Ties to home country'], featured: true, description: 'Canada visitor visa for tourism, family visits, and short business trips with multiple entry options.' },
    { country: 'United Kingdom', countryCode: 'gb', visaType: 'Standard Visitor', image: '/images/visas/uk.png', duration: '6 months', processingTime: '15-21 days', fee: '£115', requirements: ['Valid passport', 'Financial evidence', 'Accommodation details'], documents: ['Employment proof', 'Travel plan'], featured: true, description: 'UK Standard Visitor visa for tourism, business meetings, and short-term study up to 6 months.' },
    { country: 'Australia', countryCode: 'au', visaType: 'Visitor (600)', image: '/images/visas/australia.png', duration: '3-12 months', processingTime: '20-30 days', fee: 'AUD $150', requirements: ['Valid passport', 'Financial capacity', 'Health insurance'], documents: ['Character documents', 'Genuine visitor evidence'], featured: true, description: 'Australia Visitor visa subclass 600 for tourism or business visitor activities.' },
    { country: 'Germany', countryCode: 'de', visaType: 'Schengen (C)', image: '/images/visas/germany.png', duration: '90 days', processingTime: '10-15 days', fee: '€80', requirements: ['Valid passport', 'Travel insurance', 'Biometric photo'], documents: ['Proof of accommodation', 'Flight reservation'], featured: true, description: 'Germany Schengen visa for short stays up to 90 days within the Schengen area.' },
    { country: 'United Arab Emirates', countryCode: 'ae', visaType: 'Tourist eVisa', image: '/images/visas/uae.png', duration: '30-90 days', processingTime: '3-5 days', fee: '$90-$180', requirements: ['Valid passport', 'Passport photo', 'Confirmed ticket'], documents: ['Hotel booking', 'Sponsor details (if applicable)'], featured: true, description: 'UAE tourist eVisa offering fast, hassle-free entry for leisure and business visitors.' },
  ];
  for (let i = 0; i < visas.length; i++) {
    const v = visas[i];
    await db.visa.create({ data: { country: v.country, countryCode: v.countryCode, visaType: v.visaType, slug: `${v.countryCode}-visa`, duration: v.duration, processingTime: v.processingTime, fee: v.fee, requirements: JSON.stringify(v.requirements), documents: JSON.stringify(v.documents), image: v.image, featured: v.featured, status: 'published', sort: i, description: v.description, eligibility: 'Valid passport with 6+ months validity; clean travel record; sufficient funds.', applicationProcess: '1. Document collection\n2. Application submission\n3. Biometrics appointment\n4. Embassy interview\n5. Visa decision' } });
  }

  // ── Opportunity categories + opportunities ─────────────────
  await db.opportunityCategory.deleteMany({});
  await db.opportunity.deleteMany({});
  const oppCats = ['Jobs', 'Scholarships', 'Internships', 'Competitions', 'Conferences', 'Volunteer', 'Exchange Programs', 'Training'];
  const oppCatMap: Record<string, string> = {};
  for (let i = 0; i < oppCats.length; i++) {
    const c = await db.opportunityCategory.create({ data: { name: oppCats[i], slug: oppCats[i].toLowerCase().replace(/\s/g, '-'), order: i } });
    oppCatMap[oppCats[i]] = c.id;
  }
  const opps = [
    { title: 'Senior Software Engineer — Google', cat: 'Jobs', organization: 'Google LLC', country: 'United States', deadline: '2025-12-31', description: 'Join Google to build scalable systems used by billions. We seek experienced engineers passionate about impact.', eligibility: 'BS+ in CS, 5+ years experience, strong system design skills.', benefits: 'Competitive salary, equity, relocation, premium health benefits.', website: 'https://careers.google.com', applyUrl: 'https://careers.google.com', image: '/images/news/n1.png', featured: true },
    { title: 'Fulbright Foreign Student Program', cat: 'Scholarships', organization: 'Fulbright', country: 'United States', deadline: '2025-05-15', description: 'Full funding for graduate study in the US for international students across all disciplines.', eligibility: "Bachelor's degree, academic excellence, leadership potential.", benefits: 'Full tuition, living stipend, travel, health insurance.', website: 'https://foreign.fulbrightonline.org', applyUrl: 'https://foreign.fulbrightonline.org', image: '/images/news/n3.png', featured: true },
    { title: 'UN Internship Programme', cat: 'Internships', organization: 'United Nations', country: 'Switzerland', deadline: '2025-09-01', description: 'Gain hands-on experience at the UN headquarters working on global challenges.', eligibility: 'Enrolled in master\'s program, fluent in English or French.', benefits: 'Monthly stipend, networking, career development.', website: 'https://careers.un.org', applyUrl: 'https://careers.un.org', image: '/images/news/n2.png', featured: true },
    { title: 'Global Innovation Hackathon 2025', cat: 'Competitions', organization: 'TechFoundation', country: 'Singapore', deadline: '2025-11-20', description: '48-hour hackathon bringing together innovators to solve sustainability challenges.', eligibility: 'Open to all, teams of 2-4.', benefits: '$50,000 prize pool, mentorship, investor access.', website: 'https://example.com', applyUrl: 'https://example.com', image: '/images/gallery/g6.png', featured: false },
    { title: 'World Economic Forum Conference', cat: 'Conferences', organization: 'WEF', country: 'Switzerland', deadline: '2025-10-10', description: 'Annual gathering of global leaders shaping the future of economy and society.', eligibility: 'Industry leaders, policymakers, selected delegates.', benefits: 'Networking, insights, global exposure.', website: 'https://weforum.org', applyUrl: 'https://weforum.org', image: '/images/gallery/g2.png', featured: false },
    { title: 'Erasmus+ Exchange Program', cat: 'Exchange Programs', organization: 'European Commission', country: 'European Union', deadline: '2025-06-30', description: 'Study abroad opportunity across European universities with full funding.', eligibility: 'Enrolled university students, good academic standing.', benefits: 'Monthly grant, travel support, tuition waiver.', website: 'https://erasmus-plus.ec.europa.eu', applyUrl: 'https://erasmus-plus.ec.europa.eu', image: '/images/gallery/g4.png', featured: true },
  ];
  for (let i = 0; i < opps.length; i++) {
    const o = opps[i];
    await db.opportunity.create({ data: { title: o.title, slug: o.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), categoryId: oppCatMap[o.cat], organization: o.organization, country: o.country, deadline: o.deadline, description: o.description, eligibility: o.eligibility, benefits: o.benefits, website: o.website, applyUrl: o.applyUrl, image: o.image, featured: o.featured, status: 'published', sort: i } });
  }

  // ── Gallery ────────────────────────────────────────────────
  await db.galleryAlbum.deleteMany({});
  await db.galleryItem.deleteMany({});
  const galleryItems = [
    { title: 'Corporate Headquarters', url: '/images/gallery/g1.png', category: 'Office' },
    { title: 'Team Strategy Session', url: '/images/gallery/g2.png', category: 'Team' },
    { title: 'Partnership Agreement', url: '/images/gallery/g3.png', category: 'Events' },
    { title: 'Student Success', url: '/images/gallery/g4.png', category: 'Events' },
    { title: 'Travel Coordination', url: '/images/gallery/g5.png', category: 'Travel' },
    { title: 'Global Conference', url: '/images/gallery/g6.png', category: 'Events' },
  ];
  for (let i = 0; i < galleryItems.length; i++) {
    await db.galleryItem.create({ data: { title: galleryItems[i].title, url: galleryItems[i].url, type: 'image', category: galleryItems[i].category, order: i } });
  }

  // ── Payments ───────────────────────────────────────────────
  await db.paymentMethod.deleteMany({});
  const payments = [
    { name: 'Bank Transfer', slug: 'bank', accountNumber: '0000-0000-0000-0000', iban: 'AF00 0000 0000 0000 0000 0000', accountTitle: 'ARIA HUB Ltd.', description: 'Direct wire transfer to our corporate account.', instructions: 'Use your invoice number as reference. Processing: 1-3 business days.', order: 0 },
    { name: 'EasyPaisa', slug: 'easypaisa', accountNumber: '0300-0000000', accountTitle: 'ARIA HUB', description: 'Mobile wallet payment via EasyPaisa.', instructions: 'Send payment to the number above and share transaction ID.', order: 1 },
    { name: 'JazzCash', slug: 'jazzcash', accountNumber: '0301-0000000', accountTitle: 'ARIA HUB', description: 'Mobile wallet payment via JazzCash.', instructions: 'Send payment to the number above and share transaction ID.', order: 2 },
    { name: 'Crypto (USDT)', slug: 'crypto', accountNumber: 'TRC20 Wallet Address', iban: 'Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Pay with USDT on TRC20 network.', instructions: 'Send exact amount and email transaction hash for verification.', order: 3 },
    { name: 'Wise', slug: 'wise', accountNumber: 'wise@ariahub.com', description: 'International transfer via Wise.', instructions: 'Send to our Wise email and notify us.', order: 4 },
    { name: 'Payoneer', slug: 'payoneer', accountNumber: 'payoneer@ariahub.com', description: 'Pay via Payoneer for international clients.', instructions: 'Request a payment request to your email.', order: 5 },
    { name: 'Cash', slug: 'cash', accountNumber: 'Visit our office', description: 'Pay in cash at any of our branches.', instructions: 'Bring exact amount and your invoice.', order: 6 },
  ];
  for (const p of payments) {
    await db.paymentMethod.create({ data: { ...p, status: 'active' } });
  }

  // ── Testimonials ───────────────────────────────────────────
  await db.testimonial.deleteMany({});
  const testimonials = [
    { name: 'Ahmad Rahimi', role: 'Entrepreneur', company: 'Rahimi Group', avatar: '/images/avatars/a1.png', rating: 5, content: 'ARIA HUB made our company registration effortless. Their team handled every legal detail with professionalism and speed. Highly recommended!', featured: true },
    { name: 'Sara Khan', role: 'Scholarship Recipient', company: 'Fulbright Scholar', avatar: '/images/avatars/a2.png', rating: 5, content: 'Thanks to ARIA HUB\'s expert guidance, I secured a fully-funded scholarship. Their attention to detail in my application was incredible.', featured: true },
    { name: 'David Müller', role: 'Operations Director', company: 'EuroTech GmbH', avatar: '/images/avatars/a3.png', rating: 5, content: 'Professional, reliable, and truly global. They handled our entire visa and documentation process flawlessly across multiple countries.', featured: true },
    { name: 'Fatima Noori', role: 'Business Owner', company: 'Noori Imports', avatar: '/images/avatars/a4.png', rating: 5, content: 'From translation to legal documentation, ARIA HUB delivered excellence. Their team feels like an extension of our own.', featured: true },
  ];
  for (let i = 0; i < testimonials.length; i++) {
    await db.testimonial.create({ data: { ...testimonials[i], status: 'published', order: i } });
  }

  // ── Partners ───────────────────────────────────────────────
  await db.partner.deleteMany({});
  const partners = ['Visa Group', 'Global Trust', 'EuroBank', 'TechCorp', 'WorldRelocate', 'PrimeLegal', 'EduConnect', 'FinPro'];
  for (let i = 0; i < partners.length; i++) {
    await db.partner.create({ data: { name: partners[i], order: i, status: 'active', website: '#' } });
  }

  // ── Counters ───────────────────────────────────────────────
  await db.counter.deleteMany({});
  const counters = [
    { label: 'Projects Completed', value: 1250, suffix: '+', icon: 'CheckCircle', order: 0 },
    { label: 'Happy Clients', value: 980, suffix: '+', icon: 'Users', order: 1 },
    { label: 'Visas Approved', value: 3400, suffix: '+', icon: 'Plane', order: 2 },
    { label: 'Countries Served', value: 50, suffix: '+', icon: 'Globe', order: 3 },
  ];
  for (const c of counters) {
    await db.counter.create({ data: c });
  }

  // ── FAQs ───────────────────────────────────────────────────
  await db.faq.deleteMany({});
  const faqs = [
    { question: 'What services does ARIA HUB offer?', answer: 'We provide business setup, legal services, visa & travel assistance, professional translation, strategic consulting, and financial services — all under one roof.', order: 0 },
    { question: 'How long does visa processing take?', answer: 'Processing times vary by country and visa type, typically ranging from 3 to 30 days. We provide accurate timelines during your consultation.', order: 1 },
    { question: 'Do you offer services for international clients?', answer: 'Yes. We serve clients globally with remote consultation, digital document handling, and multilingual support across 50+ countries.', order: 2 },
    { question: 'Are translations certified and notarized?', answer: 'Absolutely. All our translations are certified and can be notarized on request, accepted by embassies, courts, and government agencies.', order: 3 },
    { question: 'What payment methods do you accept?', answer: 'We accept bank transfers, mobile wallets (EasyPaisa, JazzCash), crypto (USDT), Wise, Payoneer, and cash at our branches.', order: 4 },
    { question: 'How can I get started?', answer: 'Simply contact us through our form, call us, or visit any branch. Our team will schedule a consultation and guide you through every step.', order: 5 },
  ];
  for (const f of faqs) {
    await db.faq.create({ data: { ...f, status: 'published', category: 'General' } });
  }

  // ── News ───────────────────────────────────────────────────
  await db.newsCategory.deleteMany({});
  await db.news.deleteMany({});
  const newsCat = await db.newsCategory.create({ data: { name: 'Company', slug: 'company' } });
  const newsCat2 = await db.newsCategory.create({ data: { name: 'Industry', slug: 'industry' } });
  const news = [
    { title: 'ARIA HUB Expands to 50+ Countries with New Global Mobility Program', slug: 'global-expansion', excerpt: 'We are thrilled to announce our expanded global mobility services covering over 50 countries.', content: 'ARIA HUB is proud to unveil our enhanced global mobility program, now serving clients across more than 50 countries. This expansion includes new visa processing partnerships, dedicated regional specialists, and an upgraded digital platform for faster, more transparent service delivery.', image: '/images/news/n1.png', categoryId: newsCat.id, author: 'ARIA HUB Team', featured: true, tags: JSON.stringify(['expansion', 'global']) },
    { title: 'New Scholarship Advisory Service Launched for 2025', slug: 'scholarship-advisory', excerpt: 'Get expert help finding and winning fully-funded scholarships worldwide.', content: 'Our new Scholarship Advisory Service connects ambitious students with fully-funded opportunities across the US, UK, Europe, and Asia. From eligibility assessment to application polishing, our advisors boost your acceptance odds.', image: '/images/news/n3.png', categoryId: newsCat2.id, author: 'Education Desk', featured: true, tags: JSON.stringify(['scholarship', 'education']) },
    { title: 'Immigration Policy Updates: What You Need to Know in 2025', slug: 'immigration-updates-2025', excerpt: 'Key changes to visa policies across major destinations explained.', content: '2025 brings significant updates to immigration policies in the US, UK, Canada, and EU. Our legal team breaks down what these changes mean for travelers, students, and professionals.', image: '/images/news/n2.png', categoryId: newsCat2.id, author: 'Legal Team', featured: false, tags: JSON.stringify(['immigration', 'policy']) },
  ];
  for (const n of news) {
    await db.news.create({ data: { ...n, status: 'published' } });
  }

  // ── Social links ───────────────────────────────────────────
  await db.socialLink.deleteMany({});
  const socials = [
    { platform: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/937000000000', icon: 'MessageCircle', color: '#25D366', order: 0 },
    { platform: 'phone', label: 'Call Us', url: 'tel:+937000000000', icon: 'Phone', color: '#0A66C2', order: 1 },
    { platform: 'email', label: 'Email', url: 'mailto:contact@ariahub.com', icon: 'Mail', color: '#EA4335', order: 2 },
    { platform: 'facebook', label: 'Facebook', url: 'https://facebook.com', icon: 'Facebook', color: '#1877F2', order: 3 },
    { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com', icon: 'Instagram', color: '#E4405F', order: 4 },
    { platform: 'telegram', label: 'Telegram', url: 'https://telegram.org', icon: 'Send', color: '#0088CC', order: 5 },
    { platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com', icon: 'Linkedin', color: '#0A66C2', order: 6 },
    { platform: 'youtube', label: 'YouTube', url: 'https://youtube.com', icon: 'Youtube', color: '#FF0000', order: 7 },
  ];
  for (const s of socials) {
    await db.socialLink.create({ data: s });
  }

  // ── Footer links ───────────────────────────────────────────
  await db.footerLink.deleteMany({});
  const footerCols: Record<string, string[]> = {
    quickLinks: ['Home', 'About Us', 'Services', 'Gallery', 'Contact'],
    services: ['Business Setup', 'Legal Services', 'Visa & Travel', 'Translation', 'Consulting'],
    opportunities: ['Jobs', 'Scholarships', 'Internships', 'Conferences', 'Exchange Programs'],
  };
  for (const [col, labels] of Object.entries(footerCols)) {
    labels.forEach((label, i) => {
      db.footerLink.create({ data: { column: col, label, url: `#${label.toLowerCase().replace(/\s/g, '')}`, order: i } });
    });
  }

  // ── Departments ────────────────────────────────────────────
  await db.department.deleteMany({});
  const depts = [
    { name: 'Visa & Immigration', email: 'visa@ariahub.com', phone: '+93 70 000 0001', order: 0 },
    { name: 'Business Services', email: 'business@ariahub.com', phone: '+93 70 000 0002', order: 1 },
    { name: 'Legal', email: 'legal@ariahub.com', phone: '+93 70 000 0003', order: 2 },
    { name: 'Translation', email: 'translate@ariahub.com', phone: '+93 70 000 0004', order: 3 },
  ];
  for (const d of depts) {
    await db.department.create({ data: d });
  }

  // ── Branches ───────────────────────────────────────────────
  await db.branch.deleteMany({});
  const branches = [
    { name: 'Kabul HQ', address: 'Shahr-e-Naw, Kabul, Afghanistan', phone: '+93 70 000 0000', email: 'kabul@ariahub.com', hours: 'Sat-Thu: 8:00 AM - 6:00 PM', isMain: true, order: 0 },
    { name: 'Dubai Office', address: 'Business Bay, Dubai, UAE', phone: '+971 4 000 0000', email: 'dubai@ariahub.com', hours: 'Mon-Sat: 9:00 AM - 7:00 PM', order: 1 },
    { name: 'Islamabad Office', address: 'F-7 Markaz, Islamabad, Pakistan', phone: '+92 51 000 0000', email: 'isb@ariahub.com', hours: 'Mon-Sat: 9:00 AM - 7:00 PM', order: 2 },
  ];
  for (const b of branches) {
    await db.branch.create({ data: b });
  }

  // ── Process steps (How It Works) ───────────────────────────
  await db.processStep.deleteMany({});
  const processSteps = [
    { title: 'Consultation', description: 'Share your goals with our experts in a free, no-obligation consultation. We assess your needs and outline the best path forward.', icon: 'MessageCircle', order: 0 },
    { title: 'Documentation', description: 'Our team collects, prepares, and verifies all required documents — ensuring every detail meets official standards.', icon: 'FileText', order: 1 },
    { title: 'Processing', description: 'We submit your application, coordinate with embassies and authorities, and track progress end-to-end with real-time updates.', icon: 'Zap', order: 2 },
    { title: 'Success', description: 'Receive your approved visa, registration, or placement. We provide ongoing support to ensure a smooth transition.', icon: 'CheckCircle', order: 3 },
  ];
  for (const p of processSteps) {
    await db.processStep.create({ data: { ...p, status: 'published' } });
  }

  // ── Pricing packages ───────────────────────────────────────
  await db.pricingPackage.deleteMany({});
  const packages = [
    {
      name: 'Starter', slug: 'starter', price: '$199', period: 'one-time',
      description: 'Perfect for individuals starting their journey.',
      features: JSON.stringify(['1 service of choice', 'Document review', 'Email support', '5-day processing', 'Basic consultation']),
      icon: 'Briefcase', featured: false, ctaLabel: 'Get Started', ctaUrl: '#contact', order: 0,
    },
    {
      name: 'Professional', slug: 'professional', price: '$599', period: 'one-time',
      description: 'Our most popular package for professionals and families.',
      features: JSON.stringify(['Up to 3 services', 'Priority processing', 'Phone & email support', '3-day processing', 'Expert consultation', 'Document legalization', 'Embassy coordination']),
      icon: 'Award', featured: true, badge: 'Most Popular', ctaLabel: 'Choose Professional', ctaUrl: '#contact', order: 1,
    },
    {
      name: 'Enterprise', slug: 'enterprise', price: '$1,499', period: 'one-time',
      description: 'Comprehensive solution for businesses and complex cases.',
      features: JSON.stringify(['Unlimited services', 'Dedicated account manager', '24/7 priority support', 'Express 24-hour processing', 'VIP consultation', 'Legal representation', 'Multi-country support', 'Lifetime follow-up']),
      icon: 'Building2', featured: false, ctaLabel: 'Contact Sales', ctaUrl: '#contact', order: 2,
    },
  ];
  for (const p of packages) {
    await db.pricingPackage.create({ data: { ...p, status: 'published' } });
  }

  // ── Team members ────────────────────────────────────────────
  await db.teamMember.deleteMany({});
  const team = [
    { name: 'Ahmad Rahimi', role: 'Founder & CEO', bio: '20+ years in international business development and immigration law. Ahmad founded ARIA HUB to make global opportunities accessible to everyone.', photo: '/images/avatars/a1.png', email: 'ahmad@ariahub.com', linkedin: 'https://linkedin.com', order: 0, featured: true },
    { name: 'Sara Khan', role: 'Head of Education Services', bio: 'Fulbright alumna with deep expertise in scholarship advisory. Sara has helped 500+ students secure fully-funded education worldwide.', photo: '/images/avatars/a2.png', email: 'sara@ariahub.com', linkedin: 'https://linkedin.com', order: 1, featured: true },
    { name: 'David Müller', role: 'Director of Legal Affairs', bio: 'European-qualified attorney specializing in immigration and corporate law. David leads our legal documentation team.', photo: '/images/avatars/a3.png', email: 'david@ariahub.com', linkedin: 'https://linkedin.com', order: 2, featured: true },
    { name: 'Fatima Noori', role: 'Senior Business Consultant', bio: 'Award-winning consultant with expertise in business setup across MENA and South Asia. Fatima guides entrepreneurs from idea to launch.', photo: '/images/avatars/a4.png', email: 'fatima@ariahub.com', linkedin: 'https://linkedin.com', order: 3, featured: true },
  ];
  for (const m of team) {
    await db.teamMember.create({ data: { ...m, status: 'published' } });
  }

  // ── Comparison rows ─────────────────────────────────────────
  await db.comparisonRow.deleteMany({});
  const comparisonRows = [
    { feature: 'Dedicated case manager', ariaValue: '✓', othersValue: '—' },
    { feature: 'Transparent fixed pricing', ariaValue: '✓', othersValue: 'Hidden fees' },
    { feature: '24/7 priority support', ariaValue: '✓', othersValue: 'Business hours' },
    { feature: 'Multi-country expertise (50+)', ariaValue: '✓', othersValue: '1-3 countries' },
    { feature: 'Real-time progress tracking', ariaValue: '✓', othersValue: '—' },
    { feature: 'Bank-grade data encryption', ariaValue: '✓', othersValue: 'Basic' },
    { feature: 'Legal representation included', ariaValue: '✓', othersValue: 'Extra cost' },
    { feature: 'Success rate above 98%', ariaValue: '✓', othersValue: '~70%' },
  ];
  for (let i = 0; i < comparisonRows.length; i++) {
    await db.comparisonRow.create({ data: { ...comparisonRows[i], order: i, status: 'published' } });
  }

  // ── CTA banners ─────────────────────────────────────────────
  await db.ctaBanner.deleteMany({});
  const ctaBanners = [
    { title: 'Ready to start your journey?', subtitle: 'Join 980+ clients who turned ambition into achievement with ARIA HUB.', buttonText: 'Book Free Consultation', buttonUrl: '#contact', secondaryText: 'No commitment · 30-min session · Expert advice', accent: 'primary', order: 0 },
  ];
  for (const c of ctaBanners) {
    await db.ctaBanner.create({ data: { ...c, status: 'published' } });
  }

  // ── Add new sections ────────────────────────────────────────
  await db.section.upsert({ where: { key: 'comparison' }, update: {}, create: { key: 'comparison', title: 'Why We Are Different', subtitle: 'ARIA HUB vs. others', order: 6 } });
  await db.section.upsert({ where: { key: 'ctaBanner' }, update: {}, create: { key: 'ctaBanner', title: 'Call to Action', subtitle: 'Final conversion', order: 13 } });

  console.log('✅ Seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
