import { SITE as site, siteUrl, REVIEWED } from '@/lib/site';
import { getGuides, sitePath } from '@/lib/content';
import { glossaryFor } from '@/lib/glossary';
import { INFO_SLUGS } from '@/lib/routes';
import { alternatesFor, guiasAlternates } from '@/lib/alternates';

export const dynamic = 'force-static';

// Every public, indexable page of this site, on the production domain, once each:
//   the home and every guide of every country, each country's /guias/ index and /glosario/ (where it has one),
//   and the pages about the site (/como-escribimos/, /privacidad/, /contacto/).
// Nothing else is a page here (no redirects, no noindex pages, no search pages), and only this domain is listed.
// lastmod = the date the page's content last changed: the later of the guide's "Actualizado" date and the
// "Contenido revisado" date, both shown in its byline (never the build date). Indexes and info pages take the latest.
// Where a page has versions for other countries (hreflang), they are listed as xhtml:link alternates: the same set
// the page declares in its <head>. Check it against the running site: npm run check:sitemap
const later = (...d) => d.filter(Boolean).sort().pop() || '';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function GET() {
  const base = siteUrl();
  const rows = [];
  const seen = new Set();
  const add = (path, lastmod, languages) => {
    const loc = base + path;
    if (seen.has(loc)) return;
    seen.add(loc);
    rows.push({ loc, lastmod, languages });
  };
  for (const cc of site.countries) {
    const guides = await getGuides(cc);
    if (!guides.length) continue;
    const mods = guides.map((g) => later(g.published, g.updated, REVIEWED));
    const latest = later(...mods);
    for (let i = 0; i < guides.length; i++) add(sitePath(cc, guides[i].slug), mods[i], await alternatesFor(cc, guides[i].slug));
    add(sitePath(cc, 'guias'), latest, await guiasAlternates());
    if (glossaryFor(cc)) add(sitePath(cc, 'glosario'), latest);
    if (cc === site.rootCountry) for (const s of INFO_SLUGS) add(sitePath(cc, s), latest);
  }
  const hasAlt = rows.some((r) => r.languages);
  const url = (r) => {
    const alt = r.languages ? Object.entries(r.languages).map(([lang, href]) => `\n  <xhtml:link rel="alternate" hreflang="${lang}" href="${esc(href)}"/>`).join('') : '';
    return `<url>\n  <loc>${esc(r.loc)}</loc>${r.lastmod ? `\n  <lastmod>${r.lastmod}</lastmod>` : ''}${alt}\n</url>`;
  };
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${hasAlt ? ' xmlns:xhtml="http://www.w3.org/1999/xhtml"' : ''}>\n${rows.map(url).join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
