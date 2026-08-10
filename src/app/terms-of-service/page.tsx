import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | ARIA HUB',
  description: 'Terms of Service for ARIA HUB.',
};

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8" dir="auto">
      <div className="rounded-2xl border border-border/60 bg-card/40 p-8 shadow-sm backdrop-blur-sm md:p-12">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground md:text-4xl text-start">
          Terms of Service
        </h1>
        
        <div className="prose prose-sm dark:prose-invert sm:prose-base max-w-none space-y-6 text-muted-foreground text-start">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing and using ARIA HUB, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
            <p>
              ARIA HUB provides business consulting, visa services, and an aggregation of global opportunities. We strive to ensure the accuracy of the information provided on our platform, but we do not guarantee the completeness or reliability of external job postings or scholarship listings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. User Conduct</h2>
            <p>
              You agree to use our services only for lawful purposes. You are prohibited from violating or attempting to violate the security of the website, including, without limitation:
            </p>
            <ul className="list-disc ps-5 mt-2">
              <li>Accessing data not intended for you or logging into a server or account which you are not authorized to access.</li>
              <li>Attempting to probe, scan or test the vulnerability of a system or network or to breach security or authentication measures without proper authorization.</li>
              <li>Attempting to interfere with service to any user, host or network.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-foreground">4. External Links</h2>
            <p>
              Our website may contain links to third-party websites or services that are not owned or controlled by ARIA HUB. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third party web sites or services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Modifications to Terms</h2>
            <p>
              ARIA HUB reserves the right to modify these terms at any time. We will do our best to notify users of any significant changes, but it is your responsibility to review these terms periodically.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
