// Pure helpers for the AI SEO feed (lib/seoFeed.js): validate and clean everything the admin sends, and merge the
// pipeline guides and overrides into this site's static guides. No Next, no React, no site imports: everything the
// functions need comes in as arguments, so tests/seoFeed.test.mjs can run them with plain `node --test`.
//
// Rule: nothing from the feed is trusted. A field that is not what we expect is dropped; a guide that is missing
// what a page needs is dropped whole. HTML keeps only <a href> (internal paths or the guide's Casa-Libre site),
// <strong> and <em>; every other tag goes, text is escaped.

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const PIPELINE_GROUP = 'Nuevas guías';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const LIMITS = { guides: 500, overrides: 500, sections: 12, blocks: 30, items: 30, faq: 10, summary: 8, extraLinks: 10, html: 4000, text: 600 };

// ---- text ----------------------------------------------------------------------------------------------------

const decodeEntities = (s) => s
  .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#0*39;|&#x0*27;|&apos;/gi, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/** Plain text: tags removed, entities decoded, control characters and extra spaces gone, cut at `max`. */
export function cleanText(v, max = LIMITS.text) {
  if (typeof v !== 'string') return '';
  let s = v.replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, ' ').replace(/<[^>]*>/g, ' ');
  s = decodeEntities(s).replace(/[\u0000-\u001f\u007f\u2028\u2029]/g, ' ').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
  if (s.length > max) s = s.slice(0, max).replace(/\s+\S*$/, '').trim() || s.slice(0, max);
  return s;
}

const escText = (s) => s.replace(/&(?!(?:[a-z]{2,8}|#\d{1,6}|#x[0-9a-f]{1,6});)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A path on this site: /, /slug/, /bolivia/slug/ (optional #anchor). Returns the normalized path or ''. */
export function internalPath(href) {
  if (typeof href !== 'string') return '';
  const m = /^(\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/?){0,3})(#[a-z0-9-]{1,80})?$/.exec(href.trim());
  if (!m || m[1].startsWith('//')) return '';
  const p = m[1].endsWith('/') ? m[1] : `${m[1]}/`;
  return p + (m[2] || '');
}

/** An https link to one of `hosts` (with or without www). Returns the URL string or ''. */
export function casaLibreUrl(href, hosts = []) {
  if (typeof href !== 'string' || !/^https:\/\//i.test(href.trim())) return '';
  let u;
  try { u = new URL(href.trim()); } catch { return ''; }
  if (u.protocol !== 'https:' || u.username || u.password || u.port) return '';
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  return hosts.includes(host) ? u.toString() : '';
}

/** href allowed in pipeline HTML: an internal path or the Casa-Libre site(s) in `hosts`. '' when not allowed. */
export function allowedHref(raw, hosts = []) {
  const href = decodeEntities(String(raw || '')).trim();
  if (href.startsWith('/')) return internalPath(href);
  return casaLibreUrl(href, hosts);
}

const ALLOWED = new Set(['a', 'strong', 'em']);
const DROP_WITH_CONTENT = /<(script|style|iframe|object|embed|template|noscript|textarea|select|svg|math|title)\b[\s\S]*?<\/\1\s*>/gi;

/** HTML with only <a href>, <strong>, <em>. Tags are rebuilt (no attributes besides href), balanced, never nested <a>. */
export function sanitizeHtml(v, { hosts = [], max = LIMITS.html } = {}) {
  if (typeof v !== 'string') return '';
  let src = v.replace(/<!--[\s\S]*?(-->|$)/g, '').replace(DROP_WITH_CONTENT, '');
  src = src.replace(/<(script|style|iframe|object|embed|template|noscript|textarea|select|svg|math|title)\b[\s\S]*$/gi, ''); // unclosed
  src = src.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
  const out = [];
  const open = [];
  const re = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^<>]*)>|<|>/g;
  let last = 0;
  let m;
  while ((m = re.exec(src))) {
    out.push(escText(src.slice(last, m.index)));
    last = re.lastIndex;
    if (!m[1]) continue; // a lone < or > is dropped
    const name = m[1].toLowerCase();
    const closing = m[0].startsWith('</');
    if (!ALLOWED.has(name)) continue;
    if (closing) {
      const i = open.lastIndexOf(name);
      if (i === -1) continue;
      while (open.length > i) out.push(`</${open.pop()}>`);
      continue;
    }
    if (name === 'a') {
      if (open.includes('a')) continue;
      const hm = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i.exec(m[2]);
      const href = hm ? allowedHref(hm[1] ?? hm[2] ?? hm[3], hosts) : '';
      if (!href) continue; // the text stays, the link goes
      out.push(`<a href="${escAttr(href)}">`);
      open.push('a');
      continue;
    }
    if (open.length >= 6) continue;
    out.push(`<${name}>`);
    open.push(name);
  }
  out.push(escText(src.slice(last)));
  while (open.length) out.push(`</${open.pop()}>`);
  let html = out.join('').replace(/\s+/g, ' ').trim();
  if (html.length > max) return ''; // too long to cut safely: drop it
  // empty once the tags are gone = nothing to show
  return cleanText(html) ? html : '';
}

const arr = (v, max) => (Array.isArray(v) ? v.slice(0, max) : []);
const date = (v) => (typeof v === 'string' && DATE_RE.test(v.slice(0, 10)) ? v.slice(0, 10) : '');
const anchor = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

// ---- guides --------------------------------------------------------------------------------------------------

/**
 * One pipeline guide, cleaned, or null when it is not usable.
 * opts: { countries: ['py',…], hostsFor: (cc) => ['casa-libre.com.py'], reserved: ['guias', …] }
 */
export function cleanGuide(raw, { countries = [], hostsFor = () => [], reserved = [] } = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const cc = typeof raw.cc === 'string' ? raw.cc.toLowerCase() : '';
  if (!countries.includes(cc)) return null;
  const slug = typeof raw.slug === 'string' ? raw.slug : '';
  if (!SLUG_RE.test(slug) || slug.length > 100 || reserved.includes(slug)) return null;
  const hosts = hostsFor(cc) || [];
  const html = (x) => sanitizeHtml(x, { hosts });

  const title = cleanText(raw.title, 70);
  const h1 = cleanText(raw.h1, 140) || title;
  const answer = cleanText(raw.answer, 1200);
  if (!title || !h1 || !answer) return null;

  const ids = new Set(['por-que-casa-libre', 'todas-las-guias', 'preguntas', 'fuentes', 'citar', 'seguir', 'mas-guias']);
  const sections = [];
  for (const s of arr(raw.sections, LIMITS.sections)) {
    if (!s || typeof s !== 'object') continue;
    const h2 = cleanText(s.h2, 160);
    if (!h2) continue;
    const blocks = [];
    for (const b of arr(s.blocks, LIMITS.blocks)) {
      if (!b || typeof b !== 'object') continue;
      if (b.t === 'p') { const x = html(b.html); if (x) blocks.push({ t: 'p', html: x }); }
      else if (b.t === 'ul') { const items = arr(b.items, LIMITS.items).map(html).filter(Boolean); if (items.length) blocks.push({ t: 'ul', items }); }
    }
    if (!blocks.length) continue;
    let id = (typeof s.id === 'string' && SLUG_RE.test(s.id) ? s.id : anchor(h2)).slice(0, 80) || `seccion-${sections.length + 1}`;
    while (ids.has(id)) id = `${id}-${sections.length + 1}`;
    ids.add(id);
    sections.push({ id, h2, blocks });
  }
  if (!sections.length) return null;

  const faq = arr(raw.faq, LIMITS.faq).map((f) => (f && typeof f === 'object' ? { q: cleanText(f.q, 200), a: html(f.a) } : null)).filter((f) => f && f.q && f.a);
  const summary = arr(raw.summary, LIMITS.summary).map(html).filter(Boolean);
  const related = arr(raw.related, 10).filter((x) => typeof x === 'string' && SLUG_RE.test(x));
  const published = date(raw.published) || date(raw.updated);
  const updated = date(raw.updated) || published;

  return {
    cc, slug, title, h1,
    description: cleanText(raw.description, 160),
    navLabel: cleanText(raw.navLabel, 60),
    blurb: cleanText(raw.blurb, 240),
    published, updated, answer, summary, sections, faq, related,
    source: 'pipeline',
  };
}

/** One override, cleaned, or null. { path, title?, h1?, description?, extraLinks:[{href,label}] } */
export function cleanOverride(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const path = internalPath(raw.path);
  if (!path || path.includes('#')) return null;
  const out = { path };
  const title = cleanText(raw.title, 70);
  const h1 = cleanText(raw.h1, 140);
  const description = cleanText(raw.description, 160);
  if (title) out.title = title;
  if (h1) out.h1 = h1;
  if (description) out.description = description;
  const seen = new Set();
  out.extraLinks = arr(raw.extraLinks ?? raw.extra_links, LIMITS.extraLinks).map((l) => {
    if (!l || typeof l !== 'object') return null;
    const href = internalPath(l.href);
    const label = cleanText(l.label, 120);
    if (!href || !label || seen.has(href)) return null;
    seen.add(href);
    return { href, label };
  }).filter(Boolean);
  return out.title || out.h1 || out.description || out.extraLinks.length ? out : null;
}

export const EMPTY_FEED = Object.freeze({ updatedAt: '', guides: Object.freeze([]), overrides: Object.freeze([]) });

/** The whole feed response, cleaned. Anything that is not the expected shape gives the empty feed. */
export function cleanFeed(raw, { domain, ...opts } = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return EMPTY_FEED;
  if (domain && raw.site && raw.site !== domain) return EMPTY_FEED;
  const guides = [];
  const keys = new Set();
  for (const g of arr(raw.guides, LIMITS.guides)) {
    const x = cleanGuide(g, opts);
    if (!x || keys.has(`${x.cc}/${x.slug}`)) continue;
    keys.add(`${x.cc}/${x.slug}`);
    guides.push(x);
  }
  const overrides = [];
  const paths = new Set();
  for (const o of arr(raw.overrides, LIMITS.overrides)) {
    const x = cleanOverride(o);
    if (!x || paths.has(x.path)) continue;
    paths.add(x.path);
    overrides.push(x);
  }
  return { updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt.slice(0, 40) : '', guides, overrides };
}

// ---- merge ---------------------------------------------------------------------------------------------------

/**
 * The guides of one country with the feed applied:
 *   - static guides first, unchanged except for overrides (title/h1/description, extraLinks);
 *   - then the feed's guides of that country whose slug is not a static guide (a static guide always wins),
 *     in group PIPELINE_GROUP, passed through `prepare` (the loader's finishing step: UTM tags…).
 * opts: { pathOf: (cc, slug) => '/slug/', prepare: (page) => page, extraPaths: ['/guias/'] }
 * Extra links survive only when they point to a page that exists (a guide of this list or one of `extraPaths`).
 */
export function mergeGuides(staticGuides, feed, cc, { pathOf, prepare = (p) => p, extraPaths = [] } = {}) {
  const base = Array.isArray(staticGuides) ? staticGuides : [];
  if (!feed || (!feed.guides?.length && !feed.overrides?.length) || typeof pathOf !== 'function') return base;
  const taken = new Set(base.map((g) => g.slug));
  const added = [];
  for (const g of feed.guides || []) {
    if (g.cc !== cc || taken.has(g.slug)) continue;
    taken.add(g.slug);
    try {
      const p = prepare({ ...g, kind: 'guide', group: PIPELINE_GROUP });
      if (p) added.push(p);
    } catch { /* a guide that cannot be prepared is skipped */ }
  }
  const all = [...base, ...added];
  if (!feed.overrides?.length) return all;
  const byPath = new Map(feed.overrides.map((o) => [o.path, o]));
  const known = new Set([...all.map((g) => pathOf(cc, g.slug)), ...extraPaths]);
  return all.map((g) => {
    const o = byPath.get(pathOf(cc, g.slug));
    if (!o) return g;
    const own = pathOf(cc, g.slug);
    const extraLinks = (o.extraLinks || []).filter((l) => l.href.split('#')[0] !== own && known.has(l.href.split('#')[0]));
    return {
      ...g,
      ...(o.title ? { title: o.title } : {}),
      ...(o.h1 ? { h1: o.h1 } : {}),
      ...(o.description ? { description: o.description } : {}),
      ...(extraLinks.length ? { extraLinks } : {}),
    };
  });
}
