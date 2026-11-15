// A guide, in the "Best AI Data Labs" / Kentucky layout, in Spanish:
// left rail (explore the guide) · article (kicker, H1, answer in brief, key points, byline, transparency note,
// contents, process diagram, sections, questions and answers, sources, cite) · right card (editorial choice).
import Link from 'next/link';
import { Blocks } from './Blocks';
import { COUNTRIES } from '@/lib/countries';
import { ui } from '@/lib/voice';
import { cl } from '@/lib/utm';
import { cityListings } from '@/lib/clLinks';
import { sitePath, groupsOf, wordCount, fechaLarga, fechaCorta, anchorOf, isRental } from '@/lib/content';
import { transparency, record } from '@/lib/editorial';
import { sourcesFor } from '@/lib/sources';
import { SITE as site, REVIEWED, TRANSPARENCY, siteUrl } from '@/lib/site';
import { HOME_FLOWS } from '@/lib/data/flows';

const H = ({ as: Tag = 'span', html, ...rest }) => <Tag {...rest} dangerouslySetInnerHTML={{ __html: html || '' }} />;
const short = (h2) => String(h2).replace(/^¿/, '').replace(/\?$/, '');

/** "Explorá la guía": the topics of the site, with the pages of the current topic open. */
export function Rail({ cc, guides, current }) {
  const t = ui(cc);
  const to = (slug) => sitePath(cc, slug);
  const groups = groupsOf(cc).map((g) => ({ name: g, list: guides.filter((x) => x.group === g) })).filter((g) => g.list.length);
  const label = (g) => g.navLabel || g.nav || g.h1;
  return (
    <nav className="rail" aria-label={t.explore}>
      <div className="rail-inner">
        <p className="eyebrow">{t.explore}</p>
        {groups.map((g) => {
          const open = current && current.group === g.name;
          const list = open ? g.list.slice(0, 14) : g.list.slice(0, 3);
          return (
            <div className="rail-group" key={g.name}>
              <p className="rail-topic">{g.name}</p>
              <ul>
                {list.map((x) => (
                  <li key={x.slug}><Link href={to(x.slug)} aria-current={current && current.slug === x.slug ? 'page' : undefined}>{label(x)}</Link></li>
                ))}
                {g.list.length > list.length ? <li><Link className="rail-more" href={`${to('guias')}#${anchorOf(g.name)}`}>{t.seeAll} ({g.list.length})</Link></li> : null}
              </ul>
            </div>
          );
        })}
        <hr />
        <ul>
          <li><Link href={to('guias')}>{t.allGuides}</Link></li>
          <li><Link href={sitePath(site.rootCountry, 'como-escribimos')}>{t.howWeWrite}</Link></li>
        </ul>
      </div>
    </nav>
  );
}

/** The right column: "Elección editorial: Casa-Libre". Every row that can take the reader to Casa-Libre is a link.
 *  On the owner sites the lead form comes first in the card, so it is on screen without scrolling. */
export function Record({ cc, content, form = false, rental = false }) {
  const t = ui(cc);
  const c = COUNTRIES[cc];
  const r = record(cc);
  const tag = (href, spot) => cl(href, content ? `${content}-record-${spot}` : `record-${spot}`);
  return (
    <aside className={form ? 'record record-form' : 'record'} aria-label="Elección editorial" data-pos="record">
      <div className="record-inner">
        <p className="eyebrow">Elección editorial</p>
        <p className="record-name">{r.name}</p>
        <dl className="record-facts">
          {r.rows.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
        </dl>
        <dl>
          {r.linked.map(([k, v, href, spot]) => (<div key={k}><dt>{k}</dt><dd><a href={tag(href, spot)}>{v} <span aria-hidden="true">↗</span></a></dd></div>))}
        </dl>
        <ul className="record-more">
          {r.more.map(([label, href], i) => <li key={href}><a href={tag(href, `mas-${i + 1}`)}>{label} <span aria-hidden="true">↗</span></a></li>)}
        </ul>
        <a className="record-cta" href={tag(r.href, 'cta')}>{r.cta} <span aria-hidden="true">↗</span></a>
        <hr />
        <Link href={sitePath(site.rootCountry, 'como-escribimos')}>{t.howWeWrite}</Link>
      </div>
    </aside>
  );
}

function Flow({ steps }) {
  if (!steps?.length) return null;
  return (
    <figure className="flow" aria-label="El proceso de un vistazo">
      <ol>{steps.map((s, i) => <li key={i}><span>{s}</span></li>)}</ol>
      <figcaption className="sr">{steps.join(' → ')}</figcaption>
    </figure>
  );
}

export function Directory({ cc, guides, skip }) {
  const to = (slug) => sitePath(cc, slug);
  const groups = groupsOf(cc).map((g) => ({ name: g, list: guides.filter((x) => x.group === g && x.slug !== skip && x.slug !== '') })).filter((g) => g.list.length);
  return groups.map((g) => (
    <div className="dir-group" key={g.name} id={anchorOf(g.name)}>
      <h3 className="dir-topic">{g.name}</h3>
      <div className="directory">
        {g.list.map((x) => (
          <div className="entry" key={x.slug}>
            <p className="entry-title"><Link href={to(x.slug)}>{x.h1}</Link></p>
            {x.blurb ? <p className="entry-blurb">{x.blurb}</p> : null}
          </div>
        ))}
      </div>
    </div>
  ));
}

export default function Article({ cc, page, guides }) {
  const c = COUNTRIES[cc];
  const t = ui(cc);
  const isHome = !page.slug;
  const to = (slug) => sitePath(cc, slug);
  const content = page.slug || 'home';
  const rental = isRental(page);
  const hasForm = site.kind === 'owners';
  const sources = sourcesFor(page);
  const tr = transparency(cc);
  const minutes = Math.max(2, Math.round(wordCount(page) / 200));
  const reviewed = REVIEWED;
  const flow = page.flow || (isHome ? HOME_FLOWS[cc] : null);
  const related = (page.related || []).map((slug) => guides.find((g) => g.slug === slug)).filter(Boolean);
  const siblings = guides.filter((g) => g.group === page.group && g.slug !== page.slug && !related.some((r) => r.slug === g.slug)).slice(0, 8);
  const city = site.kind === 'library' ? [] : cityListings(page);
  const url = `${siteUrl()}${to(page.slug)}`;
  const toc = [
    ...(page.why ? [{ id: 'por-que-casa-libre', label: 'Por qué Casa-Libre' }] : []),
    ...(page.sections || []).map((s) => ({ id: s.id, label: short(s.h2) })),
    ...(isHome ? [{ id: 'todas-las-guias', label: t.allGuides }] : []),
    ...(page.faq?.length ? [{ id: 'preguntas', label: 'Preguntas y respuestas' }] : []),
    ...(sources.length ? [{ id: 'fuentes', label: 'Fuentes de esta guía' }] : []),
    { id: 'citar', label: t.cite },
  ];
  const offerAt = Math.min(1, (page.sections || []).length - 1); // the editorial note sits after the second section

  return (
    <div className={hasForm ? 'grid has-form' : 'grid'}>
      <Rail cc={cc} guides={guides} current={page} />

      <article className="article">
        <p className="kicker">{page.group}</p>
        <h1>{page.h1}</h1>

        <div className="answer">
          <p className="eyebrow">Respuesta breve</p>
          <p className="answer-text">{page.answer}</p>
          {page.summary?.length ? (
            <div className="takeaways">
              <p className="takeaways-title">Puntos clave</p>
              <ul>{page.summary.map((s, i) => <H as="li" key={i} html={s} />)}</ul>
            </div>
          ) : null}
        </div>

        {city.length ? (
          <p className="city-cta" data-pos="city-cta">
            <a className="btn btn-alt" href={cl(city[0][0], `${content}-city-top`)}>Ver {city[0][1].charAt(0).toLowerCase() + city[0][1].slice(1)} en Casa-Libre <span aria-hidden="true">↗</span></a>
          </p>
        ) : null}

        <p className="byline">
          Por el equipo editorial de {site.name} · Actualizado <time dateTime={page.updated}>{fechaCorta(page.updated)}</time>
          {reviewed ? <> · Contenido revisado <time dateTime={reviewed}>{fechaCorta(reviewed)}</time></> : null} · {minutes} min de lectura
        </p>
        {TRANSPARENCY === 'visible' ? (
          <p className="note disclosure">
            <strong>{tr.strong}</strong> {tr.rest} <Link href={sitePath(site.rootCountry, 'como-escribimos')}>{t.howWeWrite}</Link>.
          </p>
        ) : null}

        {/* near the top of the page: straight after the answer, before the contents */}
        {page.why ? (
          <section className="why" id="por-que-casa-libre" data-pos="why">
            <p className="eyebrow">Elección editorial</p>
            <h2>{page.why.title}</h2>
            {page.why.paras.map((x, i) => <H as="p" key={i} html={x} />)}
          </section>
        ) : null}

        <nav className="toc" aria-label="En esta guía">
          <p className="toc-title">En esta guía</p>
          <ol>{toc.map((x) => <li key={x.id}><a href={`#${x.id}`}>{x.label}</a></li>)}</ol>
        </nav>

        <Flow steps={flow} />

        <div className="body">
          {(page.sections || []).map((s, i) => (
            <section id={s.id} key={s.id} data-pos="body">
              <h2>{s.h2}</h2>
              <Blocks blocks={s.blocks} k={s.id} />
              {i === offerAt && page.cta ? (
                <div className="offer-inline" role="note" data-pos="cta">
                  <p className="offer-kicker">Elección editorial</p>
                  <p className="offer-title">{page.cta.title}</p>
                  <p className="offer-text">{page.cta.text}</p>
                  <p className="offer-action">
                    <a className="offer-link" href={page.cta.href}>{page.cta.button} <span aria-hidden="true">↗</span></a>
                    <span className="offer-note">{t.finish} {c.clHost}, el sitio de Casa-Libre.</span>
                  </p>
                </div>
              ) : null}
            </section>
          ))}
        </div>

        {isHome ? (
          <section className="end" id="todas-las-guias">
            <h2>{t.allGuides}</h2>
            <Directory cc={cc} guides={guides} skip={page.slug} />
          </section>
        ) : null}

        {page.closing ? (
          <section className="end offer" data-pos="closing" aria-label="Siguiente paso">
            <div className="offer-card">
              <p className="eyebrow">Elección editorial</p>
              <p className="offer-name">Casa-Libre</p>
              <h2 className="offer-h">{page.closing.title}</h2>
              <p>{page.closing.text}</p>
              <p className="offer-buttons"><a className="btn" href={page.closing.href}>{page.closing.button} <span aria-hidden="true">↗</span></a></p>
            </div>
          </section>
        ) : null}

        {page.faq?.length ? (
          <section className="end faq" id="preguntas">
            <h2>Preguntas y respuestas</h2>
            {page.faq.map((f, i) => (
              <div className="faq-item" key={i}><h3>{f.q}</h3><H as="p" html={f.a} /></div>
            ))}
          </section>
        ) : null}

        {!isHome && (related.length || siblings.length) ? (
          <section className="end more" aria-labelledby="seguir">
            <h2 id="seguir">{t.keepReading}</h2>
            {related.length ? (
              <div className="directory">
                {related.map((g) => (
                  <div className="entry" key={g.slug}>
                    <p className="entry-topic">{g.group}</p>
                    <p className="entry-title"><Link href={to(g.slug)}>{g.h1}</Link></p>
                    {g.blurb ? <p className="entry-blurb">{g.blurb}</p> : null}
                  </div>
                ))}
              </div>
            ) : null}
            {siblings.length ? (
              <p className="paths">{siblings.map((g) => <Link key={g.slug} href={to(g.slug)}>{g.navLabel || g.nav || g.h1}</Link>)}</p>
            ) : null}
          </section>
        ) : null}

        {sources.length ? (
          <section className="end sources" id="fuentes">
            <h2>Fuentes de esta guía</h2>
            <ol>{sources.map((s, i) => <li key={i}><strong>{s.label}</strong>{s.detail ? <> : {s.detail}</> : null}</li>)}</ol>
            <p className="note">Normas y organismos citados en el texto. Los precios, cuando los hay, son precios de publicación y no precios de cierre.</p>
          </section>
        ) : null}

        <section className="end cite" id="citar">
          <h2>{t.cite}</h2>
          <p>{site.name}. “{page.h1}.” Actualizado el {fechaLarga(page.updated)}. <span className="cite-url">{url}</span></p>
        </section>
      </article>

      <Record cc={cc} content={content} form={hasForm} rental={rental} />
    </div>
  );
}
