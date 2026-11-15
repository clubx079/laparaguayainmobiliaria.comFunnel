// Structured data per page: Organization + WebSite for the site itself, Article (with dates and review),
// BreadcrumbList and FAQPage for a guide. Mirrors text that is visible on the page.
import { COUNTRIES } from './countries.js';
import { SITE as site, siteUrl, REVIEWED } from './site.js';
import { sitePath } from './content.js';

const place = (c) => ({ '@type': 'Country', name: c.name, identifier: c.code.toUpperCase() });

export function siteGraph(cc) {
  const c = COUNTRIES[cc];
  const base = siteUrl();
  const orgId = `${base}/#organization`;
  return {
    orgId,
    siteId: `${base}/#website`,
    nodes: [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: site.name,
        url: `${base}/`,
        description: site.description,
        areaServed: site.countries.map((code) => place(COUNTRIES[code])),
        publishingPrinciples: `${base}${sitePath(site.rootCountry, 'como-escribimos')}`,
      },
      { '@type': 'WebSite', '@id': `${base}/#website`, name: site.name, url: `${base}/`, inLanguage: c.lang, publisher: { '@id': orgId } },
    ],
  };
}

export function guideGraph(cc, page) {
  const c = COUNTRIES[cc];
  const base = siteUrl();
  const g = siteGraph(cc);
  const url = `${base}${sitePath(cc, page.slug)}`;
  const graph = [...g.nodes, {
    '@type': 'Article',
    headline: page.h1,
    description: page.description,
    inLanguage: c.lang,
    datePublished: page.published,
    dateModified: page.updated,
    ...(REVIEWED ? { lastReviewed: REVIEWED, reviewedBy: { '@id': g.orgId } } : {}),
    mainEntityOfPage: url,
    articleSection: page.group,
    spatialCoverage: place(c),
    author: { '@id': g.orgId },
    publisher: { '@id': g.orgId },
    isPartOf: { '@id': g.siteId },
    mentions: { '@type': 'Organization', name: 'Casa-Libre', url: `${c.clOrigin}/` },
  }];
  if (page.slug) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${base}${sitePath(cc, '')}` },
        { '@type': 'ListItem', position: 2, name: page.group, item: `${base}${sitePath(cc, 'guias')}` },
        { '@type': 'ListItem', position: 3, name: page.h1, item: url },
      ],
    });
  }
  if (page.faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: page.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: String(f.a).replace(/<[^>]+>/g, '') } })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function simpleGraph(cc, { name, description, path, type = 'WebPage', extra = {} }) {
  const g = siteGraph(cc);
  return { '@context': 'https://schema.org', '@graph': [...g.nodes, { '@type': type, name, description, url: `${siteUrl()}${path}`, inLanguage: COUNTRIES[cc].lang, isPartOf: { '@id': g.siteId }, ...extra }] };
}

export const JsonLd = ({ data }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
);
