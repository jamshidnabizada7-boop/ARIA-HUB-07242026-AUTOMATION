/**
 * seed-neon-http.ts
 * Seeds the Neon database using the serverless HTTP adapter (port 443).
 * Use this when port 5432 is blocked by ISP.
 */
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'fs';

// Load .env manually
const envFile = dotenv.readFileSync('.env', 'utf-8');
const envVars: Record<string, string> = {};
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
}

const DATABASE_URL = envVars['DATABASE_URL'] || process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env');
  process.exit(1);
}

// Use pooler URL (port 443 HTTPS-based)
const sql = neon(DATABASE_URL);

async function run() {
  console.log('🌐 Connected via Neon serverless HTTP (port 443)');
  console.log('🌱 Seeding ARIA HUB...\n');

  // ── Languages
  console.log('→ Languages...');
  await sql`INSERT INTO "Language" (id, code, name, "nativeName", direction, "isDefault", "order", flag, enabled, "createdAt", "updatedAt")
    VALUES
      (gen_random_uuid()::text, 'en', 'English', 'English', 'ltr', false, 1, '🇬🇧', true, now(), now()),
      (gen_random_uuid()::text, 'fa', 'Persian', 'فارسی', 'rtl', true, 0, '🇦🇫', true, now(), now()),
      (gen_random_uuid()::text, 'ps', 'Pashto', 'پښتو', 'rtl', false, 2, '🇦🇫', true, now(), now())
    ON CONFLICT (code) DO NOTHING`;

  // ── Site settings
  console.log('→ Site settings...');
  await sql`INSERT INTO "SiteSetting" (id, "siteName", tagline, description, "logoUrl", "logoDarkUrl", "faviconUrl", "primaryColor", "secondaryColor", "accentColor", email, phone, address, currency, timezone, "socialPosition", "createdAt", "updatedAt")
    VALUES (
      'singleton', 'ARIA HUB', 'Professional Business Services Platform',
      'Premium business, visa, and global opportunity services — your gateway to the world.',
      '/images/logo-mark.png', '/images/logo-mark.png', '/images/logo-mark.png',
      '#0A66C2', '#0EA5E9', '#22D3EE',
      'contact@ariahub.com', '+93 70 000 0000', 'Shahr-e-Naw, Kabul, Afghanistan',
      'USD', 'Asia/Karachi', 'right', now(), now()
    )
    ON CONFLICT (id) DO NOTHING`;

  // ── Sections
  console.log('→ Sections...');
  const sections = [
    ['hero','Hero','Main banner',0],
    ['services','Our Services','What we offer',1],
    ['whyChooseUs','Why Choose Us','Our advantages',2],
    ['process','How It Works','Our process',3],
    ['visas','Featured Visas','Popular destinations',4],
    ['opportunities','Latest Opportunities','Jobs, scholarships & more',5],
    ['counters','Our Impact','Numbers that speak',6],
    ['pricing','Pricing','Transparent packages',7],
    ['team','Our Team','Meet the experts',8],
    ['gallery','Gallery','Moments & milestones',9],
    ['testimonials','Testimonials','What clients say',10],
    ['partners','Our Partners','Trusted by leaders',11],
    ['faqs','FAQs','Frequently asked',12],
    ['news','Latest News','Insights & updates',13],
    ['contact','Get in Touch','Contact us',14],
    ['comparison','Why We Are Different','ARIA HUB vs. others',15],
    ['ctaBanner','Call to Action','Final conversion',16],
  ];
  for (const [key, title, subtitle, order] of sections) {
    await sql`INSERT INTO "Section" (id, key, title, subtitle, "order", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${key as string}, ${title as string}, ${subtitle as string}, ${order as number}, now(), now())
      ON CONFLICT (key) DO NOTHING`;
  }

  // ── Menu items
  console.log('→ Menu items...');
  await sql`DELETE FROM "MenuItem"`;
  const menus: [string, string, number, { fa: string; ps: string }][] = [
    ['Home','#home',0,{fa:'خانه',ps:'کور'}],
    ['Services','#services',1,{fa:'خدمات',ps:'خدمات'}],
    ['Visas','#visas',2,{fa:'ویزهها',ps:'ویزې'}],
    ['Opportunities','#opportunities',3,{fa:'فرصتها',ps:'فرصتونه'}],
    ['Promote','#promote',4,{fa:'تبلیغات',ps:'اعلانات'}],
    ['Gallery','#gallery',5,{fa:'گالری',ps:'ګالري'}],
    ['Payments','#payments',6,{fa:'پرداختها',ps:'تادیات'}],
    ['Contact','#contact',7,{fa:'تماس',ps:'اړیکه'}],
  ];
  const menuIds: Record<string, string> = {};
  for (const [label, url, order, i18n] of menus) {
    const labelI18n = JSON.stringify({ en: label, fa: i18n.fa, ps: i18n.ps });
    const result = await sql`INSERT INTO "MenuItem" (id, label, "labelI18n", url, "parentId", icon, "order", "openInNewTab", visible, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${label as string}, ${labelI18n}::jsonb, ${url as string}, null, null, ${order as number}, false, true, now(), now())
      RETURNING id`;
    menuIds[label as string] = result[0].id;
  }

  // Sub-menu under Services
  if (menuIds['Services']) {
    const pid = menuIds['Services'];
    const subMenus: [string, number, { fa: string; ps: string }][] = [
      ['Business Setup',0,{fa:'راه‌اندازی کسب‌وکار',ps:'د سوداګرۍ جوړول'}],
      ['Legal Services',1,{fa:'خدمات حقوقی',ps:'قانوني خدمات'}],
      ['Travel & Visa',2,{fa:'سفر و ویزا',ps:'سفر او ویزه'}],
    ];
    for (const [label, i, i18n] of subMenus) {
      const labelI18n = JSON.stringify({ en: label, fa: i18n.fa, ps: i18n.ps });
      await sql`INSERT INTO "MenuItem" (id, label, "labelI18n", url, "parentId", icon, "order", "openInNewTab", visible, "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, ${label}, ${labelI18n}::jsonb, '#services', ${pid}, null, ${i}, false, true, now(), now())`;
    }
  }

  // ── Service categories
  console.log('→ Service categories...');
  await sql`DELETE FROM "Service"`;
  await sql`DELETE FROM "ServiceCategory"`;
  const catNames = ['Business','Legal','Travel','Translation','Consulting','Finance'];
  const catIds: Record<string, string> = {};
  for (let i = 0; i < catNames.length; i++) {
    const r = await sql`INSERT INTO "ServiceCategory" (id, name, slug, "order", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${catNames[i]}, ${catNames[i].toLowerCase()}, ${i}, now(), now())
      RETURNING id`;
    catIds[catNames[i]] = r[0].id;
  }

  // ── Services
  console.log('→ Services...');
  const services = [
    ['Business Setup & Registration','business-setup','Business','Briefcase','/images/services/business.png','Launch your company with full legal compliance and expert guidance.','From entity selection to registration, licensing, and tax setup.','From $1,200',true],
    ['Legal Services & Documentation','legal-services','Legal','Scale','/images/services/legal.png','Contracts, agreements, and legal documentation handled by experts.','Comprehensive legal support including contract drafting.','From $300',true],
    ['Visa & Travel Assistance','visa-travel','Travel','Plane','/images/services/travel.png','Seamless visa processing for tourism, business, and study.','End-to-end visa application support across 50+ countries.','From $250',true],
    ['Professional Translation','translation','Translation','Languages','/images/services/translation.png','Certified translation in 30+ languages by native experts.','Accurate, certified translations for legal and business documents.','From $0.12/word',true],
    ['Strategic Consulting','consulting','Consulting','Lightbulb','/images/services/consulting.png','Data-driven strategies to scale and optimize your operations.','Market entry analysis and growth strategy consulting.','From $200/hr',true],
    ['Financial & Tax Services','finance','Finance','Wallet','/images/services/finance.png','Bookkeeping, tax filing, and financial planning made simple.','Full-cycle financial management including accounting.','From $500/mo',false],
  ];
  for (let i = 0; i < services.length; i++) {
    const [title, slug, cat, icon, image, excerpt, description, price, featured] = services[i];
    await sql`INSERT INTO "Service" (id, title, slug, "categoryId", excerpt, description, icon, image, price, featured, status, sort, gallery, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${title as string}, ${slug as string}, ${catIds[cat as string]}, ${excerpt as string}, ${description as string}, ${icon as string}, ${image as string}, ${price as string}, ${featured as boolean}, 'published', ${i}, ${JSON.stringify([image])}, now(), now())`;
  }

  // ── Visas
  console.log('→ Visas...');
  await sql`DELETE FROM "Visa"`;
  const visas = [
    ['United States','us','B1/B2 Tourist','/images/visas/usa.png','6 months stay','7-14 days','$185',true],
    ['Canada','ca','Visitor Visa','/images/visas/canada.png','6 months stay','14-30 days','$100 CAD',true],
    ['United Kingdom','gb','Standard Visitor','/images/visas/uk.png','6 months','15-21 days','£115',true],
    ['Australia','au','Visitor (600)','/images/visas/australia.png','3-12 months','20-30 days','AUD $150',true],
    ['Germany','de','Schengen (C)','/images/visas/germany.png','90 days','10-15 days','€80',true],
    ['United Arab Emirates','ae','Tourist eVisa','/images/visas/uae.png','30-90 days','3-5 days','$90-$180',true],
  ];
  for (let i = 0; i < visas.length; i++) {
    const [country, countryCode, visaType, image, duration, processingTime, fee, featured] = visas[i];
    await sql`INSERT INTO "Visa" (id, country, "countryCode", "visaType", slug, duration, "processingTime", fee, requirements, documents, image, featured, status, sort, description, eligibility, "applicationProcess", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${country as string}, ${countryCode as string}, ${visaType as string}, ${(countryCode as string)+'-visa'}, ${duration as string}, ${processingTime as string}, ${fee as string}, '["Valid passport","Financial proof"]', '["Travel history"]', ${image as string}, ${featured as boolean}, 'published', ${i}, ${'Visa for '+country}, 'Valid passport with 6+ months validity.', '1. Documents 2. Application 3. Interview', now(), now())`;
  }

  // ── Counters
  console.log('→ Counters...');
  await sql`DELETE FROM "Counter"`;
  const counters = [
    ['Projects Completed',1250,'+','CheckCircle',0],
    ['Happy Clients',980,'+','Users',1],
    ['Visas Approved',3400,'+','Plane',2],
    ['Countries Served',50,'+','Globe',3],
  ];
  for (const [label, value, suffix, icon, order] of counters) {
    await sql`INSERT INTO "Counter" (id, label, value, suffix, icon, "order", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${label as string}, ${value as number}, ${suffix as string}, ${icon as string}, ${order as number}, now(), now())`;
  }

  // ── Testimonials
  console.log('→ Testimonials...');
  await sql`DELETE FROM "Testimonial"`;
  const testimonials = [
    ['Ahmad Rahimi','Entrepreneur','Rahimi Group','/images/avatars/a1.png',5,'ARIA HUB made our company registration effortless. Highly recommended!',true],
    ['Sara Khan','Scholarship Recipient','Fulbright Scholar','/images/avatars/a2.png',5,'Thanks to ARIA HUB I secured a fully-funded scholarship.',true],
    ['David Müller','Operations Director','EuroTech GmbH','/images/avatars/a3.png',5,'Professional, reliable, and truly global. Flawlessly handled our visa process.',true],
    ['Fatima Noori','Business Owner','Noori Imports','/images/avatars/a4.png',5,'From translation to legal documentation, ARIA HUB delivered excellence.',true],
  ];
  for (let i = 0; i < testimonials.length; i++) {
    const [name, role, company, avatar, rating, content, featured] = testimonials[i];
    await sql`INSERT INTO "Testimonial" (id, name, role, company, avatar, rating, content, featured, status, "order", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${name as string}, ${role as string}, ${company as string}, ${avatar as string}, ${rating as number}, ${content as string}, ${featured as boolean}, 'published', ${i}, now(), now())`;
  }

  // ── Partners
  console.log('→ Partners...');
  await sql`DELETE FROM "Partner"`;
  const partners = ['Visa Group','Global Trust','EuroBank','TechCorp','WorldRelocate','PrimeLegal','EduConnect','FinPro'];
  for (let i = 0; i < partners.length; i++) {
    await sql`INSERT INTO "Partner" (id, name, "order", status, website, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${partners[i]}, ${i}, 'active', '#', now(), now())`;
  }

  // ── FAQs
  console.log('→ FAQs...');
  await sql`DELETE FROM "Faq"`;
  const faqs = [
    ['What services does ARIA HUB offer?','We provide business setup, legal services, visa & travel assistance, professional translation, strategic consulting, and financial services.'],
    ['How long does visa processing take?','Processing times range from 3 to 30 days depending on country and visa type.'],
    ['Do you offer services for international clients?','Yes. We serve clients globally with remote consultation and multilingual support across 50+ countries.'],
    ['Are translations certified and notarized?','All translations are certified and can be notarized on request.'],
    ['What payment methods do you accept?','Bank transfer, EasyPaisa, JazzCash, crypto (USDT), Wise, Payoneer, and cash.'],
    ['How can I get started?','Contact us through our form, call us, or visit any branch for a free consultation.'],
  ];
  for (let i = 0; i < faqs.length; i++) {
    const [question, answer] = faqs[i];
    await sql`INSERT INTO "Faq" (id, question, answer, "order", status, category, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${question}, ${answer}, ${i}, 'published', 'General', now(), now())`;
  }

  // ── Social links
  console.log('→ Social links...');
  await sql`DELETE FROM "SocialLink"`;
  const socials = [
    ['whatsapp','WhatsApp','https://wa.me/937000000000','MessageCircle','#25D366',0],
    ['phone','Call Us','tel:+937000000000','Phone','#0A66C2',1],
    ['email','Email','mailto:contact@ariahub.com','Mail','#EA4335',2],
    ['facebook','Facebook','https://facebook.com','Facebook','#1877F2',3],
    ['instagram','Instagram','https://instagram.com','Instagram','#E4405F',4],
    ['telegram','Telegram','https://telegram.org','Send','#0088CC',5],
    ['linkedin','LinkedIn','https://linkedin.com','Linkedin','#0A66C2',6],
    ['youtube','YouTube','https://youtube.com','Youtube','#FF0000',7],
  ];
  for (const [platform, label, url, icon, color, order] of socials) {
    await sql`INSERT INTO "SocialLink" (id, platform, label, url, icon, color, "order", enabled, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${platform as string}, ${label as string}, ${url as string}, ${icon as string}, ${color as string}, ${order as number}, true, now(), now())`;
  }

  // ── Departments
  console.log('→ Departments...');
  await sql`DELETE FROM "Department"`;
  const depts = [
    ['Visa & Immigration','visa@ariahub.com','+93 70 000 0001',0],
    ['Business Services','business@ariahub.com','+93 70 000 0002',1],
    ['Legal','legal@ariahub.com','+93 70 000 0003',2],
    ['Translation','translate@ariahub.com','+93 70 000 0004',3],
  ];
  for (const [name, email, phone, order] of depts) {
    await sql`INSERT INTO "Department" (id, name, email, phone, "order", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${name as string}, ${email as string}, ${phone as string}, ${order as number}, now(), now())`;
  }

  // ── Branches
  console.log('→ Branches...');
  await sql`DELETE FROM "Branch"`;
  const branches = [
    ['Kabul HQ','Shahr-e-Naw, Kabul, Afghanistan','+93 70 000 0000','kabul@ariahub.com','Sat-Thu: 8:00 AM - 6:00 PM',true,0],
    ['Dubai Office','Business Bay, Dubai, UAE','+971 4 000 0000','dubai@ariahub.com','Mon-Sat: 9:00 AM - 7:00 PM',false,1],
    ['Islamabad Office','F-7 Markaz, Islamabad, Pakistan','+92 51 000 0000','isb@ariahub.com','Mon-Sat: 9:00 AM - 7:00 PM',false,2],
  ];
  for (const [name, address, phone, email, hours, isMain, order] of branches) {
    await sql`INSERT INTO "Branch" (id, name, address, phone, email, hours, "isMain", "order", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${name as string}, ${address as string}, ${phone as string}, ${email as string}, ${hours as string}, ${isMain as boolean}, ${order as number}, now(), now())`;
  }

  // ── Process steps
  console.log('→ Process steps...');
  await sql`DELETE FROM "ProcessStep"`;
  const steps = [
    ['Consultation','Share your goals with our experts in a free consultation.','MessageCircle',0],
    ['Documentation','Our team collects and verifies all required documents.','FileText',1],
    ['Processing','We submit your application and track progress end-to-end.','Zap',2],
    ['Success','Receive your approved visa, registration, or placement.','CheckCircle',3],
  ];
  for (const [title, description, icon, order] of steps) {
    await sql`INSERT INTO "ProcessStep" (id, title, description, icon, "order", status, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${title as string}, ${description as string}, ${icon as string}, ${order as number}, 'published', now(), now())`;
  }

  // ── Pricing packages
  console.log('→ Pricing packages...');
  await sql`DELETE FROM "PricingPackage"`;
  const packages = [
    ['Starter','starter','$199','one-time','Perfect for individuals starting their journey.',JSON.stringify(['1 service of choice','Document review','Email support','5-day processing']),'Briefcase',false,null,'Get Started','#contact',0],
    ['Professional','professional','$599','one-time','Our most popular package for professionals and families.',JSON.stringify(['Up to 3 services','Priority processing','Phone & email support','3-day processing','Expert consultation']),'Award',true,'Most Popular','Choose Professional','#contact',1],
    ['Enterprise','enterprise','$1,499','one-time','Comprehensive solution for businesses and complex cases.',JSON.stringify(['Unlimited services','Dedicated account manager','24/7 priority support','Express 24-hour processing','VIP consultation']),'Building2',false,null,'Contact Sales','#contact',2],
  ];
  for (const [name, slug, price, period, description, features, icon, featured, badge, ctaLabel, ctaUrl, order] of packages) {
    await sql`INSERT INTO "PricingPackage" (id, name, slug, price, period, description, features, icon, featured, badge, "ctaLabel", "ctaUrl", "order", status, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${name as string}, ${slug as string}, ${price as string}, ${period as string}, ${description as string}, ${features as string}, ${icon as string}, ${featured as boolean}, ${badge as string | null}, ${ctaLabel as string}, ${ctaUrl as string}, ${order as number}, 'published', now(), now())`;
  }

  // ── Team members
  console.log('→ Team members...');
  await sql`DELETE FROM "TeamMember"`;
  const team = [
    ['Ahmad Rahimi','Founder & CEO','20+ years in international business development.', '/images/avatars/a1.png','ahmad@ariahub.com','https://linkedin.com',0,true],
    ['Sara Khan','Head of Education Services','Fulbright alumna, helped 500+ students.', '/images/avatars/a2.png','sara@ariahub.com','https://linkedin.com',1,true],
    ['David Müller','Director of Legal Affairs','European-qualified immigration attorney.', '/images/avatars/a3.png','david@ariahub.com','https://linkedin.com',2,true],
    ['Fatima Noori','Senior Business Consultant','Award-winning consultant for MENA & South Asia.', '/images/avatars/a4.png','fatima@ariahub.com','https://linkedin.com',3,true],
  ];
  for (const [name, role, bio, photo, email, linkedin, order, featured] of team) {
    await sql`INSERT INTO "TeamMember" (id, name, role, bio, photo, email, linkedin, "order", featured, status, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${name as string}, ${role as string}, ${bio as string}, ${photo as string}, ${email as string}, ${linkedin as string}, ${order as number}, ${featured as boolean}, 'published', now(), now())`;
  }

  // ── CTA Banners
  console.log('→ CTA banners...');
  await sql`DELETE FROM "CtaBanner"`;
  await sql`INSERT INTO "CtaBanner" (id, title, subtitle, "buttonText", "buttonUrl", "secondaryText", accent, "order", status, "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'Ready to start your journey?', 'Join 980+ clients who turned ambition into achievement with ARIA HUB.', 'Book Free Consultation', '#contact', 'No commitment · 30-min session · Expert advice', 'primary', 0, 'published', now(), now())`;

  // ── Comparison rows
  console.log('→ Comparison rows...');
  await sql`DELETE FROM "ComparisonRow"`;
  const comparisonRows = [
    ['Dedicated case manager','✓','—'],
    ['Transparent fixed pricing','✓','Hidden fees'],
    ['24/7 priority support','✓','Business hours'],
    ['Multi-country expertise (50+)','✓','1-3 countries'],
    ['Real-time progress tracking','✓','—'],
    ['Bank-grade data encryption','✓','Basic'],
    ['Legal representation included','✓','Extra cost'],
    ['Success rate above 98%','✓','~70%'],
  ];
  for (let i = 0; i < comparisonRows.length; i++) {
    const [feature, ariaValue, othersValue] = comparisonRows[i];
    await sql`INSERT INTO "ComparisonRow" (id, feature, "ariaValue", "othersValue", "order", status, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${feature}, ${ariaValue}, ${othersValue}, ${i}, 'published', now(), now())`;
  }

  // ── Payment methods
  console.log('→ Payment methods...');
  await sql`DELETE FROM "PaymentMethod"`;
  const payments = [
    ['Bank Transfer','bank','0000-0000-0000-0000','ARIA HUB Ltd.','Direct wire transfer to our corporate account.','Use invoice number as reference.',0],
    ['EasyPaisa','easypaisa','0300-0000000','ARIA HUB','Mobile wallet via EasyPaisa.','Send payment and share transaction ID.',1],
    ['JazzCash','jazzcash','0301-0000000','ARIA HUB','Mobile wallet via JazzCash.','Send payment and share transaction ID.',2],
    ['Crypto (USDT)','crypto','TRC20 Wallet','ARIA HUB','Pay with USDT on TRC20 network.','Send exact amount and email transaction hash.',3],
    ['Wise','wise','wise@ariahub.com','ARIA HUB','International transfer via Wise.','Send to our Wise email and notify us.',4],
    ['Cash','cash','Visit our office','ARIA HUB','Pay in cash at any of our branches.','Bring exact amount and your invoice.',5],
  ];
  for (const [name, slug, accountNumber, accountTitle, description, instructions, order] of payments) {
    await sql`INSERT INTO "PaymentMethod" (id, name, slug, "accountNumber", "accountTitle", description, instructions, "order", status, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${name as string}, ${slug as string}, ${accountNumber as string}, ${accountTitle as string}, ${description as string}, ${instructions as string}, ${order as number}, 'active', now(), now())`;
  }

  // ── Footer links
  console.log('→ Footer links...');
  await sql`DELETE FROM "FooterLink"`;
  const footerCols: Record<string, string[]> = {
    quickLinks: ['Home', 'About Us', 'Services', 'Gallery', 'Contact'],
    services: ['Business Setup', 'Legal Services', 'Visa & Travel', 'Translation', 'Consulting'],
    opportunities: ['Jobs', 'Scholarships', 'Internships', 'Conferences', 'Exchange Programs'],
  };
  for (const [col, labels] of Object.entries(footerCols)) {
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      const url = '#' + label.toLowerCase().replace(/\s/g, '');
      await sql`INSERT INTO "FooterLink" (id, "column", label, url, "order", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, ${col}, ${label}, ${url}, ${i}, now(), now())`;
    }
  }

  // ── Opportunity categories & opportunities
  console.log('→ Opportunities...');
  await sql`DELETE FROM "Opportunity"`;
  await sql`DELETE FROM "OpportunityCategory"`;
  const oppCats = ['Jobs','Scholarships','Internships','Competitions','Conferences','Volunteer','Exchange Programs','Training'];
  const oppCatIds: Record<string, string> = {};
  for (let i = 0; i < oppCats.length; i++) {
    const r = await sql`INSERT INTO "OpportunityCategory" (id, name, slug, "order", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${oppCats[i]}, ${oppCats[i].toLowerCase().replace(/\s/g, '-')}, ${i}, now(), now())
      RETURNING id`;
    oppCatIds[oppCats[i]] = r[0].id;
  }
  const opps = [
    ['Senior Software Engineer — Google','Jobs','Google LLC','United States','2025-12-31','Join Google to build scalable systems used by billions.','/images/news/n1.png',true],
    ['Fulbright Foreign Student Program','Scholarships','Fulbright','United States','2025-05-15','Full funding for graduate study in the US.','/images/news/n3.png',true],
    ['UN Internship Programme','Internships','United Nations','Switzerland','2025-09-01','Gain hands-on experience at the UN headquarters.','/images/news/n2.png',true],
    ['Erasmus+ Exchange Program','Exchange Programs','European Commission','European Union','2025-06-30','Study abroad across European universities with full funding.','/images/gallery/g4.png',true],
  ];
  for (let i = 0; i < opps.length; i++) {
    const [title, cat, organization, country, deadline, description, image, featured] = opps[i];
    const slug = (title as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await sql`INSERT INTO "Opportunity" (id, title, slug, "categoryId", organization, country, deadline, description, eligibility, benefits, website, "applyUrl", image, featured, status, sort, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${title as string}, ${slug}, ${oppCatIds[cat as string]}, ${organization as string}, ${country as string}, ${deadline as string}, ${description as string}, 'Open to qualified applicants.', 'Competitive benefits.', 'https://example.com', 'https://example.com', ${image as string}, ${featured as boolean}, 'published', ${i}, now(), now())`;
  }

  console.log('\n✅ Seed complete! All data pushed to Neon via HTTP.');
}

run().catch(e => {
  console.error('❌ Seed failed:', e?.message || e);
  process.exit(1);
});
