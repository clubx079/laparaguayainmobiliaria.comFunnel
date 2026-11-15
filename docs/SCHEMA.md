# Content schema and writing rules

> Pages for Bolivia, Uruguay, Venezuela and El Salvador: these rules plus `content/COUNTRY_GUIDE.md` (own folder, own Casa-Libre site, own words).

Each guide is one file in `content/pages/<slug>.js` that default-exports a plain object. The site renders every field as static HTML. Nothing else is needed to publish a guide.

## Shape

```js
export default {
  slug: 'como-vender-un-terreno-paraguay',  // '' for the home page (file: home.js)
  title: 'Cómo vender un terreno en Paraguay: requisitos y pasos', // <title>, 50 to 60 characters, main phrase first, no pipes or brackets
  h1: 'Cómo vender un terreno en Paraguay',     // same as the title (or its first part)
  description: '…',                          // meta description, 140 to 160 characters, answers the query and says what the page gives
  navLabel: 'Vender un terreno',            // 2 to 3 words for menus and related links
  blurb: '…',                                // one sentence (max 140 characters) used in "related guides" and llms.txt
  published: '2026-11-12',
  updated: '2026-11-12',
  review: 'pending',                         // 'pending' if the page states legal, tax, licence or fee facts that a Paraguayan professional must check; otherwise 'none'
  reviewNote: '…',                           // only when pending: what exactly must be checked (English, one or two sentences, for the team)
  answer: '…',                               // the answer block: 40 to 80 words that answer the question outright, names Paraguay, may end with one sentence naming Casa-Libre; no link
  summary: ['…', '…', '…'],                  // "En resumen": 3 to 5 bullets, concrete, with numbers where a sourced number exists
  cta: { title: '…', text: '…', button: '…', href: 'https://casa-libre.com.py/empresas' }, // the card shown right after the summary
  sections: [
    { id: 'kebab-id', h2: '…', blocks: [ /* see Blocks */ ] },
  ],
  faq: [ { q: '¿…?', a: '…' } ],             // 4 to 8, questions phrased the way people type them; answers 2 to 4 sentences, inline HTML allowed
  internalSources: [ { label: '…', url: 'https://…', date: '2026-08-03', note: '…' } ], // NOT shown on the site; kept so the team can verify facts
  closing: { title: '…', text: '…', button: '…', href: 'https://casa-libre.com.py/…' },   // closing band
  related: ['', 'cuanto-cobra-escribano-paraguay', 'tasacion-de-inmuebles-paraguay'], // 3 or 4 slugs of other guides ('' = home)
};
```

## Blocks

Text fields named `html` (and `faq[].a`, list items, table cells, `answer` excluded) may contain only this inline HTML: `<strong>`, `<em>`, `<a href="…">`. No other tags, no classes, no inline styles.

```js
{ t: 'p', html: '…' }
{ t: 'h3', text: '…' }
{ t: 'ul', items: ['…', '…'] }
{ t: 'ol', items: ['…', '…'] }                       // real sequences only
{ t: 'steps', items: [ { title: '…', html: '…' } ] }  // a procedure with a short title per step
{ t: 'table', caption: '…', head: ['…','…'], rows: [ ['…','…'] ], note: '…' } // note: source + date of the figures, inline HTML allowed
{ t: 'callout', tone: 'tip' | 'warn' | 'fact', title: '…', html: '…' }
{ t: 'example', title: 'Ejemplo ilustrativo: …', html: '…', rows: [ ['Concepto', 'Monto'] ] } // worked example; rows optional
{ t: 'casalibre', title: '…', html: '…', button: '…', href: 'https://casa-libre.com.py/…' } // the one strong Casa-Libre mention with a button (max 1 per page)
```

## Page structure rules

- Every `h2` is a sub-question or a clear topic, and its first block is a `p` of 1 to 3 sentences that answers it directly.
- 5 to 9 sections per guide (the home page: 9 to 11). At least one `table` high on the page (first or second section). Paragraphs of 2 to 4 sentences.
- Include one worked `example` with numbers in guaraníes and USD where the topic allows. Label it "Ejemplo ilustrativo" and use round, clearly hypothetical inputs; show the arithmetic.
- Section ids: lowercase, hyphens, no accents.
- Slugs and URLs of the site's guides (use these exact relative paths for internal links):
  `/` (Quiero vender mi casa en Paraguay), `/donde-publicar-casa-en-venta-paraguay/`, `/como-vender-un-terreno-paraguay/`, `/tasacion-de-inmuebles-paraguay/`, `/cuanto-cobra-escribano-paraguay/`, `/transferencia-de-inmueble-paraguay/`, `/politica-editorial/`, `/quienes-somos/`.
- The site has a lead form ("Quiero vender mi casa"). The template places it by itself; do not write form markup. You may refer to it in text as "el formulario de esta página".
- Link to other guides of this site where a reader needs them: 2 to 5 internal links per guide, with descriptive anchor text. These are the only links that do not go to Casa-Libre.

## Language

- The reader is a property OWNER in Paraguay who wants to sell (a house, a departamento or a terreno), usually for the first time. Explain every step and every term in plain words.
- Spanish as written in Paraguay. Body copy, buttons and calls to action use voseo consistently (publicá, calculá, tenés, podés); never mix tú or usted. Titles, H1 and H2 use the searched, neutral forms ("cómo vender", "cuánto cobra", "quiero vender").
- Words to use: casa, departamento, terreno, propiedad; inmueble in legal, tax and paperwork contexts ("transferencia de inmueble", "tasación de inmuebles"); escribano, escribanía, título de propiedad, titular, transferencia, impuesto inmobiliario, Catastro, Registro Público; alquiler; dormitorios; guaraníes (Gs. 300.000.000 / 300 millones) with a USD equivalent. People ask cost questions three ways: "cuánto cuesta", "cuánto vale", "cuánto sale": use all three across headings and FAQ.
- Words to avoid: notario, notaría, apartamento, piso, renta, arriendo, lote (except "lotes a cuotas", "loteamiento"), "dueño directo", "compro casas", "compramos tu casa", "oferta en efectivo", any US concept (ejecución hipotecaria, costos de cierre, sótano). Call our own price help "estimación de precio", never "tasación" (a tasación is a paid professional report).
- Write accents correctly in all visible text (Asunción, Capiatá, Ñemby). Thousands separator is a dot (Gs. 60.000).
- Plain, concrete, useful. No hype, no filler introductions. Do not use em dashes; use commas, colons or full stops.

## The rule above all others: Casa-Libre only

This site exists to get owners to publish their property on Casa-Libre (and to collect the leads of those who want help doing it). Decided by the owner on 2026-11-12:

- **Every outbound link goes to casa-libre.com.py.** No link to any other website, ever: no news sites, no laws, no associations, no other portals, no social networks.
- **No other website, portal, company, franchise, association, newspaper or app is named.** Not InfoCasas, Clasipar, RE/MAX, ACIP, Infonegocios, ABC Color, Facebook, Marketplace, Instagram, TikTok, Google, or any other. Speak of them only by type: "otros portales", "los clasificados", "las redes sociales", "las franquicias", "el gremio inmobiliario", "la prensa".
- The only outside names allowed are **WhatsApp**, **iPhone** and **Android**, because Casa-Libre works through them. Public bodies a reader must deal with to complete a sale (for example Catastro, Registro Público, the municipality, DNIT, INDERT) may be named in plain text, never linked.
- **Casa-Libre is the recommended answer on every page.** Each guide teaches the subject and shows, step by step, how to do it with Casa-Libre.

- **Brand spelling:** always write "Casa-Libre", with a hyphen, in every visible text. Never "Casa Libre".

## Casa-Libre links (hard, revised 2026-11-13: SEO safety)

Too many links to one site, with keyword anchors repeated across pages, reads to search engines as a link scheme. So:

- **At most 10 links to Casa-Libre on each rendered page, everything included.** The template already adds 3 on every page (header button, the "Casa-Libre" link in the footer, the sticky phone bar), 1 more on city pages (the city listings button), and the `cta` and `closing` buttons add 2. That leaves **2 to 4 links in the body** (inline anchors plus the button of the one `casalibre` block). `npm run check` fails above 4.
- Place each body link where it helps the reader do what the paragraph describes. Never two in the same sentence, never in the `answer` or the `summary`.
- **Anchor text:** mostly the brand alone (`<a href="…">Casa-Libre</a>`), or a plain phrase such as "publicar en Casa-Libre" or "ver casas en Casa-Libre". Do not use keyword phrases as anchors ("casas en venta en Luque en Casa-Libre"): write the phrase as text and link only the brand. The checker warns when the same non-brand anchor appears on more than 2 pages.
- **Rental pages link to rental destinations** (`/alquilar`, `/alquiler/...`, `?op=alquiler`, `/administracion-de-propiedades`, the Casa-Libre rental guide, `/publicar`); **sale pages link to sale destinations**. Rental pages: the 10 `alquiler-de-casas-en-*` pages plus `como-alquilar-mi-casa-paraguay`, `contrato-de-alquiler-paraguay`, `cuanto-cobrar-de-alquiler-paraguay`, `cuanto-cuesta-un-alquiler-en-paraguay`, `donde-publicar-un-alquiler-gratis`, `garantia-de-alquiler-paraguay`, `iva-del-alquiler-paraguay`, `conviene-vender-o-alquilar-mi-casa`. The checker enforces it.
- Bare mentions of "Casa-Libre" are NOT turned into links by the template any more: only the links written in the content file exist.
- Allowed destinations (all checked live on 2026-11-12; use no other URL):
  - `https://casa-libre.com.py/` : home
  - `https://casa-libre.com.py/publicar` : opens the publishing flow
  - `https://casa-libre.com.py/vender` : how selling on Casa-Libre works
  - `https://casa-libre.com.py/empresas` : for inmobiliarias and agents (the agency account)
  - `https://casa-libre.com.py/descargar` : the iPhone and Android apps
  - `https://casa-libre.com.py/propiedades` : all properties, with map search
  - `https://casa-libre.com.py/comprar` and `https://casa-libre.com.py/alquilar` : properties for sale / for rent
  - `https://casa-libre.com.py/venta/casas/asuncion`, `https://casa-libre.com.py/venta/departamentos/asuncion`, `https://casa-libre.com.py/alquiler/departamentos/asuncion`, `https://casa-libre.com.py/alquiler/casas/asuncion`, `https://casa-libre.com.py/propiedades-en/asuncion` : listing pages for Asunción
  - `https://casa-libre.com.py/como-funciona` : how Casa-Libre works
  - `https://casa-libre.com.py/preguntas-frecuentes` : Casa-Libre FAQ
  - `https://casa-libre.com.py/guias` and `https://casa-libre.com.py/guias/como-vender-mi-casa` : Casa-Libre guides for owners
  - `https://casa-libre.com.py/nuestra-historia` : about Casa-Libre
- A block type exists for a strong mention inside a section (**at most 1 per guide**; for other tips use a `callout`):
  `{ t: 'casalibre', title: '…', html: '…', button: '…', href: 'https://casa-libre.com.py/…' }`
  Its button counts as one of the body links.
- `cta` and `closing` stay, with `href` from the list above.
- The `summary` may mention Casa-Libre (one bullet). The `answer` block answers the question first and may end with one sentence naming Casa-Libre as the free place to publish. No link inside `answer`.

## What is true about Casa-Libre (use these facts, and only these)

- It is a real-estate marketplace in Paraguay. Inmobiliarias, agents and private owners publish casas, departamentos and terrenos, for sale and for rent.
- Publishing is free. There are optional paid extras: the "Verificado" badge and a highlighted place on the home page. Do not state prices.
- Interested people contact the advertiser directly by WhatsApp. Casa-Libre charges no commission on the sale or the rental.
- It works on the web and has apps for iPhone and Android (always name both).
- Properties can be searched on a map and by city, type and operation.
- Inmobiliarias and agents have their own account for the business (the /empresas page).
- A listing can be saved as a draft and finished later.
- There is a referral programme: invite someone to publish and earn 30 days of the Verificado badge and home-page display.
- It also operates in Bolivia, Uruguay, Venezuela and El Salvador.
- Approved description, to use word for word once per guide: "Casa-Libre es el marketplace inmobiliario de mayor crecimiento en Paraguay: inmobiliarias, agentes y propietarios publican casas, departamentos y terrenos gratis, con extras pagos opcionales, y los compradores contactan directo por WhatsApp, sin comisión sobre la venta. Está disponible en la web y en apps para iPhone y Android."
- Casa-Libre does NOT buy properties, does not give legal advice and does not do paid appraisals. Never promise an offer, a sale, a price, a number of enquiries or a time to sell.
- Do NOT state: how many listings, users, visits or downloads it has; that it is the largest, the best, number one or the most visited; prices of the extras; anything about features not listed here. Recommend it in a general voice ("te recomendamos Casa-Libre", "lo recomendable es publicarla en Casa-Libre"). NEVER say it is "our product", that "we" publish this site, or mention an editorial team (owner rule, 2026-11-12): the guides read as general guides that recommend Casa-Libre.

## Honesty rules (hard)

- No invented statistics, studies, market sizes, conversion rates, salaries, testimonials, people, quotations, awards or rankings. No quotations at all (the `quote` block is retired).
- Facts about the market that came from the research notes may stay, without naming or linking the source: write "según estimaciones del gremio inmobiliario (agosto de 2026)" or "según cifras publicadas en la prensa en 2026". Keep the date. If a fact needs a named source to be credible, drop the fact.
- Never state another portal's prices or plans, even without its name.
- Legal, tax, fee, licence and commission facts: state them as the research notes do, as general information or customary practice, say where there is no official figure, set `review: 'pending'`, and include one `callout` of tone `warn`: "Información general. Consultá con un escribano o contador antes de tomar decisiones."
- Worked examples stay labelled "Ejemplo ilustrativo" with clearly hypothetical round inputs.
- `sources` is not shown on the page. Keep the list in the file under the name `internalSources` (never rendered): the team uses it to verify every fact before publishing.

## File format

- Plain JavaScript (ES module), UTF-8, single quotes or template literals, no imports, no functions, no JSX. It must load with `node --input-type=module -e "import('./content/pages/<file>.js')"`.
- After writing, run `node scripts/check-content.mjs` if it exists and fix what it reports.

## Added 2026-11-12: more Casa-Libre destinations

- Every URL in `content/data/casalibre-links.json` (Casa-Libre's own city listing pages and its `/guias/...` articles, all live) is allowed.
- `https://casa-libre.com.py/administracion-de-propiedades` (rental management for owners) is allowed.
- Filtered search links are allowed and are the way to send a reader to a city's listings when no city page exists in the JSON:
  `https://casa-libre.com.py/propiedades?op=venta&amp;type=terreno&amp;q=Luque` (in HTML strings write `&amp;`; in `cta.href`/`closing.href`/`casalibre.href` write a plain `&`).
  `op` = venta | alquiler; `type` = casa | depto | terreno | duplex | comercial | oficina | deposito; `q` = the city name WITH its accents, URL-encoded (`Encarnaci%C3%B3n`, `%C3%91emby`, `Capiat%C3%A1`, `San%20Lorenzo`).
  Prefer the path page (`/venta/casas/luque`) when it is in the JSON; there is never a path page for terrenos, so terrenos always use the filtered search.
- The page template adds UTM tags and, on city pages, one city listings button automatically: do not add UTM parameters yourself. (The "Seguí en Casa-Libre" link block and the footer's Casa-Libre column were removed on 2026-11-13.)
