// The AI SEO feed: guides written by the Casa-Libre admin's SEO pipeline, plus title/link overrides for the
// static guides. Server side only.
//
//   GET ${SEO_ADMIN_URL}/api/seo-sites/feed?site=<domain>   Authorization: Bearer ${SEO_PUBLISH_SECRET}
//
// Never throws and never slows a page down for long: 4 s timeout, cached 5 min (tag 'seo', dropped by
// POST /api/seo/publish). On any error the last good copy is used (Next's data cache keeps it across restarts,
// this module keeps it in memory), or the empty feed. Without the two env vars the feed is always empty and the
// site is exactly its static guides. Everything in the feed is cleaned by lib/seoFeedClean.js before use.
import { unstable_cache } from 'next/cache';
import { SITE as site } from './site.js';
import { COUNTRIES } from './countries.js';
import { cleanFeed, EMPTY_FEED } from './seoFeedClean.js';

export const SEO_TAG = 'seo';
const TIMEOUT_MS = 4000;
const MAX_BYTES = 5 * 1024 * 1024;

// Slugs that are pages of their own (or country folders): a feed guide can never take them.
const RESERVED = ['guias', 'glosario', 'como-escribimos', 'privacidad', 'contacto', 'api', 'gracias', 'sitemap', 'llms',
  ...Object.values(COUNTRIES).map((c) => c.prefix).filter(Boolean)];

export const feedConfigured = () => Boolean(process.env.SEO_ADMIN_URL && process.env.SEO_PUBLISH_SECRET);

/** The Casa-Libre host a guide of `cc` may link to (the check scripts allow only that country's Casa-Libre). */
const hostsFor = (cc) => (COUNTRIES[cc]?.clHost ? [COUNTRIES[cc].clHost] : []);

async function fetchFeed() {
  const base = String(process.env.SEO_ADMIN_URL).replace(/\/+$/, '');
  const url = `${base}/api/seo-sites/feed?site=${encodeURIComponent(site.domain)}`;
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${process.env.SEO_PUBLISH_SECRET}`, accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.status !== 200) throw new Error(`seo feed: HTTP ${res.status}`);
  const text = await res.text();
  if (text.length > MAX_BYTES) throw new Error('seo feed: too large');
  const feed = cleanFeed(JSON.parse(text), { domain: site.domain, countries: site.countries, hostsFor, reserved: RESERVED });
  return feed; // throwing above keeps an error out of the cache: the stale good copy stays
}

const cachedFeed = unstable_cache(fetchFeed, ['seo-feed', site.domain], { revalidate: 300, tags: [SEO_TAG] });

let lastGood = null;

/** The cleaned feed: { updatedAt, guides, overrides }. Never throws. */
export async function getSeoFeed() {
  if (!feedConfigured()) return EMPTY_FEED;
  try {
    const feed = await cachedFeed();
    if (feed && Array.isArray(feed.guides) && Array.isArray(feed.overrides)) {
      lastGood = feed;
      return feed;
    }
  } catch (e) {
    console.warn('[seo-feed] using the last good copy:', e?.name === 'TimeoutError' ? 'timeout' : e?.message || e);
  }
  return lastGood || EMPTY_FEED;
}
