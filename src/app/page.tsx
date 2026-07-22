import { getSiteData } from '@/lib/get-site';
import { Home } from '@/components/site/home';
import { JsonLd } from '@/components/site/json-ld';

export const revalidate = 60;
export const dynamic = 'force-dynamic'; // Force dynamic rendering for Turso database

export default async function Page() {
  const data = await getSiteData();
  return (
    <>
      <JsonLd />
      <Home data={data} />
    </>
  );
}
