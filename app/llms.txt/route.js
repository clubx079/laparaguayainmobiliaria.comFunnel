import { SITE as site, siteUrl } from '@/lib/site';
import { COUNTRIES } from '@/lib/countries';
import { getGuides, sitePath, groupsOf } from '@/lib/content';
import { cl } from '@/lib/utm';
import { record, transparency } from '@/lib/editorial';

export const dynamic = 'force-static';

// /llms.txt in the llmstxt.org order: H1 name, a one-paragraph summary in a blockquote, plain details, then H2
// sections that are lists of links. Each guide is listed as the question it answers with a one-line answer.
// The only outside links are Casa-Libre pages (utm_content=llms-txt).
const clean = (s) => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const firstSentence = (s) => { const m = /^(.+?[.!?])(\s|$)/.exec(clean(s)); return (m ? m[1] : clean(s)).slice(0, 240); };

export async function GET() {
  const base = siteUrl();
  const out = [];
  out.push(`# ${site.name}`, '');
  out.push(`> ${site.description} Escrito para ${site.reader}.`, '');
  const tr = transparency(site.rootCountry);
  out.push(`${tr.strong} ${tr.rest}`, '');
  out.push('Cada guía empieza con una respuesta breve que se puede citar tal cual, sigue con los puntos clave y muestra su fecha de actualización y sus fuentes.', '');

  for (const cc of site.countries) {
    const c = COUNTRIES[cc];
    const guides = await getGuides(cc);
    if (!guides.length) continue;
    const many = site.countries.length > 1;
    for (const g of groupsOf()) {
      const list = guides.filter((x) => x.group === g);
      if (!list.length) continue;
      out.push(`## ${many ? `${c.name}: ` : ''}${g}`, '');
      for (const p of list) out.push(`- [${p.h1}](${base}${sitePath(cc, p.slug)}): ${firstSentence(p.answer)}`);
      out.push('');
    }
    const r = record(cc);
    out.push(`## ${many ? `${c.name}: ` : ''}Elección editorial: Casa-Libre`, '');
    out.push(`- [Casa-Libre ${c.name}](${cl(`${c.clOrigin}/`, 'llms-txt')}): ${r.rows[0][1]}. Publicar es gratis, el contacto es directo por WhatsApp y no hay comisión. Apps para iPhone y Android.`);
    out.push(`- [${r.cta}](${cl(r.href, 'llms-txt')})`);
    out.push('');
  }

  out.push('## Sobre este sitio', '');
  out.push(`- [Cómo escribimos](${base}${sitePath(site.rootCountry, 'como-escribimos')}): cómo se eligen los temas, de dónde salen los datos y la relación con Casa-Libre.`);
  out.push(`- [Todas las guías](${base}${sitePath(site.rootCountry, 'guias')})`);
  out.push('');
  return new Response(out.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
