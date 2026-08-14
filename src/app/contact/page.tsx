import { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';
import { db } from '@/lib/db';
import { ContactForm } from './contact-form';

export const metadata: Metadata = {
  title: 'Contact Us | ARIA HUB',
  description: 'Get in touch with the ARIA HUB team. We are here to help you with visa services, scholarships, job opportunities, and more.',
};

export default async function ContactPage() {
  let contentHtml = '';
  let title = 'Contact Us';

  // Try to load settings for real contact info
  let settings: { address?: string | null; phone?: string | null; email?: string | null } | null = null;
  try {
    const page = await db.page.findUnique({ where: { slug: 'contact' } });
    if (page && page.status === 'published') {
      contentHtml = page.content;
      title = page.title;
    }
    settings = await db.siteSetting.findFirst({ select: { address: true, phone: true, email: true } });
  } catch {
    // DB might not be connected yet
  }

  const address = settings?.address || 'Kabul, Afghanistan';
  const phone = settings?.phone || '+93 (0) 79 000 0000';
  const email = settings?.email || 'info@myariahub.com';

  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8" dir="auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">{title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {contentHtml ? '' : 'Have a question or need assistance? We\'re here to help.'}
        </p>
        {contentHtml && (
          <div
            className="prose prose-sm dark:prose-invert sm:prose-base max-w-none mt-4 text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-5">
        {/* Contact Info Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-foreground">Get in Touch</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Address</p>
                  <p className="mt-0.5 text-sm text-muted-foreground" dir="auto">{address}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Email</p>
                  <a
                    href={`mailto:${email}`}
                    className="mt-0.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                    dir="auto"
                  >
                    {email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Phone</p>
                  <a
                    href={`tel:${phone.replace(/\s/g, '')}`}
                    className="mt-0.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                    dir="auto"
                  >
                    {phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Why contact us */}
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">We help with</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                'Visa & immigration questions',
                'Scholarship & job opportunities',
                'Business consulting services',
                'Account & technical support',
                'Partnership inquiries',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-3">
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
