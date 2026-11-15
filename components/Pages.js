// The pages that are not guides: every guide by topic, the glossary, and "Cómo escribimos" / privacy / contact.
// Same three columns as a guide, so the whole site reads as one publication.
import Link from 'next/link';
import { Rail, Record, Directory } from './Article';
import { ui } from '@/lib/voice';
import { COUNTRIES } from '@/lib/countries';
import { sitePath, fechaCorta } from '@/lib/content';
import { glossaryFor } from '@/lib/glossary';
import { aboutFor, privacyFor, contactFor, transparency } from '@/lib/editorial';
import { SITE as site, REVIEWED } from '@/lib/site';

const Frame = ({ cc, guides, content, children }) => (
  <div className="grid">
    <Rail cc={cc} guides={guides} current={null} />
    <article className="article">{children}</article>
    <Record cc={cc} content={content} />
  </div>
);

export const guiasText = (cc) => {
  const c = COUNTRIES[cc];
  return {
    title: `Todas las guías de ${site.name}${site.countries.length > 1 ? ` · ${c.name}` : ''}`,
    h1: `Todas las guías${site.countries.length > 1 ? `: ${c.name}` : ''}`,
    description: `El índice completo de ${site.name}: guías para ${site.reader}, ordenadas por tema.`,
  };
};

export function GuiasPage({ cc, guides }) {
  const t = ui(cc);
  const x = guiasText(cc);
  const n = guides.filter((g) => g.slug).length;
  return (
    <Frame cc={cc} guides={guides} content="guias">
      <p className="kicker">Índice</p>
      <h1>{x.h1}</h1>
      <div className="answer">
        <p className="eyebrow">En esta página</p>
        <p className="answer-text">{n} guías para {site.reader}, ordenadas por tema. Cada una empieza con la respuesta breve.</p>
      </div>
      <section className="end" id="todas-las-guias">
        <h2 className="sr">{t.allGuides}</h2>
        <div className="entry entry-home">
          <p className="entry-title"><Link href={sitePath(cc, '')}>{guides.find((g) => !g.slug)?.h1}</Link></p>
          <p className="entry-blurb">La guía principal del sitio.</p>
        </div>
        <Directory cc={cc} guides={guides} skip={null} />
      </section>
    </Frame>
  );
}

export const glosarioText = (cc) => {
  const c = COUNTRIES[cc];
  return {
    title: `Glosario inmobiliario de ${c.name} | ${site.name}`,
    h1: `Glosario inmobiliario de ${c.name}`,
    description: `Las palabras que aparecen en las guías de ${site.name}, explicadas en lenguaje simple.`,
  };
};

export function GlosarioPage({ cc, guides }) {
  const g = glossaryFor(cc);
  const x = glosarioText(cc);
  return (
    <Frame cc={cc} guides={guides} content="glosario">
      <p className="kicker">Glosario</p>
      <h1>{x.h1}</h1>
      <div className="answer">
        <p className="eyebrow">Para qué sirve</p>
        <p className="answer-text">{g.intro}</p>
      </div>
      <p className="byline">Por el equipo editorial de {site.name} · Contenido revisado <time dateTime={REVIEWED}>{fechaCorta(REVIEWED)}</time></p>
      <section className="end glossary">
        <h2 className="sr">Términos</h2>
        <dl>
          {g.terms.map((x2) => (
            <div key={x2.term} id={x2.term.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')}>
              <dt>{x2.term}</dt>
              <dd>{x2.def}</dd>
            </div>
          ))}
        </dl>
        <p className="note">Definiciones generales para entender las guías. No reemplazan el consejo de un profesional.</p>
      </section>
    </Frame>
  );
}

export const infoFor = (slug) => (slug === 'como-escribimos' ? aboutFor() : slug === 'privacidad' ? privacyFor() : contactFor());

export function InfoPage({ cc, guides, slug }) {
  const p = infoFor(slug);
  const tr = transparency(cc);
  return (
    <Frame cc={cc} guides={guides} content={slug}>
      <p className="kicker">{site.name}</p>
      <h1>{p.h1}</h1>
      <div className="answer">
        <p className="answer-text">{p.lead}</p>
      </div>
      {slug === 'como-escribimos' ? (
        <p className="byline">Contenido revisado <time dateTime={p.reviewed}>{fechaCorta(p.reviewed)}</time></p>
      ) : null}
      <div className="body">
        {p.sections.map((s) => (
          <section id={s.id} key={s.id}>
            <h2>{s.h2}</h2>
            {s.paras.map((x, i) => <p key={i}>{x}</p>)}
          </section>
        ))}
      </div>
      {slug !== 'como-escribimos' ? <p className="note disclosure"><strong>{tr.strong}</strong> {tr.rest}</p> : null}
    </Frame>
  );
}

export function NotFoundBody({ cc }) {
  const t = ui(cc);
  return (
    <div className="grid grid-plain">
      <article className="article">
        <p className="kicker">Error 404</p>
        <h1>{t.notFoundTitle}</h1>
        <div className="answer"><p className="answer-text">{t.notFoundText}</p></div>
        <p className="paths"><Link href={sitePath(cc, 'guias')}>{t.allGuides}</Link><Link href={sitePath(cc, '')}>Inicio</Link></p>
      </article>
    </div>
  );
}
