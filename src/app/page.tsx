import { getSiteData } from '@/lib/get-site';
import { Home } from '@/components/site/home';
import { JsonLd } from '@/components/site/json-ld';

export const revalidate = 60;

export default async function Page() {
  const data = await getSiteData();
  return (
    <>
      <JsonLd />
      <Home data={data} />
    </>
  );
}
