// The countries of this site. Paraguay lives at the root (/, /guias/, /<slug>/); every other country lives under
// its own prefix (/bolivia/, /bolivia/guias/, /bolivia/<slug>/) with its content in content/pages/<code>/.
// This file is imported by client components too (lead form, sticky bar): plain data and pure functions only.
//
// Casa-Libre: each country has its own Casa-Libre site. Every link on a country's pages goes to THAT site
// (lib/utm.js tags it; scripts/check-content.mjs fails a page that links another country's Casa-Libre).
// `clPaths` = the Casa-Libre paths checked live on that site (plain GET, 200, real page) on the date in `clChecked`.
// Content may only use these paths, plus `clCityPaths` and the filtered search when `clSearch` is true.

export const DEFAULT_COUNTRY = 'py';

const PY_CITIES = ['Asunción', 'Luque', 'San Lorenzo', 'Fernando de la Mora', 'Lambaré', 'Ciudad del Este', 'Encarnación', 'Otra ciudad'];

export const COUNTRIES = {
  py: {
    code: 'py',
    name: 'Paraguay',
    prefix: '',                     // root
    lang: 'es-PY',
    locale: 'es_PY',
    clOrigin: 'https://casa-libre.com.py',
    clHost: 'casa-libre.com.py',
    currency: { code: 'PYG', name: 'guaraníes', symbol: 'Gs.', note: 'Las propiedades se publican en guaraníes o en dólares.' },
    phone: { cc: '595', example: '0981 123 456', lenient: true },
    formCities: PY_CITIES,
    notary: 'escribano',
    registry: 'Dirección General de los Registros Públicos',
    voice: 'voseo',
    flag: 'PY',
  },
  bo: {
    code: 'bo',
    name: 'Bolivia',
    prefix: 'bolivia',
    lang: 'es-BO',
    locale: 'es_BO',
    clOrigin: 'https://casa-libre.com.bo',
    clHost: 'casa-libre.com.bo',
    currency: { code: 'BOB', name: 'bolivianos', symbol: 'Bs', note: 'Muchas propiedades se publican en dólares; la moneda local es el boliviano.' },
    // mobile numbers: 8 digits starting with 6 or 7 (+591 7xx xxxxx)
    phone: { cc: '591', example: '712 34567', lens: [8], trunk0: false },
    formCities: ['Santa Cruz de la Sierra', 'La Paz', 'El Alto', 'Cochabamba', 'Sucre', 'Tarija', 'Oruro', 'Potosí', 'Otra ciudad'],
    notary: 'notario de fe pública',
    registry: 'Derechos Reales',
    voice: 'tú',
    flag: 'BO',
  },
  uy: {
    code: 'uy',
    name: 'Uruguay',
    prefix: 'uruguay',
    lang: 'es-UY',
    locale: 'es_UY',
    clOrigin: 'https://uy.casa-libre.com',
    clHost: 'uy.casa-libre.com',
    currency: { code: 'UYU', name: 'pesos uruguayos', symbol: '$U', note: 'La compraventa de inmuebles se pacta casi siempre en dólares.' },
    // mobile 09X XXX XXX (9 digits with the 0), +598 9X XXX XXX
    phone: { cc: '598', example: '094 123 456', lens: [8], trunk0: true },
    formCities: ['Montevideo', 'Canelones', 'Ciudad de la Costa', 'Maldonado', 'Punta del Este', 'Salto', 'Paysandú', 'Colonia del Sacramento', 'Otra ciudad'],
    notary: 'escribano',
    registry: 'Registro de la Propiedad, Sección Inmobiliaria',
    voice: 'voseo',
    flag: 'UY',
  },
  ve: {
    code: 've',
    name: 'Venezuela',
    prefix: 'venezuela',
    lang: 'es-VE',
    locale: 'es_VE',
    clOrigin: 'https://casa-libre.com.ve',
    clHost: 'casa-libre.com.ve',
    currency: { code: 'VES', name: 'bolívares', symbol: 'Bs.', note: 'Los inmuebles se ofrecen casi siempre en dólares; la moneda oficial es el bolívar.' },
    // mobile 04XX XXX XXXX (11 digits with the 0), +58 4XX XXX XXXX
    phone: { cc: '58', example: '0414 123 4567', lens: [10], trunk0: true },
    formCities: ['Caracas', 'Valencia', 'Maracaibo', 'Barquisimeto', 'Maracay', 'Lechería', 'Puerto La Cruz', 'Mérida', 'San Cristóbal', 'Otra ciudad'],
    notary: 'notario',
    registry: 'Registro Público (oficina de Registro Inmobiliario)',
    voice: 'tú',
    flag: 'VE',
  },
  sv: {
    code: 'sv',
    name: 'El Salvador',
    prefix: 'el-salvador',
    lang: 'es-SV',
    locale: 'es_SV',
    clOrigin: 'https://sv.casa-libre.com',
    clHost: 'sv.casa-libre.com',
    currency: { code: 'USD', name: 'dólares', symbol: 'US$', note: 'El dólar es la moneda de curso legal.' },
    // 8 digits (mobile starts with 6 or 7), +503 7XXX XXXX
    phone: { cc: '503', example: '7123 4567', lens: [8], trunk0: false },
    formCities: ['San Salvador', 'Santa Tecla', 'Antiguo Cuscatlán', 'Nuevo Cuscatlán', 'San Miguel', 'Santa Ana', 'Soyapango', 'La Libertad', 'Otra ciudad'],
    notary: 'notario',
    registry: 'Centro Nacional de Registros (CNR)',
    voice: 'usted',
    flag: 'SV',
  },
};

export const COUNTRY_CODES = Object.keys(COUNTRIES);
export const OTHER_CODES = COUNTRY_CODES.filter((c) => c !== DEFAULT_COUNTRY);
export const countryOf = (cc) => COUNTRIES[cc] || COUNTRIES[DEFAULT_COUNTRY];
export const countryByPrefix = (prefix) => Object.values(COUNTRIES).find((c) => c.prefix && c.prefix === prefix) || null;
/** The country whose Casa-Libre site a URL points to, or null. */
export const countryOfClUrl = (href) => {
  const m = /^https:\/\/([^/?#]+)/.exec(String(href || ''));
  if (!m) return null;
  const host = m[1].replace(/^www\./, '');
  return Object.values(COUNTRIES).find((c) => c.clHost === host) || null;
};

/** Site path of a page: ('py','') -> '/', ('py','x') -> '/x/', ('bo','') -> '/bolivia/', ('bo','x') -> '/bolivia/x/'. */
export function pathFor(cc, slug) {
  const p = countryOf(cc).prefix;
  const parts = [p, slug].filter(Boolean);
  return parts.length ? `/${parts.join('/')}/` : '/';
}
/** Strips the country prefix from a pathname: '/bolivia/x/' -> { cc: 'bo', slug: 'x' }. */
export function parsePath(pathname) {
  const parts = String(pathname || '/').split('/').filter(Boolean);
  const c = countryByPrefix(parts[0]);
  if (c) return { cc: c.code, slug: parts.slice(1).join('/') };
  return { cc: DEFAULT_COUNTRY, slug: parts.join('/') };
}

/** WhatsApp number check and normalisation for a country. Returns { ok, e164, error }. */
export function checkWhatsapp(raw, cc) {
  const c = countryOf(cc);
  let d = String(raw || '').replace(/\D/g, '');
  if (!d) return { ok: false, error: c.voice === 'voseo' ? `Escribí tu número de WhatsApp. Ejemplo: ${c.phone.example}.` : `Falta tu número de WhatsApp. Ejemplo: ${c.phone.example}.` };
  if (d.startsWith('00')) d = d.slice(2);
  if (c.phone.lenient) {
    // Paraguay: the rules used since launch (8 to 13 digits; 595 / 0 / 9 prefixes).
    let local = d.startsWith('595') ? '0' + d.slice(3) : d;
    if (local.length < 8) return { ok: false, error: `Al número le faltan dígitos: tiene ${local.length}. Ejemplo: ${c.phone.example}.` };
    if (local.length > 13) return { ok: false, error: `El número tiene demasiados dígitos. Escribilo así: ${c.phone.example}.` };
    let e = d;
    if (e.startsWith('595')) e = `+${e}`;
    else if (e.startsWith('0')) e = `+595${e.slice(1)}`;
    else if (e.length === 9 && e.startsWith('9')) e = `+595${e}`;
    else e = `+${e}`;
    return { ok: true, e164: e };
  }
  let rest = d.startsWith(c.phone.cc) && d.length > Math.max(...c.phone.lens) ? d.slice(c.phone.cc.length) : d;
  if (c.phone.trunk0 && rest.startsWith('0')) rest = rest.slice(1);
  const want = c.phone.lens;
  if (rest.length < Math.min(...want)) return { ok: false, error: `Al número le faltan dígitos. Ejemplo: ${c.phone.example}.` };
  if (rest.length > Math.max(...want)) return { ok: false, error: `El número tiene demasiados dígitos. Ejemplo: ${c.phone.example}.` };
  if (!want.includes(rest.length)) return { ok: false, error: `El número no parece válido. Ejemplo: ${c.phone.example}.` };
  return { ok: true, e164: `+${c.phone.cc}${rest}` };
}

// ---- Casa-Libre paths checked live on 2026-11-13 (plain GET with a browser user agent, one request per second) ----
// /publicar answers 307 to /?sell=1 (the publishing flow) on every country, Paraguay included: counted as working.
// Filtered search (/propiedades?op=...&type=...&q=<City>) answered 200 for every city tried; it is the same /propiedades
// page with filters, so it works for any city. Path pages (/venta/casas/<city>) exist only where that country has listings:
// use only the ones below, or check a new one first (scripts/check-cl-paths.sh).
export const CL_PATHS = {
  bo: ["/", "/publicar", "/vender", "/empresas", "/descargar", "/propiedades", "/comprar", "/alquilar", "/como-funciona", "/preguntas-frecuentes", "/nuestra-historia", "/administracion-de-propiedades", "/guias", "/guias/como-vender-mi-casa", "/guias/vender-sin-inmobiliaria", "/guias/cuanto-vale-mi-propiedad", "/guias/documentos-para-vender-un-inmueble", "/guias/impuestos-y-gastos-al-vender", "/guias/gastos-al-comprar-una-casa", "/guias/como-alquilar-mi-propiedad", "/guias/comprar-primera-casa"],
  uy: ["/", "/publicar", "/vender", "/empresas", "/descargar", "/propiedades", "/comprar", "/alquilar", "/como-funciona", "/preguntas-frecuentes", "/nuestra-historia", "/administracion-de-propiedades", "/guias", "/guias/como-vender-mi-casa", "/guias/vender-sin-inmobiliaria", "/guias/cuanto-vale-mi-propiedad", "/guias/documentos-para-vender-un-inmueble", "/guias/impuestos-y-gastos-al-vender", "/guias/gastos-al-comprar-una-casa", "/guias/como-alquilar-mi-propiedad", "/guias/comprar-primera-casa"],
  ve: ["/", "/publicar", "/vender", "/empresas", "/descargar", "/propiedades", "/comprar", "/alquilar", "/como-funciona", "/preguntas-frecuentes", "/nuestra-historia", "/administracion-de-propiedades", "/guias", "/guias/como-vender-mi-casa", "/guias/vender-sin-inmobiliaria", "/guias/cuanto-vale-mi-propiedad", "/guias/documentos-para-vender-un-inmueble", "/guias/impuestos-y-gastos-al-vender", "/guias/gastos-al-comprar-una-casa", "/guias/como-alquilar-mi-propiedad", "/guias/comprar-primera-casa"],
  sv: ["/", "/publicar", "/vender", "/empresas", "/descargar", "/propiedades", "/comprar", "/alquilar", "/como-funciona", "/preguntas-frecuentes", "/nuestra-historia", "/administracion-de-propiedades", "/guias", "/guias/como-vender-mi-casa", "/guias/vender-sin-inmobiliaria", "/guias/cuanto-vale-mi-propiedad", "/guias/documentos-para-vender-un-inmueble", "/guias/impuestos-y-gastos-al-vender", "/guias/gastos-al-comprar-una-casa", "/guias/como-alquilar-mi-propiedad", "/guias/comprar-primera-casa"],
};
export const CL_CITY_PATHS = {
  bo: ["/venta/casas/santa-cruz-de-la-sierra", "/alquiler/casas/santa-cruz-de-la-sierra", "/venta/departamentos/santa-cruz-de-la-sierra", "/alquiler/departamentos/santa-cruz-de-la-sierra", "/propiedades-en/santa-cruz-de-la-sierra", "/venta/casas/la-paz", "/venta/departamentos/la-paz", "/alquiler/departamentos/la-paz", "/propiedades-en/la-paz", "/venta/casas/cochabamba", "/alquiler/casas/cochabamba", "/venta/departamentos/cochabamba", "/propiedades-en/cochabamba",
    // + found live by scripts/build-market.mjs (2026-11-13; casa_libre_pages in content/data/bo-market.json)
    "/alquiler/oficinas/santa-cruz-de-la-sierra", "/venta/depositos/santa-cruz-de-la-sierra", "/venta/locales/santa-cruz-de-la-sierra", "/venta/terrenos/santa-cruz-de-la-sierra", "/alquiler/oficinas/cochabamba", "/venta/oficinas/cochabamba", "/venta/terrenos/cochabamba", "/alquiler/oficinas/la-paz"],
  uy: ["/venta/casas/montevideo", "/alquiler/casas/montevideo", "/venta/departamentos/montevideo", "/alquiler/departamentos/montevideo", "/propiedades-en/montevideo", "/venta/casas/punta-del-este", "/venta/departamentos/punta-del-este", "/alquiler/departamentos/punta-del-este", "/propiedades-en/punta-del-este", "/venta/casas/maldonado", "/alquiler/casas/maldonado", "/venta/departamentos/maldonado", "/alquiler/departamentos/maldonado", "/propiedades-en/maldonado",
    // + found live by scripts/build-market.mjs (2026-11-13; casa_libre_pages in content/data/uy-market.json)
    "/alquiler/depositos/montevideo", "/alquiler/locales/montevideo", "/alquiler/oficinas/montevideo", "/venta/depositos/montevideo", "/venta/duplex/montevideo", "/venta/locales/montevideo", "/venta/terrenos/montevideo", "/alquiler/duplex/punta-del-este", "/alquiler/locales/punta-del-este", "/alquiler/oficinas/punta-del-este", "/venta/oficinas/punta-del-este", "/alquiler/locales/maldonado", "/venta/terrenos/maldonado", "/alquiler/casas/ciudad-de-la-costa", "/propiedades-en/ciudad-de-la-costa"],
  ve: ["/venta/departamentos/caracas", "/propiedades-en/caracas", "/venta/casas/valencia", "/propiedades-en/valencia", "/propiedades-en/maracaibo"],
  sv: ["/venta/casas/san-salvador", "/venta/departamentos/san-salvador", "/propiedades-en/san-salvador", "/venta/casas/santa-tecla", "/propiedades-en/santa-tecla", "/venta/casas/antiguo-cuscatlan", "/alquiler/casas/antiguo-cuscatlan", "/propiedades-en/antiguo-cuscatlan"],
};
export const CL_SEARCH = {
  bo: true,
  uy: true,
  ve: true,
  sv: true,
};
export const CL_CHECKED = '2026-11-13';
