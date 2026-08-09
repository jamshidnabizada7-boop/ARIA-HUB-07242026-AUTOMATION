import { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | ARIA HUB',
  description: 'Get in touch with the ARIA HUB team.',
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border/60 bg-card/40 p-8 shadow-sm backdrop-blur-sm md:p-12">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Contact Us
        </h1>
        <p className="mb-8 text-muted-foreground">
          Have a question or need assistance? We're here to help. Reach out to our team using the contact information below.
        </p>
        
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Our Office</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Address</p>
                  <p className="text-muted-foreground" dir="auto">Kabul, Afghanistan</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <a href="mailto:info@ariahub.com" className="text-muted-foreground hover:text-primary transition-colors" dir="auto">info@ariahub.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Phone</p>
                  <a href="tel:+93000000000" className="text-muted-foreground hover:text-primary transition-colors" dir="auto">+93 (0) 00 000 0000</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Send a Message</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">Full Name</label>
                <input type="text" id="name" className="w-full rounded-lg border border-border/60 bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">Email Address</label>
                <input type="email" id="email" className="w-full rounded-lg border border-border/60 bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground">Message</label>
                <textarea id="message" rows={4} className="w-full rounded-lg border border-border/60 bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="How can we help you?"></textarea>
              </div>
              <button type="button" className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
