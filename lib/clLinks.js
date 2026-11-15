import data from '../content/data/casalibre-links.json';
import { countryOf, CL_CITY_PATHS, CL_SEARCH } from './countries.js';

const CL = 'https://casa-libre.com.py';
const EXISTS = new Set((data.urls || []).map((u) => u.replace(/\/$/, '')));
const has = (u) => EXISTS.has(u);

// Casa-Libre's own guides, by topic of the page.
const CL_GUIDES = {
  vender: [CL + '/guias/como-vender-mi-casa', 'Cómo vender mi casa, la guía de Casa-Libre'],
  sinInmo: [CL + '/guias/vender-sin-inmobiliaria', 'Vender sin inmobiliaria, en Casa-Libre'],
  valor: [CL + '/guias/cuanto-vale-mi-propiedad', '¿Cuánto vale mi propiedad? Guía de Casa-Libre'],
  papeles: [CL + '/guias/documentos-para-vender-un-inmueble', 'Documentos para vender un inmueble, en Casa-Libre'],
  impuestos: [CL + '/guias/impuestos-y-gastos-al-vender', 'Impuestos y gastos al vender, en Casa-Libre'],
  gastosCompra: [CL + '/guias/gastos-al-comprar-una-casa', 'Gastos al comprar una casa, en Casa-Libre'],
  alquilar: [CL + '/guias/como-alquilar-mi-propiedad', 'Cómo alquilar mi propiedad, la guía de Casa-Libre'],
  primera: [CL + '/guias/comprar-primera-casa', 'Comprar la primera casa, guía de Casa-Libre'],
};
const BY_GROUP = {
  'Vender una propiedad': ['vender', 'sinInmo', 'valor', 'papeles'],
  'Vender por ciudad': ['vender', 'valor', 'papeles', 'impuestos'],
  'Terrenos por ciudad': ['vender', 'valor', 'papeles', 'impuestos'],
  'Papeles y trámites': ['papeles', 'impuestos', 'vender', 'gastosCompra'],
  'Impuestos y gastos': ['impuestos', 'gastosCompra', 'papeles', 'vender'],
  'Precios y valor': ['valor', 'vender', 'sinInmo', 'impuestos'],
  'Alquilar tu propiedad': ['alquilar', 'valor', 'papeles', 'vender'],
  _default: ['vender', 'valor', 'papeles', 'impuestos', 'alquilar'],
};
const BASE = [
  [CL + '/publicar', 'Publicar mi propiedad gratis en Casa-Libre'],
  [CL + '/vender', 'Cómo vender en Casa-Libre'],
  [CL + '/propiedades', 'Ver propiedades en el mapa de Casa-Libre'],
  [CL + '/comprar', 'Propiedades en venta en Casa-Libre'],
  [CL + '/alquilar', 'Propiedades en alquiler en Casa-Libre'],
  [CL + '/guias', 'Todas las guías de Casa-Libre'],
  [CL + '/como-funciona', 'Cómo funciona Casa-Libre'],
  [CL + '/descargar', 'App de Casa-Libre para iPhone y Android'],
];
const TOP_CITIES = [['asuncion', 'Asunción'], ['luque', 'Luque'], ['san-lorenzo', 'San Lorenzo'], ['lambare', 'Lambaré'], ['fernando-de-la-mora', 'Fernando de la Mora'], ['encarnacion', 'Encarnación'], ['ciudad-del-este', 'Ciudad del Este']];

function cityLinks(slug, name) {
  const fixed = [[`${CL}/propiedades-en/${slug}`, `Propiedades en ${name} en Casa-Libre`]].filter(([u]) => has(u));
  return [
    ...fixed,
    cityLink('venta', 'casas', slug, name), cityLink('venta', 'terrenos', slug, name), cityLink('venta', 'departamentos', slug, name),
    cityLink('alquiler', 'casas', slug, name), cityLink('alquiler', 'departamentos', slug, name),
  ];
}

// ---- Filtered Casa-Libre listing links for one city ----
// A path page (/venta/casas/luque) when Casa-Libre has it (it exists only with enough listings),
// otherwise the search with the filters applied: /propiedades?op=venta&type=terreno&q=Luque
// (q must keep the accents: "Ñemby", "Encarnación").
const TYPE_KEY = { casas: 'casa', departamentos: 'depto', terrenos: 'terreno', duplex: 'duplex' };
const TYPE_WORD = { casas: 'Casas', departamentos: 'Departamentos', terrenos: 'Terrenos', duplex: 'Dúplex' };
// Other countries: the path page only when it was checked live (CL_CITY_PATHS in lib/countries.js),
// else the filtered search when that country's search was checked, else the map page.
export function cityUrl(op, tipo, slug, name, cc = 'py') {
  if (cc === 'py') {
    const path = `${CL}/${op}/${tipo}/${slug}`;
    if (has(path)) return path;
    return `${CL}/propiedades?op=${op}&type=${TYPE_KEY[tipo]}&q=${encodeURIComponent(name)}`;
  }
  const origin = countryOf(cc).clOrigin;
  const path = `/${op}/${tipo}/${slug}`;
  if ((CL_CITY_PATHS[cc] || []).includes(path)) return origin + path;
  if (CL_SEARCH[cc]) return `${origin}/propiedades?op=${op}&type=${TYPE_KEY[tipo]}&q=${encodeURIComponent(name)}`;
  return `${origin}/propiedades`;
}
export function cityLink(op, tipo, slug, name, cc = 'py') {
  return [cityUrl(op, tipo, slug, name, cc), `${TYPE_WORD[tipo]} en ${op === 'venta' ? 'venta' : 'alquiler'} en ${name}`];
}
/** The listing buttons at the top of a city page: [primary, ...others]. */
export function cityListings(page) {
  if (!page.city) return [];
  const s = page.city, n = page.cityName || page.city, cc = page.cc || 'py';
  const g = page.group || '';
  const L = (op, tipo) => cityLink(op, tipo, s, n, cc);
  if (/^Terrenos/.test(g)) return [L('venta', 'terrenos'), L('venta', 'casas')];
  if (/^Alquiler/.test(g)) return [L('alquiler', 'casas'), L('alquiler', 'departamentos')];
  if (/^Mercado/.test(g)) return [L('venta', 'casas'), L('venta', 'terrenos'), L('alquiler', 'departamentos')];
  return [L('venta', 'casas'), L('venta', 'terrenos'), L('venta', 'departamentos')];
}

/** About 15 to 20 Casa-Libre links for one page: its city first, then Casa-Libre guides on its topic, then the main pages. */
export function linksFor(page) {
  const out = [];
  if (page.city) out.push(...cityLinks(page.city, page.cityName || page.city));
  for (const k of BY_GROUP[page.group] || BY_GROUP._default) out.push(CL_GUIDES[k]);
  out.push(...BASE);
  const cities = TOP_CITIES.filter(([s]) => s !== page.city);
  const start = (page.slug || '').length % cities.length;
  for (let i = 0; i < 4; i++) {
    const [s, n] = cities[(start + i) % cities.length];
    const u = has(`${CL}/venta/casas/${s}`) ? `${CL}/venta/casas/${s}` : `${CL}/propiedades-en/${s}`;
    out.push([u, u.includes('/venta/') ? `Casas en venta en ${n}` : `Propiedades en ${n}`]);
  }
  const seen = new Set();
  return out.filter(([u]) => (seen.has(u) ? false : seen.add(u)));
}
