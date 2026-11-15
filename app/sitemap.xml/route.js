import { SITE as site, siteUrl } from '@/lib/site';
import { getGuides, sitePath } from '@/lib/content';
import { glossaryFor } from '@/lib/glossary';
import { INFO_SLUGS } from '@/lib/routes';

export const dynamic = 'force-static';

// The guides (home included), the index of guides, the glossary and the info pages.
// lastmod is the date the content really changed, never the build date.
export async function GET() {
  const base = siteUrl();
  const rows = [];
  for (const cc of site.countries) {
    const guides = await getGuides(cc);
    if (!guides.length) continue;
    const latest = guides.map((p) => p.updated).filter(Boolean).sort().pop();
    for (const g of guides) rows.push([base + sitePath(cc, g.slug), g.updated]);
    rows.push([base + sitePath(cc, 'guias'), latest]);
    if (glossaryFor(cc)) rows.push([base + sitePath(cc, 'glosario'), latest]);
    if (cc === site.rootCountry) for (const s of INFO_SLUGS) rows.push([base + sitePath(cc, s), latest]);
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
    rows.map(([loc, mod]) => `<url><loc>${loc}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
