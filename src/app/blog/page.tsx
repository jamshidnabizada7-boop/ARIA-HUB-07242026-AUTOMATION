import { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts } from '@/lib/blog-data';

export const metadata: Metadata = {
  title: 'Blog & Resources | ARIA HUB',
  description: 'Original insights, guides, and tips for global opportunities and business.',
};

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Blog & Resources
        </h1>
        <p className="text-lg text-muted-foreground">
          Original insights, guides, and tips to help you succeed globally.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <article key={post.slug} className="group relative flex flex-col items-start justify-between rounded-2xl border border-border/60 bg-card/40 p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
            <div className="flex items-center gap-x-4 text-xs">
              <time dateTime={post.date} className="text-muted-foreground">
                {post.date}
              </time>
              <span className="relative z-10 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">
                {post.category}
              </span>
            </div>
            <div className="group relative">
              <h3 className="mt-3 text-lg font-semibold leading-6 text-foreground group-hover:text-primary transition-colors">
                <Link href={`/blog/${post.slug}`}>
                  <span className="absolute inset-0" />
                  {post.title}
                </Link>
              </h3>
              <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {post.excerpt}
              </p>
            </div>
            <div className="relative mt-8 flex items-center gap-x-4">
              <div className="text-sm leading-6">
                <p className="font-semibold text-foreground">
                  <span className="absolute inset-0" />
                  {post.author}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
      
      <div className="mt-12 text-center text-sm text-muted-foreground">
        More articles coming soon. We regularly update our blog with valuable resources.
      </div>
    </main>
  );
}
