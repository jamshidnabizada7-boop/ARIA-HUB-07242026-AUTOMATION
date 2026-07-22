import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin, logAction } from '@/lib/admin-auth';
import { Prisma } from '@prisma/client';

// Model registry: maps model key → prisma delegate + editable fields
const MODELS: Record<string, { delegate: any; fields: string[]; label: string; statusOptions?: string[] }> = {
  service: { label: 'Services', delegate: db.service, fields: ['title', 'titleI18n', 'slug', 'excerpt', 'excerptI18n', 'description', 'descriptionI18n', 'icon', 'image', 'gallery', 'video', 'price', 'featured', 'status', 'sort', 'categoryId', 'seoTitle', 'seoDescription'], statusOptions: ['published', 'draft', 'archived'] },
  visa: { label: 'Visas', delegate: db.visa, fields: ['country', 'countryI18n', 'countryCode', 'visaType', 'visaTypeI18n', 'slug', 'duration', 'processingTime', 'fee', 'requirements', 'requirementsI18n', 'documents', 'documentsI18n', 'eligibility', 'eligibilityI18n', 'applicationProcess', 'applicationProcessI18n', 'embassyDetails', 'faqs', 'gallery', 'image', 'featured', 'status', 'sort', 'description', 'descriptionI18n', 'seoTitle', 'seoDescription'], statusOptions: ['published', 'draft', 'archived'] },
  opportunity: { label: 'Opportunities', delegate: db.opportunity, fields: ['title', 'titleI18n', 'slug', 'organization', 'country', 'deadline', 'description', 'descriptionI18n', 'eligibility', 'eligibilityI18n', 'benefits', 'benefitsI18n', 'website', 'applyUrl', 'image', 'attachments', 'featured', 'status', 'sort', 'categoryId', 'seoTitle', 'seoDescription', 'seoTitleI18n', 'seoDescriptionI18n', 'seoKeywords', 'seoKeywordsI18n', 'ogTitle', 'ogTitleI18n', 'ogDescription', 'ogDescriptionI18n', 'canonicalUrl', 'aiSummary', 'aiSummaryI18n', 'responsibilities', 'responsibilitiesI18n', 'requirements', 'requirementsI18n', 'tags', 'tagsI18n', 'jobType', 'salary', 'educationReq', 'experience', 'logoUrl', 'publishedDate', 'sourceName', 'sourceUrl', 'originalUrl', 'contentHash', 'importStatus', 'translationStatus', 'language'], statusOptions: ['published', 'draft', 'archived'] },
  news: { label: 'News', delegate: db.news, fields: ['title', 'titleI18n', 'slug', 'excerpt', 'excerptI18n', 'content', 'contentI18n', 'image', 'author', 'tags', 'featured', 'status', 'publishedAt', 'categoryId', 'seoTitle', 'seoDescription'], statusOptions: ['published', 'draft', 'archived'] },
  testimonial: { label: 'Testimonials', delegate: db.testimonial, fields: ['name', 'nameI18n', 'role', 'roleI18n', 'company', 'companyI18n', 'avatar', 'rating', 'content', 'contentI18n', 'featured', 'status', 'order'], statusOptions: ['published', 'draft', 'archived'] },
  partner: { label: 'Partners', delegate: db.partner, fields: ['name', 'logo', 'website', 'status', 'order'], statusOptions: ['active', 'inactive'] },
  counter: { label: 'Counters', delegate: db.counter, fields: ['label', 'value', 'suffix', 'icon', 'order'] },
  faq: { label: 'FAQs', delegate: db.faq, fields: ['question', 'questionI18n', 'answer', 'answerI18n', 'category', 'order', 'status'], statusOptions: ['published', 'draft', 'archived'] },
  galleryItem: { label: 'Gallery', delegate: db.galleryItem, fields: ['title', 'type', 'url', 'thumbnail', 'caption', 'category', 'albumId', 'order'] },
  paymentMethod: { label: 'Payments', delegate: db.paymentMethod, fields: ['name', 'slug', 'logo', 'qrCode', 'accountNumber', 'iban', 'accountTitle', 'description', 'instructions', 'status', 'order'], statusOptions: ['active', 'inactive'] },
  socialLink: { label: 'Social Links', delegate: db.socialLink, fields: ['platform', 'label', 'url', 'icon', 'color', 'enabled', 'order'] },
  footerLink: { label: 'Footer Links', delegate: db.footerLink, fields: ['column', 'label', 'url', 'order'] },
  department: { label: 'Departments', delegate: db.department, fields: ['name', 'email', 'phone', 'description', 'order'] },
  branch: { label: 'Branches', delegate: db.branch, fields: ['name', 'address', 'phone', 'email', 'hours', 'isMain', 'mapEmbed', 'order'] },
  processStep: { label: 'Process Steps', delegate: db.processStep, fields: ['title', 'titleI18n', 'description', 'descriptionI18n', 'icon', 'order', 'status'], statusOptions: ['published', 'draft', 'archived'] },
  pricingPackage: { label: 'Pricing', delegate: db.pricingPackage, fields: ['name', 'nameI18n', 'slug', 'price', 'period', 'description', 'descriptionI18n', 'features', 'featuresI18n', 'icon', 'featured', 'badge', 'ctaLabel', 'ctaUrl', 'order', 'status'], statusOptions: ['published', 'draft', 'archived'] },
  teamMember: { label: 'Team', delegate: db.teamMember, fields: ['name', 'nameI18n', 'role', 'roleI18n', 'bio', 'bioI18n', 'photo', 'email', 'linkedin', 'twitter', 'order', 'featured', 'status'], statusOptions: ['published', 'draft', 'archived'] },
  comparisonRow: { label: 'Comparison', delegate: db.comparisonRow, fields: ['feature', 'ariaValue', 'othersValue', 'order', 'status'], statusOptions: ['published', 'draft', 'archived'] },
  ctaBanner: { label: 'CTA Banners', delegate: db.ctaBanner, fields: ['title', 'titleI18n', 'subtitle', 'subtitleI18n', 'buttonText', 'buttonTextI18n', 'buttonUrl', 'secondaryText', 'accent', 'order', 'status'], statusOptions: ['published', 'draft', 'archived'] },
  // menuItem: `key`/pageSlug intentionally NOT editable here — section keys drive the homepage layout.
  menuItem: { label: 'Menu Items', delegate: db.menuItem, fields: ['label', 'labelI18n', 'url', 'parentId', 'icon', 'order', 'visible', 'openInNewTab'] },
  // section: `key` is NOT editable — renaming it would silently break the homepage sectionMap mapping.
  section: { label: 'Sections', delegate: db.section, fields: ['title', 'subtitle', 'enabled', 'order'] },
  language: { label: 'Languages', delegate: db.language, fields: ['code', 'name', 'nativeName', 'direction', 'enabled', 'isDefault', 'flag', 'order', 'translations'] },
  serviceCategory: { label: 'Service Categories', delegate: db.serviceCategory, fields: ['name', 'slug', 'icon', 'description', 'order'] },
  opportunityCategory: { label: 'Opportunity Categories', delegate: db.opportunityCategory, fields: ['name', 'nameI18n', 'slug', 'icon', 'order'] },
  newsCategory: { label: 'News Categories', delegate: db.newsCategory, fields: ['name', 'slug'] },
  advertisement: { label: 'Advertisements', delegate: db.advertisement, fields: ['company', 'title', 'description', 'image', 'video', 'website', 'package', 'startDate', 'endDate', 'status', 'order'], statusOptions: ['pending', 'approved', 'rejected', 'expired'] },
};

/** Map Prisma errors to clean HTTP responses without leaking schema details. */
function handleError(e: any) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2002') return NextResponse.json({ error: 'A record with this unique value already exists.' }, { status: 409 });
    if (e.code === 'P2025') return NextResponse.json({ error: 'Record not found.' }, { status: 404 });
    if (e.code === 'P2003') return NextResponse.json({ error: 'This record is referenced by other records and cannot be modified this way.' }, { status: 409 });
  }
  console.error('[crud] error:', e);
  return NextResponse.json({ error: 'An internal error occurred.' }, { status: 500 });
}

/** Check if a field is required (not nullable) for a given model */
function isRequiredField(model: string, field: string): boolean {
  // Define required fields for each model
  const requiredFields: Record<string, string[]> = {
    service: ['title', 'slug', 'excerpt', 'description', 'status', 'sort'],
    visa: ['country', 'visaType', 'slug', 'status', 'sort'],
    opportunity: ['title', 'slug', 'description', 'status', 'sort'],
    news: ['title', 'slug', 'excerpt', 'content', 'status', 'publishedAt'],
    testimonial: ['name', 'rating', 'content', 'status', 'order'],
    partner: ['name', 'status', 'order'],
    counter: ['label', 'value', 'order'],
    faq: ['question', 'answer', 'order', 'status'],
    galleryItem: ['title', 'type', 'url', 'order'],
    paymentMethod: ['name', 'slug', 'status', 'order'],
    socialLink: ['platform', 'label', 'url', 'enabled', 'order'],
    footerLink: ['column', 'label', 'url', 'order'],
    department: ['name', 'order'],
    branch: ['name', 'address', 'isMain', 'order'],
    processStep: ['title', 'description', 'order', 'status'],
    pricingPackage: ['name', 'slug', 'price', 'period', 'ctaLabel', 'ctaUrl', 'order', 'status'],
    teamMember: ['name', 'role', 'order', 'featured', 'status'],
    comparisonRow: ['feature', 'ariaValue', 'othersValue', 'order', 'status'],
    ctaBanner: ['title', 'buttonText', 'buttonUrl', 'accent', 'order', 'status'],
    menuItem: ['label', 'order', 'visible', 'openInNewTab'],
    section: ['enabled', 'order'],
    language: ['code', 'name', 'nativeName', 'direction', 'enabled', 'isDefault', 'order'],
    serviceCategory: ['name', 'slug', 'order'],
    opportunityCategory: ['name', 'slug', 'order'],
    newsCategory: ['name', 'slug'],
    advertisement: ['company', 'title', 'description', 'package', 'startDate', 'endDate', 'status', 'order'],
  };
  
  return requiredFields[model]?.includes(field) || false;
}

/** Validate i18n fields contain only valid language codes */
function validateI18nFields(data: any): { valid: boolean; error?: string } {
  const validLangs = ['en', 'fa', 'ps'];
  
  for (const key of Object.keys(data)) {
    if (key.endsWith('I18n') && data[key]) {
      // Skip if it's an empty string, null, or undefined
      if (data[key] === '' || data[key] === null || data[key] === undefined) {
        continue;
      }
      
      // If it's a string, try to parse it as JSON
      let obj = data[key];
      if (typeof data[key] === 'string') {
        try {
          obj = JSON.parse(data[key]);
        } catch {
          // If it's not valid JSON and not empty, it's an error
          if (data[key].trim() !== '') {
            return { valid: false, error: `${key} must be an object with language codes` };
          }
          continue;
        }
      }
      
      // Check if it's an object (not an array)
      if (typeof obj !== 'object' || Array.isArray(obj)) {
        return { valid: false, error: `${key} must be an object with language codes` };
      }
      
      // If it's an empty object, that's fine - skip validation
      if (Object.keys(obj).length === 0) {
        continue;
      }
      
      // Validate language codes
      const langs = Object.keys(obj);
      const invalidLangs = langs.filter(l => !validLangs.includes(l));
      
      if (invalidLangs.length > 0) {
        return { 
          valid: false, 
          error: `Invalid language codes in ${key}: ${invalidLangs.join(', ')}. Valid codes are: en, fa, ps` 
        };
      }
    }
  }
  
  return { valid: true };
}

/** Clean i18n fields - remove empty strings, parse JSON, remove empty language values */
function cleanI18nFields(data: any): void {
  for (const key of Object.keys(data)) {
    if (key.endsWith('I18n') && data[key] !== undefined) {
      // If it's an empty string or whitespace, set to null
      if (typeof data[key] === 'string' && data[key].trim() === '') {
        data[key] = null;
        continue;
      }
      
      // If it's a string that looks like JSON, try to parse it
      if (typeof data[key] === 'string') {
        try {
          data[key] = JSON.parse(data[key]);
        } catch {
          // If it can't be parsed, leave it as is for validation to catch
          continue;
        }
      }
      
      // Clean empty strings from within i18n objects
      if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
        const cleaned: Record<string, any> = {};
        let hasContent = false;
        
        for (const lang of Object.keys(data[key])) {
          const value = data[key][lang];
          // Only keep non-empty string values or non-empty arrays
          if (typeof value === 'string' && value.trim() !== '') {
            cleaned[lang] = value;
            hasContent = true;
          } else if (Array.isArray(value) && value.length > 0) {
            cleaned[lang] = value;
            hasContent = true;
          }
        }
        
        // If no content after cleaning, set to null; otherwise use cleaned object
        data[key] = hasContent ? cleaned : null;
      }
      
      // If it's an empty object, set to null
      if (typeof data[key] === 'object' && !Array.isArray(data[key]) && data[key] !== null && Object.keys(data[key]).length === 0) {
        data[key] = null;
      }
    }
  }
}

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const model = req.nextUrl.searchParams.get('model');
  if (!model || !MODELS[model]) {
    return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
  }

  const { delegate, fields } = MODELS[model];
  const include: any = {};
  if (model === 'service' || model === 'opportunity' || model === 'news') include.category = true;

  const sortField = fields.includes('order') ? 'order' : fields.includes('sort') ? 'sort' : 'createdAt';
  // Pagination: default 100 rows, max 500 to protect memory
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') || '1', 10));
  const pageSize = Math.min(500, Math.max(1, parseInt(req.nextUrl.searchParams.get('pageSize') || '100', 10)));
  try {
    const [items, total] = await Promise.all([
      delegate.findMany({ orderBy: { [sortField]: 'asc' }, include: Object.keys(include).length ? include : undefined, skip: (page - 1) * pageSize, take: pageSize }),
      delegate.count(),
    ]);
    return NextResponse.json({ items, fields: MODELS[model].fields, label: MODELS[model].label, statusOptions: MODELS[model].statusOptions, total, page, pageSize });
  } catch (e: any) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let model: string, data: any;
  try {
    const body = await req.json();
    model = body.model;
    data = body.data;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (!model || !MODELS[model]) return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
  
  // Clean i18n fields first
  cleanI18nFields(data);
  
  // Validate i18n fields
  const validation = validateI18nFields(data);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  
  const { delegate, fields } = MODELS[model];

  const clean: any = {};
  for (const f of fields) {
    if (data[f] !== undefined) clean[f] = data[f];
  }
  // Convert empty strings to null ONLY for optional fields
  for (const f of fields) {
    if (clean[f] === '' && !isRequiredField(model, f)) {
      clean[f] = null;
    }
    // Remove empty strings for required fields (let validation handle it)
    if (clean[f] === '' && isRequiredField(model, f)) {
      delete clean[f];
    }
  }

  // Enforce single default language
  if (model === 'language' && clean.isDefault === true) {
    await db.language.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
  }

  try {
    const item = await delegate.create({ data: clean });
    await logAction({ userId: admin.id, action: 'create', entity: model, entityId: item.id, req });
    return NextResponse.json({ success: true, item });
  } catch (e: any) {
    return handleError(e);
  }
}

export async function PUT(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let model: string, id: string, data: any;
  try {
    const body = await req.json();
    model = body.model;
    id = body.id;
    data = body.data;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (!model || !MODELS[model] || !id) return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  
  // Clean i18n fields first
  cleanI18nFields(data);
  
  // Validate i18n fields
  const validation = validateI18nFields(data);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  
  const { delegate, fields } = MODELS[model];

  const clean: any = {};
  for (const f of fields) {
    if (data[f] !== undefined) clean[f] = data[f];
  }
  // Convert empty strings to null ONLY for optional fields
  for (const f of fields) {
    if (clean[f] === '' && !isRequiredField(model, f)) {
      clean[f] = null;
    }
    // Remove empty strings for required fields (let validation handle it)
    if (clean[f] === '' && isRequiredField(model, f)) {
      delete clean[f];
    }
  }

  if (model === 'language' && clean.isDefault === true) {
    await db.language.updateMany({ where: { isDefault: true, NOT: { id } }, data: { isDefault: false } });
  }

  try {
    const item = await delegate.update({ where: { id }, data: clean });
    await logAction({ userId: admin.id, action: 'update', entity: model, entityId: id, req });
    return NextResponse.json({ success: true, item });
  } catch (e: any) {
    return handleError(e);
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const model = req.nextUrl.searchParams.get('model');
  const id = req.nextUrl.searchParams.get('id');
  if (!model || !MODELS[model] || !id) return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  const { delegate } = MODELS[model];

  try {
    await delegate.delete({ where: { id } });
    await logAction({ userId: admin.id, action: 'delete', entity: model, entityId: id, req });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return handleError(e);
  }
}

export { MODELS };
