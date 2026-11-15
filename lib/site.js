// This site. Everything that makes it this site and not another lives here and in lib/data/.
// kind: 'owners' (lead form, then Casa-Libre's publishing flow) | 'agents' | 'library' (no form, straight to Casa-Libre).
export const SITE = {
  "domain": "laparaguayainmobiliaria.com",
  "kind": "library",
  "funnelSite": "library",
  "medium": "library",
  "name": "La Paraguaya Inmobiliaria",
  "rootCountry": "py",
  "countries": [
    "py"
  ],
  "tagline": {
    "py": "Guías para comprar y alquilar en Paraguay"
  },
  "reader": "personas que buscan comprar o alquilar en Paraguay, o que se mudan al país",
  "description": "Biblioteca de guías para comprar y alquilar en Paraguay: alquileres por ciudad, casas y terrenos a cuotas, costos y mudarse al país. No es una inmobiliaria.",
  "notAgency": "La Paraguaya Inmobiliaria es una biblioteca de guías. No es una inmobiliaria: no vende, no alquila y no intermedia propiedades.",
  "cta": {
    "voseo": "Ver propiedades"
  },
  "ctaPath": "/propiedades",
  "recordCta": {
    "voseo": "Ver propiedades en Paraguay"
  },
  "recordWhat": "Marketplace inmobiliario: buscás por ciudad, tipo y mapa"
};

// "Contenido revisado": the date of the last editorial pass over the guides. Set it to the day the native
// reviewer signs off.
export const REVIEWED = '2026-11-16';

// The line under the byline: 'visible' = shown on every guide; 'quiet' = only on "Cómo escribimos" and in the footer.
export const TRANSPARENCY = 'visible';

export const siteUrl = () => `https://${SITE.domain}`;
/** utm_source on every Casa-Libre link: the domain without dots. */
export const utmSource = () => SITE.domain.replace(/\./g, '');
/** True only on the real domain: pages there may be indexed; every other host is noindex. */
export const isProductionHost = (host) => String(host || '').toLowerCase().replace(/^www\./, '').replace(/:\d+$/, '') === SITE.domain;
