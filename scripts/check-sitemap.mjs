// Checks /sitemap.xml, /robots.txt and /llms.txt against the RUNNING site (npm run build && npm run local first):
//   node scripts/check-sitemap.mjs [http://localhost:<port>]
//
// Sitemap: answers 200 as XML, is well-formed, every <loc> is an absolute https URL on this site's domain, listed
//          once, with a YYYY-MM-DD lastmod; each URL (production domain mapped to the local server) answers 200 with
//          no redirect, is not noindex and declares itself as canonical; every hreflang alternate is in the sitemap;
//          and every page in the build (.next) is in the sitemap (nothing indexable is missing).
// robots:  on the production host it points to https://<domain>/sitemap.xml.
// llms:    answers 200, starts with an H1, every link to this site is a page in the sitemap and every other link
//          goes to Casa-Libre with this site's utm_source.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { SITE as site, utmSource } from '../lib/site.js';
import { COUNTRIES } from '../lib/countries.js';

const port = (/-p (\d+)/.exec(JSON.parse(readFileSync('package.json', 'utf8')).scripts.local) || [])[1];
const LOCAL = (process.argv[2] || `http://localhost:${port}`).replace(/\/$/, '');
const PROD = `https://${site.domain}`;
const toLocal = (u) => LOCAL + u.slice(PROD.length);
const CL_HOSTS = Object.values(COUNTRIES).map((c) => c.clHost);

let errors = 0;
const err = (m) => { errors++; console.log(`ERROR ${m}`); };
const get = (u, headers = {}) => fetch(u, { redirect: 'manual', headers });

// minimal well-formedness check: balanced tags, one root element, entities only &amp; &lt; &gt; &quot; &apos;
function wellFormed(xml) {
  const body = xml.replace(/^<\?xml[^>]*\?>\s*/, '');
  const stack = [];
  let roots = 0;
  for (const m of body.matchAll(/<(\/?)([A-Za-z][\w:.-]*)([^>]*?)(\/?)>/g)) {
    const [, close, name, , self] = m;
    if (close) { if (stack.pop() !== name) return `unbalanced </${name}>`; } else if (!self) { if (!stack.length) roots++; stack.push(name); } else if (!stack.length) roots++;
  }
  if (stack.length) return `unclosed <${stack.pop()}>`;
  if (roots !== 1) return `${roots} root elements`;
  const bad = /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/.exec(body);
  return bad ? 'bare & in the XML' : null;
}

async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; await fn(items[k]); } }));
}

// ---- sitemap ----
const sm = await get(`${LOCAL}/sitemap.xml`);
const xml = await sm.text();
if (sm.status !== 200) err(`/sitemap.xml answered ${sm.status}`);
if (!/xml/.test(sm.headers.get('content-type') || '')) err(`/sitemap.xml content-type ${sm.headers.get('content-type')}`);
const wf = wellFormed(xml);
if (wf) err(`/sitemap.xml is not well-formed: ${wf}`);
const unesc = (s) => s.replace(/&amp;/g, '&');
const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
  loc: unesc((/<loc>([^<]+)<\/loc>/.exec(m[1]) || [])[1] || ''),
  lastmod: (/<lastmod>([^<]+)<\/lastmod>/.exec(m[1]) || [])[1] || '',
  alts: [...m[1].matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\/>/g)].map((a) => [a[1], unesc(a[2])]),
}));
if (!entries.length) err('the sitemap lists no URLs');
if (entries.length > 50000) err(`${entries.length} URLs: more than 50,000, use a sitemap index`);
const locs = new Set();
for (const e of entries) {
  if (!e.loc.startsWith(`${PROD}/`)) err(`not on ${site.domain}: ${e.loc}`);
  if (locs.has(e.loc)) err(`listed twice: ${e.loc}`);
  locs.add(e.loc);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.lastmod)) err(`${e.loc}: lastmod "${e.lastmod}"`);
}
for (const e of entries) for (const [lang, href] of e.alts) if (!locs.has(href)) err(`${e.loc}: hreflang ${lang} -> ${href} is not in the sitemap`);

let ok = 0;
await pool(entries, 8, async (e) => {
  if (!e.loc.startsWith(`${PROD}/`)) return;
  const r = await get(toLocal(e.loc));
  if (r.status !== 200) { err(`${e.loc}: ${r.status}${r.headers.get('location') ? ` -> ${r.headers.get('location')}` : ''}`); return; }
  const html = await r.text();
  const head = html.slice(0, html.indexOf('</head>') + 7);
  if (/<meta name="robots" content="[^"]*noindex/i.test(head)) err(`${e.loc}: noindex`);
  const canon = (/<link rel="canonical" href="([^"]+)"/.exec(head) || [])[1];
  if (unesc(canon || '') !== e.loc) err(`${e.loc}: canonical is ${canon}`);
  const declared = [...head.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/gi)].map((m) => `${m[1]} ${unesc(m[2])}`).sort().join('|');
  const listed = e.alts.map(([l, h]) => `${l} ${h}`).sort().join('|');
  if (declared !== listed) err(`${e.loc}: hreflang in the page (${declared || 'none'}) differs from the sitemap (${listed || 'none'})`);
  ok++;
});

// every page in the build is in the sitemap
const appDir = path.join(process.cwd(), process.env.NEXT_DIST || '.next', 'server', 'app');
let built = 0;
if (existsSync(appDir)) {
  const walk = (d, out = []) => { for (const f of readdirSync(d)) { const p = path.join(d, f); if (statSync(p).isDirectory()) { if (f !== 'api') walk(p, out); } else if (f.endsWith('.html') && !f.startsWith('_')) out.push(p); } return out; };
  for (const f of walk(appDir)) {
    const rel = path.relative(appDir, f).replace(/\\/g, '/').replace(/\.html$/, '');
    if (['404', '500'].includes(rel)) continue;
    built++;
    const u = rel === 'index' ? `${PROD}/` : `${PROD}/${rel}/`;
    if (!locs.has(u)) err(`built page missing from the sitemap: ${u}`);
  }
}

// ---- robots.txt (as the production host sees it) ----
const rb = await (await get(`${LOCAL}/robots.txt`, { 'x-forwarded-host': site.domain })).text();
if (!rb.includes(`Sitemap: ${PROD}/sitemap.xml`)) err('robots.txt (production host) does not point to the sitemap');

// ---- llms.txt ----
const lr = await get(`${LOCAL}/llms.txt`);
const llms = await lr.text();
if (lr.status !== 200) err(`/llms.txt answered ${lr.status}`);
if (!/^# \S/.test(llms)) err('/llms.txt does not start with an H1');
if (/Casa Libre/.test(llms)) err('/llms.txt: "Casa Libre" without the hyphen');
for (const m of llms.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
  const u = new URL(m[1]);
  if (u.host === site.domain) { if (!locs.has(m[1].replace(/[?#].*$/, '')) && u.pathname !== '/sitemap.xml') err(`/llms.txt links ${m[1]}, not in the sitemap`); continue; }
  if (!CL_HOSTS.includes(u.host)) { err(`/llms.txt links another site: ${u.host}`); continue; }
  if (u.searchParams.get('utm_source') !== utmSource()) err(`/llms.txt: Casa-Libre link without utm_source: ${m[1]}`);
}

console.log(`${site.domain}: sitemap ${entries.length} URLs, ${ok} answer 200${built ? `, ${built} built pages all listed` : ''}; robots ok; llms.txt ${Buffer.byteLength(llms)} bytes`);
console.log(`${errors} errors`);
process.exit(errors ? 1 : 0);
