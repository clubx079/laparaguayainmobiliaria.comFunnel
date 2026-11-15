// Interface text in the voice each country reads: voseo (Paraguay, Uruguay), tú (Bolivia, Venezuela), usted (El Salvador).
// The guides themselves are written in that voice by their authors (content/COUNTRY_GUIDE.md); this file only covers
// the template: lead form, thank-you page, footer and a few labels. Client-safe (plain data).
import { countryOf } from './countries.js';

const VOSEO = {
  // editorial template labels
  explore: 'Explorá la guía', cite: 'Citá esta guía', allGuides: 'Todas las guías', seeAll: 'Ver todas',
  howWeWrite: 'Cómo escribimos estas guías', formKicker: 'Para propietarios',
  formDone: 'Recibimos tus datos. Te llevamos a Casa-Libre para que publiques gratis.', formGo: 'Ir ahora a Casa-Libre',
  stickyOwners: { Vender: 'Quiero vender mi casa', Alquilar: 'Quiero alquilar mi casa' },
  finish: 'Terminás en', notFoundTitle: 'No encontramos esa página', notFoundText: 'Puede que la dirección haya cambiado. Mirá todas las guías o volvé al inicio.',
  formHeading: { Vender: '¿Querés vender tu casa? Te ayudamos gratis', Alquilar: '¿Querés alquilar tu casa? Te ayudamos' },
  formFinal: { Vender: '¿Listo para vender? Contanos sobre tu propiedad', Alquilar: '¿Listo para alquilar? Contanos sobre tu propiedad' },
  formSub: 'Dejanos tus datos y te escribimos por WhatsApp para publicarla gratis en Casa-Libre. No compramos propiedades.',
  stepProp: 'tu propiedad', stepData: 'tus datos',
  qOperation: '¿Qué querés hacer?', qCity: '¿Dónde está tu propiedad?', qType: '¿Qué tipo de propiedad?',
  phCity: 'Elegí la ciudad', phType: 'Elegí el tipo',
  name: 'Tu nombre', whatsapp: 'Tu WhatsApp',
  errBoth: 'Elegí la ciudad y el tipo de propiedad para seguir.',
  errCity: 'Elegí en qué ciudad está tu propiedad. Si no está en la lista, elegí "Otra ciudad".',
  errType: 'Elegí qué tipo de propiedad es. Si no está en la lista, elegí "Otro".',
  errName: 'Escribí tu nombre (con el nombre de pila alcanza).',
  errEmail: 'Revisá tu email. Ejemplo: nombre@gmail.com. Si no querés dejarlo, borralo.',
  errNet: 'No pudimos enviar tus datos. Revisá tu conexión y probá de nuevo.',
  consentA: 'Al enviar aceptás que Casa-Libre te contacte por WhatsApp o email, según la ', consentB: 'Política de privacidad',
  preferWa: '¿Preferís escribirnos?',
  keepReading: 'Seguí leyendo', writeUs: 'Escribinos a',
  thanksAnswer: 'Una persona del equipo de Casa-Libre te va a escribir por WhatsApp para ayudarte a publicar tu propiedad. No tiene costo.',
  thanksNoWait: 'No hace falta que esperes',
  thanksNow: 'Podés publicar tu propiedad ahora mismo. Es gratis, lleva pocos minutos y los interesados te escriben directo por WhatsApp.',
  thanksBtn: 'Publicar mi propiedad en Casa-Libre',
  thanksApp: 'Si preferís hacerlo desde el celular, ', thanksAppLink: 'descargá la app de Casa-Libre para iPhone o Android',
  thanksPrep: 'Mientras tanto, prepará esto',
  thanksPrice: 'El precio que pensás pedir', thanksTitle: 'Si lo tenés a mano, el título de propiedad.',
  guiasTitle: 'Todas las guías para vender tu casa en',
  guiasReady: 'Cuando tengas todo listo, publicá tu propiedad gratis en', guiasAfter: ': los interesados te escriben directo por WhatsApp.',
};

const TU = {
  // editorial template labels
  explore: 'Explora la guía', cite: 'Cita esta guía', allGuides: 'Todas las guías', seeAll: 'Ver todas',
  howWeWrite: 'Cómo escribimos estas guías', formKicker: 'Para propietarios',
  formDone: 'Recibimos tus datos. Te llevamos a Casa-Libre para que publiques gratis.', formGo: 'Ir ahora a Casa-Libre',
  stickyOwners: { Vender: 'Quiero vender mi casa', Alquilar: 'Quiero alquilar mi casa' },
  finish: 'Terminas en', notFoundTitle: 'No encontramos esa página', notFoundText: 'Puede que la dirección haya cambiado. Mira todas las guías o vuelve al inicio.',
  formHeading: { Vender: '¿Quieres vender tu casa? Te ayudamos gratis', Alquilar: '¿Quieres alquilar tu casa? Te ayudamos' },
  formFinal: { Vender: '¿Listo para vender? Cuéntanos sobre tu propiedad', Alquilar: '¿Listo para alquilar? Cuéntanos sobre tu propiedad' },
  formSub: 'Déjanos tus datos y te escribimos por WhatsApp para publicarla gratis en Casa-Libre. No compramos propiedades.',
  stepProp: 'tu propiedad', stepData: 'tus datos',
  qOperation: '¿Qué quieres hacer?', qCity: '¿Dónde está tu propiedad?', qType: '¿Qué tipo de propiedad?',
  phCity: 'Elige la ciudad', phType: 'Elige el tipo',
  name: 'Tu nombre', whatsapp: 'Tu WhatsApp',
  errBoth: 'Elige la ciudad y el tipo de propiedad para seguir.',
  errCity: 'Elige en qué ciudad está tu propiedad. Si no está en la lista, elige "Otra ciudad".',
  errType: 'Elige qué tipo de propiedad es. Si no está en la lista, elige "Otro".',
  errName: 'Escribe tu nombre (con el nombre de pila basta).',
  errEmail: 'Revisa tu email. Ejemplo: nombre@gmail.com. Si no quieres dejarlo, bórralo.',
  errNet: 'No pudimos enviar tus datos. Revisa tu conexión e inténtalo de nuevo.',
  consentA: 'Al enviar aceptas que Casa-Libre te contacte por WhatsApp o email, según la ', consentB: 'Política de privacidad',
  preferWa: '¿Prefieres escribirnos?',
  keepReading: 'Sigue leyendo', writeUs: 'Escríbenos a',
  thanksAnswer: 'Una persona del equipo de Casa-Libre te escribirá por WhatsApp para ayudarte a publicar tu propiedad. No tiene costo.',
  thanksNoWait: 'No hace falta que esperes',
  thanksNow: 'Puedes publicar tu propiedad ahora mismo. Es gratis, toma pocos minutos y los interesados te escriben directo por WhatsApp.',
  thanksBtn: 'Publicar mi propiedad en Casa-Libre',
  thanksApp: 'Si prefieres hacerlo desde el celular, ', thanksAppLink: 'descarga la app de Casa-Libre para iPhone o Android',
  thanksPrep: 'Mientras tanto, prepara esto',
  thanksPrice: 'El precio que piensas pedir', thanksTitle: 'Si lo tienes a mano, el título de propiedad.',
  guiasTitle: 'Todas las guías para vender tu casa en',
  guiasReady: 'Cuando tengas todo listo, publica tu propiedad gratis en', guiasAfter: ': los interesados te escriben directo por WhatsApp.',
};

const USTED = {
  // editorial template labels
  explore: 'Explore la guía', cite: 'Cite esta guía', allGuides: 'Todas las guías', seeAll: 'Ver todas',
  howWeWrite: 'Cómo escribimos estas guías', formKicker: 'Para propietarios',
  formDone: 'Recibimos sus datos. Le llevamos a Casa-Libre para que publique gratis.', formGo: 'Ir ahora a Casa-Libre',
  stickyOwners: { Vender: 'Quiero vender mi casa', Alquilar: 'Quiero alquilar mi casa' },
  finish: 'Termina en', notFoundTitle: 'No encontramos esa página', notFoundText: 'Puede que la dirección haya cambiado. Mire todas las guías o vuelva al inicio.',
  formHeading: { Vender: '¿Quiere vender su casa? Le ayudamos gratis', Alquilar: '¿Quiere alquilar su casa? Le ayudamos' },
  formFinal: { Vender: '¿Listo para vender? Cuéntenos sobre su propiedad', Alquilar: '¿Listo para alquilar? Cuéntenos sobre su propiedad' },
  formSub: 'Déjenos sus datos y le escribimos por WhatsApp para publicarla gratis en Casa-Libre. No compramos propiedades.',
  stepProp: 'su propiedad', stepData: 'sus datos',
  qOperation: '¿Qué quiere hacer?', qCity: '¿Dónde está su propiedad?', qType: '¿Qué tipo de propiedad?',
  phCity: 'Elija la ciudad', phType: 'Elija el tipo',
  name: 'Su nombre', whatsapp: 'Su WhatsApp',
  errBoth: 'Elija la ciudad y el tipo de propiedad para seguir.',
  errCity: 'Elija en qué ciudad está su propiedad. Si no está en la lista, elija "Otra ciudad".',
  errType: 'Elija qué tipo de propiedad es. Si no está en la lista, elija "Otro".',
  errName: 'Escriba su nombre (con el nombre de pila basta).',
  errEmail: 'Revise su email. Ejemplo: nombre@gmail.com. Si no quiere dejarlo, bórrelo.',
  errNet: 'No pudimos enviar sus datos. Revise su conexión e inténtelo de nuevo.',
  consentA: 'Al enviar acepta que Casa-Libre le contacte por WhatsApp o email, según la ', consentB: 'Política de privacidad',
  preferWa: '¿Prefiere escribirnos?',
  keepReading: 'Siga leyendo', writeUs: 'Escríbanos a',
  thanksAnswer: 'Una persona del equipo de Casa-Libre le escribirá por WhatsApp para ayudarle a publicar su propiedad. No tiene costo.',
  thanksNoWait: 'No hace falta que espere',
  thanksNow: 'Puede publicar su propiedad ahora mismo. Es gratis, toma pocos minutos y los interesados le escriben directo por WhatsApp.',
  thanksBtn: 'Publicar mi propiedad en Casa-Libre',
  thanksApp: 'Si prefiere hacerlo desde el celular, ', thanksAppLink: 'descargue la app de Casa-Libre para iPhone o Android',
  thanksPrep: 'Mientras tanto, prepare esto',
  thanksPrice: 'El precio que piensa pedir', thanksTitle: 'Si lo tiene a mano, el título de propiedad.',
  guiasTitle: 'Todas las guías para vender su casa en',
  guiasReady: 'Cuando tenga todo listo, publique su propiedad gratis en', guiasAfter: ': los interesados le escriben directo por WhatsApp.',
};

const BY_VOICE = { voseo: VOSEO, 'tú': TU, usted: USTED };

/** The interface text for a country. */
export const ui = (cc) => BY_VOICE[countryOf(cc).voice] || VOSEO;

/** The consent sentence shown under the Enviar button (saved with every lead). */
export const consentText = (cc) => { const t = ui(cc); return `${t.consentA}${t.consentB}.`; };
