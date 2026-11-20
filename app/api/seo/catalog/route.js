// GET /api/seo/catalog (Bearer SEO_PUBLISH_SECRET): this site's STATIC guides, for the Casa-Libre admin's SEO
// pipeline to judge which topics are already covered. Feed guides are not listed (the admin has them).
//   -> { site, guides: [{ cc, slug, path, title, h1, group }] }
import { SITE as site } from '@/lib/site';
import { getStaticGuides, sitePath } from '@/lib/content';
import { authorized, unauthorized } from '@/lib/seoAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!authorized(request)) return unauthorized();
  const guides = [];
  for (const cc of site.countries) {
    for (const g of await getStaticGuides(cc)) {
      guides.push({ cc, slug: g.slug, path: sitePath(cc, g.slug), title: g.title || '', h1: g.h1 || '', group: g.group || '' });
    }
  }
  return Response.json({ site: site.domain, guides }, { headers: { 'cache-control': 'no-store' } });
}
