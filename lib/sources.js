// "Fuentes de esta guía". New guides carry their own `sources` list. The guides brought over from the earlier sites
// do not, so for them we list what the text itself cites: the laws by number and the public bodies it names, plus
// Casa-Libre's published listings when the page uses asking prices. Nothing is added that the page does not mention.
// Plain text only: no links, no other websites.
import { snapshotDateEs } from './market.js';

const BODIES = {
  py: [
    [/Servicio Nacional de Catastro|\bCatastro\b/, 'Servicio Nacional de Catastro', 'Datos catastrales del inmueble.'],
    [/Registros? Públicos?/, 'Dirección General de los Registros Públicos', 'Inscripción de títulos, condición de dominio y gravámenes.'],
    [/\bDNIT\b/, 'Dirección Nacional de Ingresos Tributarios (DNIT)', 'Impuestos nacionales que alcanzan a la operación.'],
    [/\bINDERT\b/, 'Instituto Nacional de Desarrollo Rural y de la Tierra (INDERT)', 'Tierras de origen rural y su titulación.'],
    [/municipalidad/i, 'Municipalidad de la ciudad donde está el inmueble', 'Impuesto inmobiliario, tasas y certificados municipales.'],
    [/\bMUVH\b/, 'Ministerio de Urbanismo, Vivienda y Hábitat (MUVH)', 'Programas públicos de vivienda.'],
    [/\bAFD\b/, 'Agencia Financiera de Desarrollo (AFD)', 'Fondeo de créditos para la vivienda.'],
    [/Poder Judicial|juzgado/i, 'Poder Judicial', 'Juicios, medidas cautelares y sucesiones.'],
    [/Migraciones/, 'Dirección Nacional de Migraciones', 'Radicación de extranjeros.'],
  ],
  bo: [
    [/Derechos Reales|\bDDRR\b/, 'Derechos Reales (Consejo de la Magistratura)', 'Registro de la propiedad, folio real y gravámenes.'],
    [/gobierno municipal|alcald[ií]a|catastro/i, 'Gobierno Autónomo Municipal de la ciudad donde está el inmueble', 'Catastro, impuestos municipales y planos aprobados.'],
    [/Impuestos Nacionales|\bSIN\b/, 'Servicio de Impuestos Nacionales (SIN)', 'Impuestos nacionales que alcanzan a la operación.'],
    [/\bASFI\b/, 'Autoridad de Supervisión del Sistema Financiero (ASFI)', 'Reglas del crédito de vivienda.'],
    [/notari[oa] de fe pública/i, 'Notarías de Fe Pública (Dirección del Notariado Plurinacional)', 'Protocolización de minutas y poderes.'],
    [/Agencia Estatal de Vivienda/, 'Agencia Estatal de Vivienda', 'Programas públicos de vivienda.'],
  ],
  uy: [
    [/Registro de la Propiedad/, 'Dirección General de Registros, Registro de la Propiedad (Sección Inmobiliaria)', 'Inscripción de títulos y gravámenes.'],
    [/\bDGI\b/, 'Dirección General Impositiva (DGI)', 'Impuestos que alcanzan a la operación.'],
    [/Catastro/, 'Dirección Nacional de Catastro', 'Cédula catastral y valor real del inmueble.'],
    [/Intendencia/, 'Intendencia del departamento donde está el inmueble', 'Contribución inmobiliaria y tributos departamentales.'],
    [/\bBPS\b/, 'Banco de Previsión Social (BPS)', 'Certificados exigidos en la venta.'],
    [/\bANV\b|Agencia Nacional de Vivienda/, 'Agencia Nacional de Vivienda (ANV)', 'Garantías y programas de vivienda.'],
    [/Contaduría General/, 'Contaduría General de la Nación', 'Garantía de alquileres.'],
  ],
  ve: [
    [/\bSAREN\b|Registro Público|Registro Inmobiliario/, 'Servicio Autónomo de Registros y Notarías (SAREN)', 'Registro inmobiliario y notarías.'],
    [/\bSENIAT\b/, 'Servicio Nacional Integrado de Administración Aduanera y Tributaria (SENIAT)', 'Impuestos que alcanzan a la operación.'],
    [/alcald[ií]a|municipal/i, 'Alcaldía del municipio donde está el inmueble', 'Solvencias e impuestos municipales.'],
    [/\bSUNAVI\b/, 'Superintendencia Nacional de Arrendamiento de Vivienda (SUNAVI)', 'Reglas del alquiler de vivienda.'],
  ],
  sv: [
    [/\bCNR\b|Centro Nacional de Registros/, 'Centro Nacional de Registros (CNR)', 'Registro de la propiedad raíz e hipotecas, y catastro.'],
    [/Ministerio de Hacienda/, 'Ministerio de Hacienda', 'Impuestos que alcanzan a la operación.'],
    [/alcald[ií]a|municipal/i, 'Alcaldía del municipio donde está el inmueble', 'Solvencia municipal y tasas.'],
    [/Fondo Social para la Vivienda|\bFSV\b/, 'Fondo Social para la Vivienda (FSV)', 'Créditos para vivienda.'],
  ],
};

const LAW = /\b(Ley(?:\s+N\.?\s?[º°o]?\.?)?\s+\d{1,5}(?:\/\d{2,4})?|Decreto(?:\s+Supremo)?(?:\s+N\.?\s?[º°o]?\.?)?\s+\d{1,6}(?:\/\d{2,4})?|Código Civil(?:\s+y\s+Comercial)?|Código Procesal Civil|Código Tributario|Código de Comercio)/g;

const textOf = (page) => JSON.stringify({ a: page.answer, s: page.summary, x: page.sections, f: page.faq }).replace(/<[^>]+>/g, ' ');

/** [{ label, detail }] to show under "Fuentes". Empty when the page cites nothing we can name. */
export function sourcesFor(page) {
  if (Array.isArray(page.sources) && page.sources.length) return page.sources.map((s) => ({ label: s.label, detail: s.detail || '' }));
  const cc = page.cc || 'py';
  const text = textOf(page);
  const out = [];
  const seen = new Set();
  for (const m of text.matchAll(LAW)) {
    const label = m[1].replace(/\s+/g, ' ');
    const key = label.toLowerCase().replace(/n\.?\s?[º°o]\.?\s*/, '');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ label, detail: 'Norma citada en el texto.' });
    if (out.length >= 5) break;
  }
  for (const [re, label, detail] of BODIES[cc] || []) {
    if (out.length >= 8) break;
    if (re.test(text)) out.push({ label, detail });
  }
  if (/precios? de publicaci[oó]n|precio mediano|mediana de/i.test(text)) {
    const d = snapshotDateEs(cc);
    out.push({ label: `Avisos publicados en Casa-Libre${d ? ` (consulta del ${d})` : ''}`, detail: 'Precios de publicación, no precios de cierre.' });
  }
  return out;
}
