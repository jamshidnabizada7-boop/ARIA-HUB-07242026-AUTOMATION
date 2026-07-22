import { getSiteData } from '@/lib/get-site';

export async function JsonLd() {
  const data = await getSiteData();
  const s = data.settings;
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: s?.siteName || 'ARIA HUB',
    description: s?.description,
    url: '/',
    email: s?.email,
    telephone: s?.phone,
    address: s?.address ? { '@type': 'PostalAddress', streetAddress: s.address } : undefined,
    sameAs: data.socialLinks.map((l) => l.url),
  };
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: s?.siteName || 'ARIA HUB',
    url: '/',
    potentialAction: {
      '@type': 'SearchAction',
      target: '/api/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify([org, website]) }}
    />
  );
}
