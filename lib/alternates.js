// hreflang groups, used when the site covers several countries. The key of a group
// is the Paraguay slug: a country page joins the group of the PY page it is the local version of
// (`equivalentOf: '<py slug>'` in its file; a country home is always the version of the PY home).
// Pages with no equivalent anywhere get no hreflang at all. x-default points to the Paraguay version.
import { getGuides, sitePath } from './content.js';
import { COUNTRIES } from './countries.js';
import { SITE as site, siteUrl } from './site.js';

async function keyOf(cc, slug) {
  if (cc === site.rootCountry) return slug;
  if (slug === '') return '';
  const page = (await getGuides(cc)).find((g) => g.slug === slug);
  return page && typeof page.equivalentOf === 'string' ? page.equivalentOf : null;
}

export async function alternatesFor(cc, slug) {
  if (site.countries.length < 2) return null;
  const key = await keyOf(cc, slug);
  if (key === null) return null;
  const base = siteUrl();
  const langs = {};
  const root = site.rootCountry;
  if ((await getGuides(root)).some((g) => g.slug === key)) langs[COUNTRIES[root].lang] = base + sitePath(root, key);
  for (const c of site.countries.filter((x) => x !== root)) {
    const match = (await getGuides(c)).find((g) => (key === '' ? g.slug === '' : g.slug !== '' && g.equivalentOf === key));
    if (match) langs[COUNTRIES[c].lang] = base + sitePath(c, match.slug);
  }
  if (Object.keys(langs).length < 2) return null;
  if (langs[COUNTRIES[root].lang]) langs['x-default'] = langs[COUNTRIES[root].lang];
  return langs;
}

/** The /guias/ indexes: every country of the site that has at least one guide. */
export async function guiasAlternates() {
  if (site.countries.length < 2) return null;
  const base = siteUrl();
  const langs = {};
  for (const c of site.countries) if ((await getGuides(c)).length) langs[COUNTRIES[c].lang] = base + sitePath(c, 'guias');
  if (Object.keys(langs).length < 2) return null;
  langs['x-default'] = base + sitePath(site.rootCountry, 'guias');
  return langs;
}
