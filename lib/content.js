// Loads the guides of this site. Server side only.
//
//   content/pages/*.js          the guides of the site's own country (home.js = the home page)
//   content/pages/<cc>/*.js     the guides of any other country the site covers (bo, uy, ve, sv)
//
// Order and groups: lib/data/order.js. When it lists GUIDES, that list is the order; otherwise every file in the
// folder is a page and carries its own `group` and `order`. A file that does not load is skipped.
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { cache } from 'react';
import { SITE as site } from './site.js';
import { COUNTRIES } from './countries.js';
import { tagPage } from './utm.js';
import { GUIDES, GROUPS, isRentalSlug } from './data/order.js';
import { getSeoFeed } from './seoFeed.js';
import { mergeGuides, PIPELINE_GROUP } from './seoFeedClean.js';

async function load(rel) {
  try {
    const mod = await import(`../content/pages/${rel}.js`);
    return mod.default || null;
  } catch {
    return null;
  }
}

function filesIn(rel) {
  try {
    return readdirSync(path.join(process.cwd(), 'content', 'pages', rel))
      .filter((f) => f.endsWith('.js') && !f.startsWith('_')).map((f) => f.replace(/\.js$/, '')).sort();
  } catch {
    return [];
  }
}

/** Topic groups, in menu order. The AI SEO pipeline's guides come last, in their own group. */
export const groupsOf = () => (GROUPS.includes(PIPELINE_GROUP) ? GROUPS : [...GROUPS, PIPELINE_GROUP]);

/** Where a country's pages live: '' at the root for the site's own country, '/bolivia' etc. otherwise. */
export function sitePath(cc, slug) {
  const prefix = cc === site.rootCountry ? '' : COUNTRIES[cc]?.prefix || '';
  const parts = [prefix, slug].filter(Boolean);
  return parts.length ? `/${parts.join('/')}/` : '/';
}

// Guides written when this country lived under a folder (/bolivia/…) keep working now that it is at the root.
const fixInternal = (cc, page) => {
  const prefix = COUNTRIES[cc].prefix;
  if (cc === site.rootCountry && prefix) return JSON.parse(JSON.stringify(page).replaceAll(`href=\\"/${prefix}/`, 'href=\\"/'));
  return page;
};

// "Respuesta breve" answers the question and nothing else: a closing sentence that only promotes Casa-Libre is
// dropped. Casa-Libre appears in the card, the body and the key points instead.
function plainAnswer(answer) {
  const text = String(answer || '');
  if (!text.includes('Casa-Libre')) return text;
  // sentence boundaries only: a full stop followed by a space and a capital (never the dots inside Gs. 1.200.000)
  const parts = text.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡])/);
  // a sentence that names Casa-Libre and carries no figure is the promotional close; one with a figure is data
  const kept = parts.filter((x) => !(x.includes('Casa-Libre') && !/\d/.test(x)));
  const out = kept.join(' ').trim();
  return out.split(/\s+/).length >= 25 ? out : text;
}

// "Por qué Casa-Libre": one extra section per guide, kept apart from the guide itself in content/why/<cc>.js
// ({ '<file name>': { title, paras: [html, …] } }; 'home' for the home page).
const whyCache = new Map();
async function whyFor(cc) {
  if (!whyCache.has(cc)) {
    let data = {};
    try { data = (await import(`../content/why/${cc}.js`)).default || {}; } catch { data = {}; }
    whyCache.set(cc, data);
  }
  return whyCache.get(cc);
}

// The Casa-Libre sentence that closes each answer of "Preguntas y respuestas", kept apart from the guides in
// content/faqcl/<cc>.js ({ '<file name>': ['sentence for question 1', '…'] }, same order as the page's faq; '' = none).
const faqCache = new Map();
async function faqFor(cc) {
  if (!faqCache.has(cc)) {
    let data = {};
    try { data = (await import(`../content/faqcl/${cc}.js`)).default || {}; } catch { data = {}; }
    faqCache.set(cc, data);
  }
  return faqCache.get(cc);
}

const finish = (cc, page, extra, why, faqAdd) => {
  const p = fixInternal(cc, { ...page, ...extra, kind: 'guide', cc });
  p.answer = plainAnswer(p.answer);
  if (why?.title && why.paras?.length) p.why = why;
  if (Array.isArray(faqAdd) && Array.isArray(p.faq) && faqAdd.length === p.faq.length) {
    p.faq = p.faq.map((f, i) => (faqAdd[i] ? { ...f, a: `${f.a} ${faqAdd[i]}` } : f));
  }
  return tagPage(p);
};

const rank = (g) => { const i = GROUPS.indexOf(g); return i === -1 ? GROUPS.length : i; };

async function folderGuides(cc, rel) {
  const why = await whyFor(cc);
  const faq = await faqFor(cc);
  const pages = await Promise.all(filesIn(rel).map(async (name) => {
    const page = await load(rel ? `${rel}/${name}` : name);
    if (!page || page.kind === 'plain') return null;
    return finish(cc, page, { slug: name === 'home' ? '' : name, group: page.group || GROUPS[0] }, why[name], faq[name]);
  }));
  return pages.filter(Boolean).sort((a, b) => (a.slug === '' ? -1 : b.slug === '' ? 1 : 0)
    || rank(a.group) - rank(b.group) || (a.order ?? 999) - (b.order ?? 999) || a.slug.localeCompare(b.slug));
}

async function listedGuides(cc, list) {
  const why = await whyFor(cc);
  const faq = await faqFor(cc);
  const pages = await Promise.all(list.map(async (g) => {
    const page = await load(g.file || g.slug);
    return page ? finish(cc, page, { slug: g.slug, group: g.group, nav: g.nav, city: g.city, cityName: g.cityName }, why[g.file || g.slug], faq[g.file || g.slug]) : null;
  }));
  return pages.filter(Boolean);
}

/** The static guides of a country (content/pages), home first, then by group. */
export const getStaticGuides = cache(async (cc) => {
  if (!site.countries.includes(cc)) return [];
  if (cc !== site.rootCountry) return folderGuides(cc, cc);
  return GUIDES ? listedGuides(cc, GUIDES) : folderGuides(cc, '');
});

// A guide from the AI SEO feed, finished like a static one (answer, Casa-Libre UTM tags). Already cleaned.
const finishPipeline = (cc, page) => {
  const p = tagPage({ ...page, kind: 'guide', cc, group: PIPELINE_GROUP });
  p.answer = plainAnswer(p.answer);
  return p;
};

/** Every guide of a country: the static guides (with the feed's overrides) and then the AI SEO feed's guides.
 *  A static guide always wins over a feed guide with the same slug. The feed can never break this list:
 *  on any problem it is the static guides alone. */
export const getGuides = cache(async (cc) => {
  const base = await getStaticGuides(cc);
  if (!base.length) return base;
  try {
    const feed = await getSeoFeed();
    return mergeGuides(base, feed, cc, { pathOf: sitePath, prepare: (p) => finishPipeline(cc, p), extraPaths: [sitePath(cc, 'guias')] });
  } catch {
    return base;
  }
});

export async function getGuide(cc, slug) {
  return (await getGuides(cc)).find((p) => p.slug === slug) || null;
}

/** Latest "updated" date among a country's guides (the edition date in the top strip). */
export async function editionDate(cc) {
  const guides = await getGuides(cc);
  return guides.map((g) => g.updated).filter(Boolean).sort().pop() || '';
}

export const isRental = (page) => page.rental === true || isRentalSlug(page.slug);

/** Words of body text, for the reading-time line. */
export function wordCount(page) {
  const strip = (s) => String(s || '').replace(/<[^>]+>/g, ' ');
  const parts = [page.answer, ...(page.summary || [])];
  for (const s of page.sections || []) {
    parts.push(s.h2);
    for (const b of s.blocks || []) {
      parts.push(b.html, b.text, b.title, b.caption, b.note, ...(b.items || []).map((i) => (typeof i === 'string' ? i : `${i.title} ${i.html}`)));
      for (const r of b.rows || []) parts.push(r.join(' '));
    }
  }
  for (const f of page.faq || []) parts.push(f.q, f.a);
  return strip(parts.filter(Boolean).join(' ')).split(/\s+/).filter(Boolean).length;
}

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
/** '2026-11-12' -> '12 de noviembre de 2026' (no Date object: no timezone surprises). */
export function fechaLarga(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  if (!m) return iso || '';
  return `${Number(m[3])} de ${MONTHS[Number(m[2]) - 1]} de ${m[1]}`;
}
/** '2026-11-12' -> '12 nov 2026' */
export function fechaCorta(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  if (!m) return iso || '';
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1].slice(0, 3)} ${m[1]}`;
}

export const anchorOf = (name) => String(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
