// The frame of every page: edition strip, masthead, menu, footer and the bar fixed to the bottom of phones.
// Server component. Layout taken from the "Best AI Data Labs" example and the Kentucky reference site.
import Link from 'next/link';
import { SITE as site } from '@/lib/site';
import { COUNTRIES } from '@/lib/countries';
import { ui } from '@/lib/voice';
import { cl } from '@/lib/utm';
import { sitePath, fechaLarga } from '@/lib/content';
import { transparency } from '@/lib/editorial';
import { glossaryFor } from '@/lib/glossary';
import { Analytics, Track } from './Client';

const ctaLabel = (cc) => site.cta[COUNTRIES[cc].voice] || Object.values(site.cta)[0];

export default function Shell({ cc, edition, crumbs, hasForm = false, rental = false, children }) {
  const c = COUNTRIES[cc];
  const t = ui(cc);
  const to = (slug) => sitePath(cc, slug);
  const root = (slug) => sitePath(site.rootCountry, slug);
  const hasGloss = !!glossaryFor(cc);
  const ctaHref = cl(`${c.clOrigin}${site.ctaPath}`, 'header');
  const tr = transparency(cc);
  const others = site.countries.length > 1 ? site.countries.map((code) => ({ code, name: COUNTRIES[code].name, href: sitePath(code, '') })) : [];

  return (
    <div className="site" lang={c.lang}>
      <a className="skip" href="#guia">Ir al contenido</a>
      <header className="masthead">
        <div className="edition">
          <span className="edition-tagline">{site.tagline[cc] || Object.values(site.tagline)[0]}</span>
          {edition ? <span>Actualizado <time dateTime={edition}>{fechaLarga(edition)}</time></span> : null}
        </div>
        <div className="header">
          <Link className="brand" href={to('')}>
            {site.name}
            <small>{site.nameNote ? `${site.nameNote} · ` : ''}Edición {c.name}</small>
          </Link>
          <nav className="nav" aria-label="Principal">
            <Link href={to('guias')}>Guías</Link>
            {hasGloss ? <Link href={to('glosario')}>Glosario</Link> : null}
            <Link href={`${root('como-escribimos')}#fuentes`}>Fuentes</Link>
            <Link href={root('como-escribimos')}>Cómo escribimos</Link>
          </nav>
          <a className="cta" href={ctaHref} data-pos="header">{ctaLabel(cc)} <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <main className="main" id="guia">
        {crumbs?.length ? (
          <nav className="crumbs" aria-label="Migas de pan">
            <ol>
              {crumbs.map((x, i) => (
                <li key={i} aria-current={i === crumbs.length - 1 ? 'page' : undefined}>{x.href && i < crumbs.length - 1 ? <Link href={x.href}>{x.label}</Link> : x.label}</li>
              ))}
            </ol>
          </nav>
        ) : null}
        {children}
      </main>

      <footer className="footer">
        <p className="footer-brand"><strong>{site.name}</strong> <small>{site.tagline[cc] || Object.values(site.tagline)[0]}</small></p>
        <nav aria-label="Pie">
          <Link href={to('guias')}>{t.allGuides}</Link>
          {hasGloss ? <Link href={to('glosario')}>Glosario</Link> : null}
          <Link href={root('como-escribimos')}>{t.howWeWrite}</Link>
          <Link href={root('privacidad')}>Privacidad</Link>
          <Link href={root('contacto')}>Contacto</Link>
        </nav>
        {others.length ? (
          <p className="footer-countries">Ediciones: {others.map((o, i) => (
            <span key={o.code}>{i ? ' · ' : ''}{o.code === cc ? <strong>{o.name}</strong> : <Link href={o.href}>{o.name}</Link>}</span>
          ))}</p>
        ) : null}
        <p className="footer-note">{tr.strong} {tr.rest} © 2026 {site.name}.</p>
      </footer>

      <div className="sticky" data-pos="sticky">
        {hasForm
          ? <a className="btn" href="#formulario">{t.stickyOwners[rental ? 'Alquilar' : 'Vender']}</a>
          : <a className="btn" href={cl(`${c.clOrigin}${site.ctaPath}`, 'sticky')}>{ctaLabel(cc)} <span aria-hidden="true">↗</span></a>}
      </div>

      <Analytics site={site.funnelSite} domain={site.domain} cc={cc} />
      <Track />
    </div>
  );
}
