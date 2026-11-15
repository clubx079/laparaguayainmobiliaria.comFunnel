// Checks the BUILT pages of this site (run `npm run build` first):  node scripts/check-site.mjs [buildDir]
//
//  Links: at most MAX_CL links to Casa-Libre per page (raised from 10 on 16 Nov 2026: links in the card and in the
//         "why Casa-Libre" section); every outside link goes to the Casa-Libre site of the page's
//         country and carries this site's UTM tags; every internal link is a real page.
//  Words: "Casa-Libre" with the hyphen; no other portal or company named.
//  Form:  owner sites show the lead form on every guide; agent and library sites never show one.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { SITE as site, utmSource } from '../lib/site.js';
import { COUNTRIES } from '../lib/countries.js';

const buildDir = process.argv[2] || process.env.NEXT_DIST || '.next';
const appDir = path.join(process.cwd(), buildDir, 'server', 'app');
if (!existsSync(appDir)) { console.error(`No build found at ${appDir}. Run npm run build first.`); process.exit(2); }

const CL_HOSTS = Object.values(COUNTRIES).map((c) => c.clHost);
const BANNED = /\b(infocasas|clasipar|re\/?max|remax|century ?21|marketplace de facebook|mercado ?libre|olx|ultracasas|infoinmobiliaria|zillow|airbnb|abc color)\b/i;

const MAX_CL = 22;
let errors = 0;
let warns = 0;
const err = (m) => { errors++; console.log(`ERROR ${m}`); };
const warn = (m) => { warns++; console.log(`warn  ${m}`); };

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) { if (!['api'].includes(f)) walk(p, out); } else if (f.endsWith('.html') && !f.startsWith('_')) out.push(p);
  }
  return out;
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
const map = new Map();
for (const f of walk(appDir)) {
  const rel = path.relative(appDir, f).replace(/\\/g, '/').replace(/\.html$/, '');
  map.set(rel === 'index' ? '/' : `/${rel}/`, readFileSync(f, 'utf8'));
}

let maxCl = 0;
let guides = 0;
for (const [p, html] of map) {
  const body = html.slice(html.indexOf('<body')).replace(/<script[\s\S]*?<\/script>/g, ' ');
  const visible = body.replace(/<[^>]+>/g, ' ');
  const hrefs = [...body.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)].map((m) => decode(m[1]));
  const first = p.split('/')[1];
  const other = Object.values(COUNTRIES).find((x) => x.prefix && x.prefix === first && site.countries.includes(x.code) && x.code !== site.rootCountry);
  const cc = other ? other.code : site.rootCountry;
  let cl = 0;
  for (const h of hrefs) {
    if (h.startsWith('#') || h.startsWith('mailto:')) continue;
    if (h.startsWith('/')) {
      const clean = h.replace(/[#?].*$/, '');
      if (!map.has(clean.endsWith('/') ? clean : `${clean}/`)) err(`${p}: internal link ${h} is not a page of this site`);
      continue;
    }
    let u;
    try { u = new URL(h); } catch { err(`${p}: bad link ${h}`); continue; }
    if (!CL_HOSTS.includes(u.host)) { err(`${p}: outside link to ${u.host}`); continue; }
    cl++;
    if (u.host !== COUNTRIES[cc].clHost) err(`${p}: links to ${u.host}, but the page is about ${COUNTRIES[cc].name}`);
    if (u.searchParams.get('utm_source') !== utmSource()) err(`${p}: Casa-Libre link without this site's utm_source: ${h.slice(0, 90)}`);
    if (u.searchParams.get('utm_medium') !== site.medium) err(`${p}: wrong utm_medium on ${h.slice(0, 90)}`);
  }
  maxCl = Math.max(maxCl, cl);
  if (cl > MAX_CL) err(`${p}: ${cl} links to Casa-Libre (max ${MAX_CL})`);
  if (/Casa Libre/.test(visible)) err(`${p}: "Casa Libre" without the hyphen`);
  const bm = BANNED.exec(visible);
  if (bm) err(`${p}: names another site or company: "${bm[0]}"`);
  const hasForm = /id="formulario"/.test(body);
  const isGuide = /class="eyebrow">Respuesta breve</.test(body);
  if (site.kind !== 'owners' && hasForm) err(`${p}: a lead form on a ${site.kind} site`);
  if (site.kind === 'owners' && isGuide && !hasForm) err(`${p}: guide without the lead form`);
  if (isGuide) {
    guides++;
    if (!/Puntos clave/.test(body)) warn(`${p}: no "Puntos clave"`);
    if (!/Contenido revisado/.test(body)) warn(`${p}: no "Contenido revisado" date`);
    if (!/Elección editorial/.test(body)) err(`${p}: no "Elección editorial" card`);
    if (!/id="por-que-casa-libre"/.test(body)) warn(`${p}: no "why Casa-Libre" section`);
    // every answer of "Preguntas y respuestas" names Casa-Libre
    const answers = [...body.matchAll(/<div class="faq-item"><h3>[\s\S]*?<\/h3><p>([\s\S]*?)<\/p><\/div>/g)].map((m) => m[1]);
    const bare = answers.filter((a) => !a.includes('Casa-Libre')).length;
    if (bare) warn(`${p}: ${bare} of ${answers.length} answers do not name Casa-Libre`);
  }
  if (!/<link rel="canonical" href="https:\/\//.test(html)) warn(`${p}: no canonical`);
}
console.log(`${site.domain}: ${map.size} pages (${guides} guides), most Casa-Libre links on a page: ${maxCl}`);
console.log(`${errors} errors, ${warns} warnings`);
process.exit(errors ? 1 : 0);
