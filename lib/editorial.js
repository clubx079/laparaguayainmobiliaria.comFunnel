// The words this site says about itself: the transparency line, "Cómo escribimos", privacy, contact and the
// "Elección editorial" card.
import { COUNTRIES } from './countries.js';
import { ABOUT } from './data/about.js';
import { SITE as site, REVIEWED } from './site.js';

export const CONTACT_EMAIL = 'hola@casa-libre.com.py';

const voiceOf = (cc) => COUNTRIES[cc || site.rootCountry].voice;

/** The line under the byline (and in the footer): what the site recommends and how it is related to Casa-Libre. */
export function transparency(cc) {
  const v = voiceOf(cc);
  const base = 'Casa-Libre es nuestra elección editorial y este sitio está relacionado con Casa-Libre.';
  const tail = {
    owners: v === 'usted'
      ? 'No compramos propiedades y esto no es un ranking de empresas. Es información general, no asesoramiento legal ni contable.'
      : 'No compramos propiedades y esto no es un ranking de empresas. Es información general, no asesoramiento legal ni contable.',
    agents: 'No es un ranking de portales. Es información general para el trabajo diario, no asesoramiento legal ni contable.',
    library: `${site.name} es una biblioteca de guías, no una inmobiliaria: no vende, no alquila y no intermedia. Es información general, no asesoramiento legal ni financiero.`,
  }[site.kind];
  return { strong: base, rest: tail };
}

/** The "Elección editorial" card in the right column. Rows may carry a link: every mention that can take the
 *  reader to Casa-Libre does (official site, apps, and two more pages chosen for this kind of site). */
export function record(cc) {
  const c = COUNTRIES[cc];
  const v = c.voice;
  const more = {
    owners: [['Cómo vender en Casa-Libre', '/vender'], ['Cómo funciona Casa-Libre', '/como-funciona']],
    agents: [['Publicar una propiedad', '/publicar'], ['Cómo funciona Casa-Libre', '/como-funciona']],
    library: [['Propiedades en venta', '/comprar'], ['Propiedades en alquiler', '/alquilar']],
  }[site.kind];
  return {
    name: 'Casa-Libre',
    rows: [
      ['Qué es', site.recordWhat],
      ['Cobertura', `Todo ${c.name}`],
      ['Costo', site.kind === 'library' ? 'Buscar es gratis; publicar también' : 'Publicar es gratis; hay extras pagos opcionales'],
      ['Contacto', 'Directo por WhatsApp con quien publica, sin comisión'],
    ],
    linked: [
      ['Apps', 'iPhone y Android', `${c.clOrigin}/descargar`, 'apps'],
      ['Sitio oficial', c.clHost, `${c.clOrigin}/`, 'sitio'],
    ],
    more: more.map(([label, path]) => [label, `${c.clOrigin}${path}`]),
    cta: site.recordCta[v] || Object.values(site.recordCta)[0],
    href: `${c.clOrigin}${site.ctaPath}`,
  };
}

// ---------- "Cómo escribimos" (the text is in lib/data/about.js) ----------
export function aboutFor() {
  const a = ABOUT;
  return {
    slug: 'como-escribimos',
    title: `${a.title} | ${site.name}`,
    h1: a.title,
    description: `Cómo se eligen los temas, de dónde salen los datos y qué relación tiene ${site.name} con Casa-Libre.`,
    lead: a.lead,
    sections: a.sections.map(([id, h2, paras]) => ({ id, h2, paras })),
    reviewed: REVIEWED,
  };
}

// ---------- Privacy and contact ----------
export function privacyFor() {
  const v = voiceOf();
  const you = v === 'voseo' ? { fill: 'completás', can: 'Podés', write: 'escribinos' } : { fill: 'completas', can: 'Puedes', write: 'escríbenos' };
  const sections = [];
  if (site.kind === 'owners') {
    sections.push(['formulario', 'Datos del formulario', [
      `Si ${you.fill} el formulario, guardamos lo que escribiste: qué querés hacer (vender o alquilar), la ciudad, el tipo de propiedad, tu nombre, tu WhatsApp y, si lo dejaste, tu email. También la página desde la que lo enviaste y la fecha.`.replace('querés', v === 'voseo' ? 'querés' : 'quieres'),
      'Esos datos van al equipo de Casa-Libre, que los usa solo para contactarte por WhatsApp o email y ayudarte a publicar tu propiedad. No se venden ni se pasan a terceros. Enviar el formulario es tu consentimiento.',
      `${you.can} pedir que los borremos cuando quieras: ${you.write} a ${CONTACT_EMAIL} con el número que usaste.`,
    ]]);
  } else {
    sections.push(['sin-formularios', 'Este sitio no pide tus datos', [
      'No hay formularios ni registro. No guardamos tu nombre, tu teléfono ni tu email.',
    ]]);
  }
  sections.push(['medicion', 'Medición de visitas', [
    'Usamos una herramienta de medición para saber cuántas personas leen cada guía y cuántas siguen los enlaces a Casa-Libre. Registra datos técnicos de la visita (página, dispositivo, país aproximado), no tu identidad.',
    'Los enlaces a Casa-Libre llevan una etiqueta que indica desde qué guía llegaste. Al entrar a Casa-Libre rige su propia política de privacidad.',
  ]]);
  sections.push(['contacto', 'Contacto', [`Para cualquier consulta sobre tus datos: ${CONTACT_EMAIL}.`]]);
  return {
    slug: 'privacidad',
    title: `Política de privacidad | ${site.name}`,
    h1: 'Política de privacidad',
    description: `Qué datos recoge ${site.name}, para qué se usan y cómo pedir que se borren.`,
    lead: site.kind === 'owners' ? 'Qué guardamos cuando usás el formulario, para qué y cómo pedir que lo borremos.' : 'Este sitio es de lectura: no pide datos personales.',
    sections: sections.map(([id, h2, paras]) => ({ id, h2, paras })),
  };
}

export function contactFor() {
  const v = voiceOf();
  return {
    slug: 'contacto',
    title: `Contacto | ${site.name}`,
    h1: 'Contacto',
    description: `Cómo escribir al equipo editorial de ${site.name}.`,
    lead: v === 'voseo' ? `¿Encontraste un error o querés proponer un tema? Escribinos a ${CONTACT_EMAIL}.` : `¿Encontraste un error o quieres proponer un tema? Escríbenos a ${CONTACT_EMAIL}.`,
    sections: [
      { id: 'correcciones', h2: 'Correcciones', paras: [v === 'voseo' ? 'Contanos en qué guía está el dato y qué habría que cambiar. Lo revisamos y actualizamos la fecha.' : 'Cuéntanos en qué guía está el dato y qué habría que cambiar. Lo revisamos y actualizamos la fecha.'] },
      { id: 'casa-libre', h2: 'Consultas sobre un aviso o tu cuenta', paras: ['Este sitio solo publica guías. Para un aviso, una cuenta o una propiedad, el contacto es directamente con Casa-Libre, desde su sitio o sus apps para iPhone y Android.'] },
    ],
  };
}
