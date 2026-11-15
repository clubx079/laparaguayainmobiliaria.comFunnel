// Every link to Casa-Libre carries UTM tags, so the Casa-Libre admin ("Where visitors come from") shows the visits
// this site sends as its own row:
//   utm_source   = the site's domain without dots
//   utm_medium   = funnel (owner and agent sites) | library
//   utm_campaign = seo-<country of the Casa-Libre site linked> (seo-py, seo-bo…)
//   utm_content  = the page slug (links in the text) or the spot on the page (header, record, sticky, gracias, llms-txt)
import { countryOfClUrl } from './countries.js';
import { SITE as site, utmSource } from './site.js';

export function cl(href, content) {
  if (!href || href.includes('utm_source=')) return href;
  const c = countryOfClUrl(href);
  if (!c) return href;
  const u = new URL(href);
  u.searchParams.set('utm_source', utmSource());
  u.searchParams.set('utm_medium', site.medium);
  u.searchParams.set('utm_campaign', `seo-${c.code}`);
  if (content) u.searchParams.set('utm_content', content);
  return u.toString();
}

const CL_HREF = /href="(https:\/\/(?:www\.)?(?:casa-libre\.com\.(?:py|bo|ve)|(?:uy|sv)\.casa-libre\.com)[^"]*)"/g;
const CL_URL = /^https:\/\/(www\.)?(casa-libre\.com\.(py|bo|ve)|(uy|sv)\.casa-libre\.com)(\/|\?|#|$)/;

/** Tags every Casa-Libre href inside an HTML string. */
export function clHtml(html, content) {
  return String(html).replace(CL_HREF, (m, url) => `href="${cl(url.replace(/&amp;/g, '&'), content).replace(/&/g, '&amp;')}"`);
}

/** Deep copy of a page with every Casa-Libre link tagged (strings that are a URL, and hrefs inside HTML strings). */
export function tagPage(page) {
  const content = page.slug || 'home';
  const tagAny = (v) => {
    if (typeof v === 'string') {
      if (CL_URL.test(v) && !/\s/.test(v)) return cl(v, content);
      return v.includes('href="https://') ? clHtml(v, content) : v;
    }
    if (Array.isArray(v)) return v.map(tagAny);
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === 'internalSources' ? x : tagAny(x)]));
    return v;
  };
  return tagAny(page);
}
