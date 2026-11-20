// URL -> what to render. Server side only.
//   /                       the main guide (home)
//   /<slug>/                a guide
//   /guias/                 every guide, by topic
//   /glosario/              the glossary (where the country has one)
//   /como-escribimos/ /privacidad/ /contacto/
//   /<country>/…            the same, for any other country this site covers
import { SITE as site } from './site.js';
import { countryByPrefix, COUNTRIES } from './countries.js';
import { getGuides, getGuide } from './content.js';
import { glossaryFor } from './glossary.js';

export const INFO_SLUGS = ['como-escribimos', 'privacidad', 'contacto'];

export async function resolve(parts = []) {
  let cc = site.rootCountry;
  let rest = parts;
  const c = countryByPrefix(parts[0]);
  if (c && c.code !== site.rootCountry && site.countries.includes(c.code)) { cc = c.code; rest = parts.slice(1); }
  if (rest.length > 1) return null;
  const slug = rest[0] || '';
  if (slug === 'guias') return { type: 'guias', cc };
  if (slug === 'glosario') return glossaryFor(cc) ? { type: 'glosario', cc } : null;
  if (INFO_SLUGS.includes(slug)) return cc === site.rootCountry ? { type: 'info', cc, slug } : null;
  const page = await getGuide(cc, slug);
  return page ? { type: 'guide', cc, page } : null;
}

/** Every path of the site, as generateStaticParams wants it. AI SEO feed guides are included when the feed answers
 *  at build time; the ones published later render on demand (see app/[[...path]]/page.js). */
export async function allParams() {
  const out = [];
  for (const cc of site.countries) {
    const pre = cc === site.rootCountry ? [] : [COUNTRIES[cc].prefix];
    const guides = await getGuides(cc);
    if (!guides.length) continue;
    for (const g of guides) out.push([...pre, ...(g.slug ? [g.slug] : [])]);
    out.push([...pre, 'guias']);
    if (glossaryFor(cc)) out.push([...pre, 'glosario']);
    if (cc === site.rootCountry) for (const s of INFO_SLUGS) out.push([s]);
  }
  return out.map((p) => ({ path: p.length ? p : undefined }));
}
