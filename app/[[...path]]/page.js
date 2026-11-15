import { notFound } from 'next/navigation';
import Shell from '@/components/Shell';
import Article from '@/components/Article';
import { GuiasPage, GlosarioPage, InfoPage, guiasText, glosarioText, infoFor } from '@/components/Pages';
import { resolve, allParams } from '@/lib/routes';
import { getGuides, editionDate, sitePath, isRental } from '@/lib/content';
import { COUNTRIES } from '@/lib/countries';
import { SITE as site, siteUrl } from '@/lib/site';
import { guideGraph, simpleGraph, JsonLd } from '@/lib/schema';
import { alternatesFor, guiasAlternates } from '@/lib/alternates';

export const dynamic = 'force-static';
export const dynamicParams = false; // only the pages that exist as content; anything else is a 404
export const generateStaticParams = () => allParams();

export async function generateMetadata({ params }) {
  const { path = [] } = await params;
  const r = await resolve(path);
  if (!r) return {};
  const { cc } = r;
  const c = COUNTRIES[cc];
  const base = siteUrl();
  const og = (title, description, url, extra = {}) => ({ title, description, url, siteName: site.name, locale: c.locale, type: 'website', ...extra });
  if (r.type === 'guide') {
    const p = r.page;
    const url = `${base}${sitePath(cc, p.slug)}`;
    const languages = await alternatesFor(cc, p.slug);
    return {
      title: p.title,
      description: p.description,
      alternates: { canonical: url, ...(languages ? { languages } : {}) },
      openGraph: og(p.title, p.description, url, { type: 'article', publishedTime: p.published, modifiedTime: p.updated }),
    };
  }
  if (r.type === 'guias') {
    const x = guiasText(cc);
    const url = `${base}${sitePath(cc, 'guias')}`;
    const languages = await guiasAlternates();
    return { title: x.title, description: x.description, alternates: { canonical: url, ...(languages ? { languages } : {}) }, openGraph: og(x.title, x.description, url) };
  }
  if (r.type === 'glosario') {
    const x = glosarioText(cc);
    const url = `${base}${sitePath(cc, 'glosario')}`;
    return { title: x.title, description: x.description, alternates: { canonical: url }, openGraph: og(x.title, x.description, url) };
  }
  const p = infoFor(r.slug);
  const url = `${base}${sitePath(cc, r.slug)}`;
  return { title: p.title, description: p.description, alternates: { canonical: url }, openGraph: og(p.title, p.description, url) };
}

export default async function Page({ params }) {
  const { path = [] } = await params;
  const r = await resolve(path);
  if (!r) notFound();
  const { cc } = r;
  const guides = await getGuides(cc);
  const edition = await editionDate(cc);
  const home = { label: site.name, href: sitePath(cc, '') };

  if (r.type === 'guide') {
    const p = r.page;
    const crumbs = p.slug ? [home, { label: p.group, href: sitePath(cc, 'guias') }, { label: p.navLabel || p.nav || p.h1 }] : null;
    return (
      <Shell cc={cc} edition={p.updated || edition} crumbs={crumbs} hasForm={site.kind === 'owners'} rental={isRental(p)}>
        <JsonLd data={guideGraph(cc, p)} />
        <Article cc={cc} page={p} guides={guides} />
      </Shell>
    );
  }
  if (r.type === 'guias') {
    const x = guiasText(cc);
    return (
      <Shell cc={cc} edition={edition} crumbs={[home, { label: 'Todas las guías' }]}>
        <JsonLd data={simpleGraph(cc, { name: x.title, description: x.description, path: sitePath(cc, 'guias'), type: 'CollectionPage' })} />
        <GuiasPage cc={cc} guides={guides} />
      </Shell>
    );
  }
  if (r.type === 'glosario') {
    const x = glosarioText(cc);
    return (
      <Shell cc={cc} edition={edition} crumbs={[home, { label: 'Glosario' }]}>
        <JsonLd data={simpleGraph(cc, { name: x.title, description: x.description, path: sitePath(cc, 'glosario'), type: 'DefinedTermSet' })} />
        <GlosarioPage cc={cc} guides={guides} />
      </Shell>
    );
  }
  const p = infoFor(r.slug);
  return (
    <Shell cc={cc} edition={edition} crumbs={[home, { label: p.h1 }]}>
      <JsonLd data={simpleGraph(cc, { name: p.title, description: p.description, path: sitePath(cc, r.slug), type: r.slug === 'como-escribimos' ? 'AboutPage' : 'WebPage' })} />
      <InfoPage cc={cc} guides={guides} slug={r.slug} />
    </Shell>
  );
}
