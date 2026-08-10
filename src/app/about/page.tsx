import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | ARIA HUB',
  description: 'Learn about ARIA HUB, our mission, and our team.',
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8" dir="auto">
      <div className="rounded-2xl border border-border/60 bg-card/40 p-8 shadow-sm backdrop-blur-sm md:p-12">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground md:text-4xl text-start">
          About ARIA HUB
        </h1>
        
        <div className="prose prose-sm dark:prose-invert sm:prose-base max-w-none space-y-6 text-muted-foreground text-start">
          <section>
            <h2 className="text-2xl font-semibold text-foreground">Our Mission</h2>
            <p>
              At ARIA HUB, our mission is to empower individuals and businesses by connecting them with premium global opportunities. We believe that access to the right information and professional guidance is the key to international success. Whether you are looking for educational scholarships, business consulting, or visa services, we are here to bridge the gap.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground">What We Do</h2>
            <p>
              We curate and provide high-quality resources, actionable advice, and professional services across several domains:
            </p>
            <ul className="list-disc ps-5 mt-2 space-y-2">
              <li><strong>Opportunities & Scholarships:</strong> We aggregate and analyze the best global opportunities to help students and professionals advance their careers.</li>
              <li><strong>Visa Preparation:</strong> Expert guidance on navigating complex immigration and visa processes.</li>
              <li><strong>Business Services:</strong> Comprehensive consulting for businesses looking to expand internationally.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground">Why Choose Us?</h2>
            <p>
              Unlike standard opportunity aggregators, we provide deep insights, customized resources (such as CV builders and interview prep tools), and personalized consulting to ensure our users don't just find an opportunity, but successfully secure it.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
