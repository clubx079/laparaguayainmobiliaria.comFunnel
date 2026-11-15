// Checks the guides in content/pages (language, links, structure): node scripts/check-content.mjs [slug…]
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const rule = {"host":"casa-libre.com.py","voice":"voseo","library":true};
const only = process.argv.slice(2);
const dir = path.join(process.cwd(), 'content', 'pages');
const files = readdirSync(dir).filter((f) => f.endsWith('.js') && !f.startsWith('_'));
const slugs = new Set(files.map((f) => (f === 'home.js' ? '' : f.replace(/\.js$/, ''))));
const BANNED = /\b(infocasas|clasipar|re\/?max|remax|century ?21|facebook|instagram|tiktok|youtube|google|mercado ?libre|olx|ultracasas|infoinmobiliaria|zillow|airbnb|booking|abc color|[úu]ltima hora|el deber|los tiempos|la raz[oó]n|p[aá]gina siete|ueno|ita[uú]|banco (uni[oó]n|continental|familiar|atlas|basa|gnb|mercantil|bisa|fie|sol|ganadero|nacional de bolivia)|visi[oó]n banco|cooperativa universitaria)\b/i;
const TU = /\b(tienes|puedes|quieres|debes|necesitas|sabes|haces|eres|tú)\b/;
const VOS = /\b(tenés|podés|querés|sabés|hacés|fijate|mirá|pedí|publicá|escribí|compará|preguntá|elegí|buscá|revisá|vos)\b/;
const strip = (s) => String(s || '').replace(/<[^>]+>/g, ' ');
let errors = 0;
let warns = 0;
const err = (f, m) => { errors++; console.log(`ERROR ${f}: ${m}`); };
const warn = (f, m) => { warns++; console.log(`warn  ${f}: ${m}`); };

for (const f of files) {
  const slug = f === 'home.js' ? '' : f.replace(/\.js$/, '');
  if (only.length && !only.includes(slug || 'home')) continue;
  let p;
  try { p = (await import(pathToFileURL(path.join(dir, f)).href)).default; } catch (e) { err(f, `does not load: ${e.message}`); continue; }
  if (!p) { err(f, 'no default export'); continue; }
  if ((p.slug || '') !== slug) err(f, `slug "${p.slug}" does not match the file name`);
  for (const k of ['title', 'h1', 'description', 'navLabel', 'blurb', 'group', 'answer', 'published', 'updated']) if (!p[k]) err(f, `missing ${k}`);
  if (p.title && (p.title.length < 35 || p.title.length > 66)) warn(f, `title is ${p.title.length} characters (50 to 62)`);
  if (p.description && (p.description.length < 120 || p.description.length > 165)) warn(f, `description is ${p.description.length} characters (140 to 160)`);
  if (p.blurb && p.blurb.length > 150) warn(f, `blurb is ${p.blurb.length} characters (max 140)`);
  const aw = strip(p.answer).split(/\s+/).filter(Boolean).length;
  if (aw < 50 || aw > 125) warn(f, `answer has ${aw} words (60 to 110)`);
  if (/casa-?libre/i.test(p.answer || '')) err(f, 'answer mentions Casa-Libre');
  if (!Array.isArray(p.summary) || p.summary.length < 4 || p.summary.length > 6) err(f, 'summary needs 4 to 6 items');
  if (!Array.isArray(p.sections) || p.sections.length < 5) err(f, 'needs at least 5 sections');
  if (!Array.isArray(p.faq) || p.faq.length < 4) err(f, 'needs at least 4 FAQ items');
  if (!Array.isArray(p.sources) || p.sources.length < 2) err(f, 'needs 2 to 5 sources (shown on the page)');
  if (!p.cta?.href || !p.closing?.href) err(f, 'needs cta and closing with href');
  if (!p.keyword?.phrase) warn(f, 'missing keyword.phrase / evidence');
  if (p.flow && (p.flow.length < 3 || p.flow.length > 5 || p.flow.some((x) => x.split(/\s+/).length > 4))) warn(f, 'flow: 4 or 5 stages of max 3 words');
  for (const r of p.related || []) if (!slugs.has(r)) warn(f, `related "${r}" is not a guide of this site (yet)`);
  if ((p.related || []).length < 3) warn(f, 'related needs 3 slugs');

  const blocks = (p.sections || []).flatMap((s) => s.blocks || []);
  const clBlocks = blocks.filter((b) => b.t === 'casalibre');
  const shown = JSON.stringify({ ...p, internalSources: undefined, reviewNote: undefined, keyword: undefined });
  const text = strip(shown.replace(/\\"/g, '"'));
  if (/Casa Libre/.test(shown)) err(f, 'write "Casa-Libre" with the hyphen');
  if (/\u2014/.test(shown)) err(f, 'em dash found: use commas, colons or full stops');
  const bm = BANNED.exec(text);
  if (bm) err(f, `names another site or company: "${bm[0]}"`);
  if (/https?:\/\//.test(JSON.stringify(p.sources || []))) err(f, 'sources must not contain URLs');
  if (rule.voice === 'voseo') { const m = TU.exec(text); if (m) err(f, `tú form in Paraguay copy: "${m[0]}"`); }
  if (rule.voice === 'tu') { const m = VOS.exec(text); if (m) err(f, `voseo in Bolivia copy: "${m[0]}"`); }
  if (rule.voice === 'voseo' && /\b(notario|notaría|apartamento|arriendo)\b/i.test(text)) err(f, 'Paraguay: use escribano / departamento / alquiler');

  // links
  const hrefs = [...shown.matchAll(/href=\\"([^"\\]+)/g)].map((m) => m[1]);
  const body = JSON.stringify(p.sections || []) + JSON.stringify(p.faq || []);
  const bodyCl = [...body.matchAll(/href=\\"(https:\/\/[^"\\]+)/g)].length + clBlocks.length;
  if (bodyCl < 2 || bodyCl > 4) err(f, `${bodyCl} Casa-Libre links in the body (2 to 4)`);
  if (clBlocks.length > 1) err(f, 'more than one casalibre block');
  if (/href=/.test(String(p.answer)) || /href=/.test(JSON.stringify(p.summary || []))) err(f, 'no links in answer or summary');
  const all = [...hrefs, p.cta?.href, p.closing?.href, ...clBlocks.map((b) => b.href)].filter(Boolean);
  for (const h of all) {
    if (h.startsWith('/')) {
      const s = h.replace(/^\/|\/$/g, '').replace(/#.*$/, '');
      if (!slugs.has(s) && !['guias', 'glosario', 'como-escribimos'].includes(s)) warn(f, `internal link ${h} is not a guide of this site (yet)`);
      continue;
    }
    if (h.startsWith('#')) continue;
    let u;
    try { u = new URL(h.replace(/&amp;/g, '&')); } catch { err(f, `bad link ${h}`); continue; }
    if (u.host !== rule.host) err(f, `link to ${u.host}: every outside link goes to ${rule.host}`);
    if (u.searchParams.has('utm_source')) err(f, 'do not add UTM tags');
    if (rule.library && /^\/publicar/.test(u.pathname) && (h === p.cta?.href || h === p.closing?.href)) err(f, 'library sites send readers to listings, not to /publicar');
  }
  const internal = hrefs.filter((h) => h.startsWith('/')).length;
  if (internal < 2) warn(f, `${internal} internal links (2 to 5)`);
  const words = text.split(/\s+/).length;
  if (words < 800) warn(f, `about ${words} words: short`);
  if (!(p.sections || []).slice(0, 2).some((s) => (s.blocks || []).some((b) => b.t === 'table'))) warn(f, 'no table in the first two sections');
  if (p.review === 'pending' && !blocks.some((b) => b.t === 'callout' && b.tone === 'warn')) warn(f, 'review pending but no warn callout');
}
console.log(`\n${files.length} files in content/pages: ${errors} errors, ${warns} warnings`);
process.exit(errors ? 1 : 0);
