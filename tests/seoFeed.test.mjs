// node --test tests/   (pure functions of lib/seoFeedClean.js: no Next, no build needed)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeHtml, cleanText, internalPath, allowedHref, cleanGuide, cleanOverride, cleanFeed, mergeGuides, PIPELINE_GROUP, EMPTY_FEED } from '../lib/seoFeedClean.js';

const hosts = ['casa-libre.com.py'];
const opts = { countries: ['py'], hostsFor: (cc) => (cc === 'py' ? hosts : []), reserved: ['guias', 'glosario', 'bolivia'] };
const pathOf = (cc, slug) => (slug ? `/${slug}/` : '/');

const good = (over = {}) => ({
  cc: 'py', slug: 'como-captar-duenos', title: 'Cómo captar dueños', h1: 'Cómo captar dueños en Paraguay',
  description: 'Una guía.', navLabel: 'Captar dueños', blurb: 'Breve.', published: '2026-11-20', updated: '2026-11-20',
  answer: 'Captar dueños es constancia.', summary: ['Punto <strong>uno</strong>'],
  sections: [{ id: 'paso-1', h2: 'Paso 1', blocks: [{ t: 'p', html: 'Texto con <a href="https://casa-libre.com.py/empresas">Casa-Libre</a>.' }, { t: 'ul', items: ['a', 'b'] }] }],
  faq: [{ q: '¿Sirve?', a: 'Sí.' }], source: 'pipeline', ...over,
});

test('sanitizeHtml keeps only a/strong/em', () => {
  assert.equal(sanitizeHtml('<p>Hola <strong>mundo</strong> <em>x</em></p>'), 'Hola <strong>mundo</strong> <em>x</em>');
  assert.equal(sanitizeHtml('a<script>alert(1)</script>b'), 'ab');
  assert.equal(sanitizeHtml('a<script>alert(1)'), 'a');
  assert.equal(sanitizeHtml('<img src=x onerror=alert(1)>hola'), 'hola');
  assert.equal(sanitizeHtml('<strong onclick="x()">hola</strong>'), '<strong>hola</strong>');
  assert.equal(sanitizeHtml('<b>uno</b> <i>dos</i>'), 'uno dos');
  assert.equal(sanitizeHtml('1 < 2 > 0'), '1 2 0');
  assert.equal(sanitizeHtml('<strong>abierto'), '<strong>abierto</strong>');
  assert.equal(sanitizeHtml('cerrado</em>'), 'cerrado');
  assert.equal(sanitizeHtml('<!-- c --><svg><script>x</script></svg>ok'), 'ok');
  assert.equal(sanitizeHtml('<script></script>'), '');
  assert.equal(sanitizeHtml(42), '');
});

test('sanitizeHtml links: internal paths and the allowed Casa-Libre host only', () => {
  assert.equal(sanitizeHtml('<a href="/farming-inmobiliario">x</a>'), '<a href="/farming-inmobiliario/">x</a>');
  assert.equal(sanitizeHtml('<a href="https://casa-libre.com.py/empresas?a=1&amp;b=2" target="_blank">x</a>', { hosts }), '<a href="https://casa-libre.com.py/empresas?a=1&amp;b=2">x</a>');
  assert.equal(sanitizeHtml('<a href="https://www.casa-libre.com.py/">x</a>', { hosts }), '<a href="https://www.casa-libre.com.py/">x</a>');
  assert.equal(sanitizeHtml('<a href="javascript:alert(1)">x</a>', { hosts }), 'x');
  assert.equal(sanitizeHtml('<a href="https://evil.com/">x</a>', { hosts }), 'x');
  assert.equal(sanitizeHtml('<a href="https://casa-libre.com.bo/">x</a>', { hosts }), 'x');
  assert.equal(sanitizeHtml('<a href="http://casa-libre.com.py/">x</a>', { hosts }), 'x');
  assert.equal(sanitizeHtml('<a href="//evil.com/x">x</a>', { hosts }), 'x');
  assert.equal(sanitizeHtml('<a href="https://casa-libre.com.py.evil.com/">x</a>', { hosts }), 'x');
  assert.equal(sanitizeHtml('<a href="/a/"><a href="/b/">x</a></a>'), '<a href="/a/">x</a>');
  assert.equal(sanitizeHtml('<a href=/a/ onmouseover=alert(1)>x</a>'), '<a href="/a/">x</a>');
  assert.equal(sanitizeHtml('<a href="/a/" onclick="steal()">x</a>'), '<a href="/a/">x</a>');
});

test('cleanText, internalPath, allowedHref', () => {
  assert.equal(cleanText('  <b>Hola</b>\n mundo &amp; más  '), 'Hola mundo & más');
  assert.equal(cleanText({}), '');
  assert.equal(cleanText('palabra '.repeat(30), 20).length <= 20, true);
  assert.equal(internalPath('/x'), '/x/');
  assert.equal(internalPath('/bolivia/x/'), '/bolivia/x/');
  assert.equal(internalPath('/x/#a'), '/x/#a');
  assert.equal(internalPath('//x'), '');
  assert.equal(internalPath('/X Y'), '');
  assert.equal(allowedHref('mailto:a@b.c', hosts), '');
});

test('cleanGuide accepts a good guide and drops bad ones', () => {
  const g = cleanGuide(good(), opts);
  assert.equal(g.slug, 'como-captar-duenos');
  assert.equal(g.sections[0].blocks.length, 2);
  assert.equal(g.source, 'pipeline');
  assert.equal(cleanGuide(good({ slug: 'Bad Slug' }), opts), null);
  assert.equal(cleanGuide(good({ slug: '../etc' }), opts), null);
  assert.equal(cleanGuide(good({ slug: 'guias' }), opts), null);
  assert.equal(cleanGuide(good({ cc: 'bo' }), opts), null);
  assert.equal(cleanGuide(good({ title: '' }), opts), null);
  assert.equal(cleanGuide(good({ answer: 5 }), opts), null);
  assert.equal(cleanGuide(good({ sections: 'x' }), opts), null);
  assert.equal(cleanGuide(good({ sections: [{ h2: 'x', blocks: [{ t: 'script', html: 'x' }] }] }), opts), null);
  assert.equal(cleanGuide(null, opts), null);
  assert.equal(cleanGuide([], opts), null);
});

test('cleanGuide cleans fields', () => {
  const g = cleanGuide(good({
    title: '<script>x</script>Título largo '.repeat(10),
    h1: 'H1 <img src=x onerror=alert(1)>',
    answer: 'Respuesta <script>alert(1)</script>clara',
    summary: ['ok', 7, '<script>x</script>'],
    published: 'ayer', updated: '2026-11-19T10:00:00Z',
    sections: [{ id: 'Bad ID!', h2: 'Sección', blocks: [{ t: 'p', html: '<a href="https://evil.com">malo</a> texto' }, { t: 'ul', items: ['<em>ok</em>', null] }] },
      { id: 'preguntas', h2: 'Choca', blocks: [{ t: 'p', html: 'x' }] }],
    faq: [{ q: '', a: 'x' }, { q: 'q', a: '<script>x</script>' }, { q: 'Bien', a: 'Sí' }],
  }), opts);
  assert.ok(g.title.length <= 70 && !g.title.includes('script'));
  assert.equal(g.h1, 'H1');
  assert.equal(g.answer, 'Respuesta clara');
  assert.deepEqual(g.summary, ['ok']);
  assert.equal(g.updated, '2026-11-19');
  assert.equal(g.published, '2026-11-19');
  assert.equal(g.sections[0].id, 'seccion');
  assert.equal(g.sections[0].blocks[0].html, 'malo texto');
  assert.deepEqual(g.sections[0].blocks[1].items, ['<em>ok</em>']);
  assert.notEqual(g.sections[1].id, 'preguntas');
  assert.deepEqual(g.faq, [{ q: 'Bien', a: 'Sí' }]);
  assert.ok(!JSON.stringify(g).includes('<script'));
});

test('cleanOverride and cleanFeed', () => {
  assert.deepEqual(cleanOverride({ path: '/farming-inmobiliario', title: 'Nuevo', extraLinks: [{ href: '/a', label: 'A' }, { href: 'https://x.com', label: 'X' }, { href: '/a/', label: 'dup' }] }),
    { path: '/farming-inmobiliario/', title: 'Nuevo', extraLinks: [{ href: '/a/', label: 'A' }] });
  assert.equal(cleanOverride({ path: 'https://x.com/', title: 'x' }), null);
  assert.equal(cleanOverride({ path: '/x/' }), null);
  assert.equal(cleanFeed(null), EMPTY_FEED);
  assert.equal(cleanFeed('x'), EMPTY_FEED);
  assert.equal(cleanFeed({ site: 'otro.com', guides: [good()] }, { domain: 'mio.com', ...opts }), EMPTY_FEED);
  const f = cleanFeed({ site: 'mio.com', guides: [good(), good(), good({ slug: 'BAD' }), 'x'], overrides: [{ path: '/a/', title: 'T' }, { path: '/a/', title: 'dup' }, 3] }, { domain: 'mio.com', ...opts });
  assert.equal(f.guides.length, 1);
  assert.equal(f.overrides.length, 1);
  assert.deepEqual(cleanFeed({ guides: 'x', overrides: {} }, opts).guides, []);
});

test('mergeGuides: static wins, new guides appended, overrides applied, extra links checked', () => {
  const statics = [{ slug: '', h1: 'Home', title: 'Home', group: 'G' }, { slug: 'farming', h1: 'Farming', title: 'Farming', description: 'd', group: 'G' }];
  const feed = cleanFeed({
    guides: [good({ slug: 'farming', title: 'Pisa' }), good({ slug: 'nueva', title: 'Nueva' }), good({ cc: 'bo', slug: 'otra' })],
    overrides: [
      { path: '/farming/', title: 'Farming 2026', extraLinks: [{ href: '/nueva/', label: 'Nueva' }, { href: '/no-existe/', label: 'X' }, { href: '/farming/', label: 'yo' }, { href: '/guias/', label: 'Todas' }] },
      { path: '/nueva/', h1: 'Nueva H1' },
    ],
  }, opts);
  let prepared = 0;
  const out = mergeGuides(statics, feed, 'py', { pathOf, prepare: (p) => { prepared++; return { ...p, tagged: true }; }, extraPaths: ['/guias/'] });
  assert.equal(out.length, 3);
  assert.equal(prepared, 1);
  const farming = out.find((g) => g.slug === 'farming');
  assert.equal(farming.title, 'Farming 2026');
  assert.equal(farming.h1, 'Farming');
  assert.equal(farming.description, 'd');
  assert.deepEqual(farming.extraLinks, [{ href: '/nueva/', label: 'Nueva' }, { href: '/guias/', label: 'Todas' }]);
  const nueva = out.find((g) => g.slug === 'nueva');
  assert.equal(nueva.group, PIPELINE_GROUP);
  assert.equal(nueva.h1, 'Nueva H1');
  assert.equal(nueva.tagged, true);
  assert.equal(statics[1].title, 'Farming'); // input untouched
});

test('mergeGuides never breaks the static list', () => {
  const statics = [{ slug: 'a' }];
  assert.equal(mergeGuides(statics, EMPTY_FEED, 'py', { pathOf }), statics);
  assert.equal(mergeGuides(statics, null, 'py', { pathOf }), statics);
  const feed = cleanFeed({ guides: [good({ slug: 'b' })] }, opts);
  assert.deepEqual(mergeGuides(statics, feed, 'py', { pathOf, prepare: () => { throw new Error('x'); } }), statics);
});
