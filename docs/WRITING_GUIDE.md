# Writing guide

Read this whole file first. Then read `docs/SCHEMA.md` (block types, honesty rules, the facts about Casa-Libre).
Where this file and those disagree, THIS file wins.

## This site

laparaguayainmobiliaria.com: Biblioteca de guías para comprar y alquilar en Paraguay: alquileres por ciudad, casas y terrenos a cuotas, costos y mudarse al país. No es una inmobiliaria. Reader: personas que buscan comprar o alquilar en Paraguay, o que se mudan al país. Paraguay, voseo, casa-libre.com.py. One file per article: `content/pages/<slug>.js` (`home.js` = the home page, slug `''`).

## The most important rule: write the way locals type and talk

Roland (CEO) asked for this by name. The site's whole job is to match what a person in Paraguay or Bolivia really
types into Google or asks ChatGPT, and then to read as if a local wrote it.

1. **H1 and `title` use the searched phrase exactly as people type it** (the phrase given in your assignment). Do not
   "improve" it into formal Spanish. "Vendo terreno urgente", "Pieza en alquiler", "Casas a cuotas sin entrega
   inicial", "Garzonier: qué es" are right. You may add a short second half after a colon.
2. **Check the phrase and the FAQ questions with Google autocomplete for the country** before writing:
   `python scripts/autocomplete.py py "vendo terreno urgente" "sucesion paraguay"` (or `bo`). It prints what Google
   suggests in that country. Use the suggestions that fit as H2s and FAQ questions (people's own words). Save what you
   found in the file's `keyword` field. If autocomplete shows people phrase it another way, use THEIR wording in an H2
   or a FAQ question, and say so in your report.
3. **Paraguay (voseo)**: body copy, buttons and calls to action use vos: tenés, podés, querés, mirá, pedí, fijate,
   publicá, escribí, andá, hacé. Never tú forms (tienes, puedes, mira) and never usted. Titles, H1 and H2 stay in the
   neutral searched forms ("cómo vender", "cuánto cuesta", "vendo casa", "quiero vender"): nobody types voseo into Google.
   Local words: escribano / escribanía (never notario), departamento or depto (never apartamento, piso), alquiler
   (never renta, arriendo), terreno (lote only in "lotes a cuotas", "loteamiento"), pieza (a rented room),
   monoambiente, dúplex, quinta / casa quinta, barrio cerrado, salón comercial, tinglado, garantía, expensas,
   guaraníes ("Gs. 2.500.000", "2,5 millones"), entrega inicial, cuotas, título, cédula, ANDE, ESSAP, la muni
   (write "la municipalidad"), Gran Asunción, Central, "el interior", ruta, km. Asunción zones as locals say them:
   Villa Morra, Carmelitas, Recoleta, Las Mercedes, Sajonia, Trinidad, Barrio Jara, el centro, el microcentro.
   Paraguayan turns that read natural in copy: "al contado", "a cuotas", "al día", "a nombre de", "trámite",
   "hacer los papeles", "plata" (informal, sparingly), "conviene", "sale" (cuánto sale).
4. **Bolivia (tú)**: tienes, puedes, quieres, mira, pide, publica, escribe. Usted only in legal or formal notes.
   Local words: anticrético / anticresista, alquiler (never renta, arriendo), departamento, garzonier, cuarto
   (a rented room), lote or terreno, urbanización, condominio, casa, Derechos Reales (DDRR), folio real, alodial,
   información rápida, minuta, notario de fe pública, testimonio, catastro, gobierno municipal / alcaldía, bolivianos
   ("Bs 2.500") and dólares ("USD 500", "$us 500" is how locals write it: use it once where natural), zona (Zona Sur,
   Zona Norte, Equipetrol, Sopocachi, Miraflores, Cala Cala, Queru Queru), anillo (Santa Cruz: "entre 3er y 4to
   anillo"), "trato directo con el dueño", "sin intermediarios", "por ocasión", "en dólares o en bolivianos".
   Always mention the gap between the official and the parallel exchange rate only as "el tipo de cambio que acuerden".
5. **Sound like a neighbour who knows the subject, not a brochure.** Short sentences. Concrete. Say what to do first.
   No filler openings ("En el mundo actual…"), no hype, no "sin duda", no em dashes (use commas, colons, full stops).
   Explain every legal word the first time in plain words.
6. Write accents correctly (Asunción, Encarnación, Ñemby, Potosí). Thousands separator is a dot.

## File shape (plain ES module, no imports, no functions)

```js
export default {
  slug: 'vendo-terreno-urgente',            // '' in home.js
  title: 'Vendo terreno urgente: cómo venderlo rápido sin regalarlo', // <title>, 50 to 62 characters, searched phrase first
  h1: 'Vendo terreno urgente: cómo venderlo rápido sin regalarlo',   // same as title (or its first part)
  description: '…',                          // meta description, 140 to 160 characters
  navLabel: 'Terreno urgente',               // 2 to 3 words, for menus
  blurb: '…',                                // one sentence, max 140 characters, for lists and llms.txt
  group: 'Vender con apuro',                 // one of the site's groups (see your assignment)
  order: 10,                                 // position inside the group
  keyword: { phrase: 'vendo terreno urgente', evidence: 'autocomplete gl=py 2026-11-15: "vendo terreno urgente por viaje", …' },
  published: '2026-11-16',
  updated: '2026-11-16',
  review: 'pending',                         // 'pending' when the page states legal, tax, fee or procedure facts; else 'none'
  reviewNote: '…',                           // when pending: what a local professional must check (English, 1 to 2 sentences)
  answer: '…',                               // "Respuesta breve": 60 to 110 words that answer the question outright and can be quoted
                                             // on their own. Names the country. Does NOT mention Casa-Libre. No link.
  summary: ['…'],                            // "Puntos clave": 4 to 6 short facts, concrete. At most one may mention Casa-Libre. No links.
  flow: ['Tu terreno', 'Papeles al día', 'Precio realista', 'Aviso publicado', 'Escritura'], // 4 or 5 stages of the process, max 3 words each (drawn as a diagram). Omit if the topic is not a process.
  cta: { title: '…', text: '…', button: '…', href: 'https://casa-libre.com.py/…' },      // shown mid-article as "Elección editorial"
  sections: [ { id: 'kebab-id', h2: '…', blocks: [ /* blocks */ ] } ],  // 5 to 7 sections
  faq: [ { q: '¿…?', a: '…' } ],             // 4 to 6, questions as people type them (use the autocomplete wording)
  sources: [ { label: 'Código Civil paraguayo (Ley 1183/85), Libro V: sucesiones', detail: 'Reglas sobre herederos y partición.' } ],
                                             // SHOWN on the page under "Fuentes". Laws by name and number, public bodies,
                                             // "Avisos publicados en Casa-Libre (consulta del 12 de noviembre de 2026)". Plain text only:
                                             // NO URLs, NO other websites, portals, newspapers or companies. 2 to 5 items.
  internalSources: [ { label: '…', url: 'https://…', date: '2026-11-15', note: '…' } ], // NOT shown: where you checked each fact
  closing: { title: '…', text: '…', button: '…', href: 'https://casa-libre.com.py/…' },
  related: ['otro-slug', 'otro-slug-2', ''], // 3 slugs of OTHER guides of the SAME site ('' = its home)
};
```

Blocks: exactly the ones in `docs/SCHEMA.md` (`p`, `h3`, `ul`, `ol`, `steps`, `table`, `callout`,
`example`, `casalibre`). Inline HTML in `html` fields: only `<strong>`, `<em>`, `<a href="…">`.

## Page rules

- 900 to 1,400 words of body. Each `h2` is a sub-question; its first block is a `p` of 1 to 3 sentences that answers it.
- At least one `table` in the first two sections. One worked `example` with round, clearly hypothetical numbers where
  the topic allows (label "Ejemplo ilustrativo").
- The home page (`home.js`) is longer (1,300 to 1,800 words), 7 to 9 sections, and works as the main guide of the
  site: it answers the site's main question and points to the other guides of the site with internal links.
- Internal links: 2 to 5 per guide, to other guides of the SAME site, as `/slug/` (your assignment lists the slugs).
  Never link to another of our sites.
- **Casa-Libre links: 2 to 4 in the body** (inline anchors plus the button of the single optional `casalibre` block),
  plus `cta.href` and `closing.href`. Never in `answer` or `summary`. Anchor text: the brand alone
  (`<a href="…">Casa-Libre</a>`) or a plain phrase ("ver departamentos en alquiler en Casa-Libre"). The template adds
  UTM tags: do not add them.
- Allowed Casa-Libre URLs: Paraguay: the list in `docs/SCHEMA.md` + every URL in
  `content/data/casalibre-links.json` + the filtered search
  (`https://casa-libre.com.py/propiedades?op=alquiler&amp;type=depto&amp;q=Asunci%C3%B3n`; in `cta/closing/casalibre.href`
  write a plain `&`). Bolivia: the paths listed for `bo` in `lib/countries.js` (`clPaths`, `clCityPaths`)
  and in `docs/COUNTRY_GUIDE.md`, plus `casa_libre_pages` in `content/data/bo-market.json`, on
  `https://casa-libre.com.bo`.
- **No other website, portal, company, franchise, bank, developer, newspaper or app is named or linked.** Speak of them
  by type ("otros portales", "los clasificados", "las redes sociales", "los bancos", "las cooperativas", "una
  desarrolladora"). Allowed names: WhatsApp, iPhone, Android, and public bodies and programmes a reader must deal with
  (Catastro, Registro Público, municipalidad, DNIT, INDERT, Poder Judicial, Migraciones, MUVH, AFD, ANDE, ESSAP;
  Derechos Reales, ASFI, gobierno municipal, Agencia Estatal de Vivienda), in plain text, never linked.
- Brand: always "Casa-Libre" with the hyphen. When you mention the app, say "apps para iPhone y Android".
- What is true about Casa-Libre: only the facts in `docs/SCHEMA.md` ("What is true about Casa-Libre").
  For buyers and renters: you search by city, type and operation, and on a map; you contact the advertiser directly
  by WhatsApp; searching is free; Casa-Libre does not charge the buyer or renter a commission; it does not sell,
  rent or broker property itself and does not verify every advertiser, so the reader must check papers themselves.
  Never state how many listings, users or visits it has.
- Honesty: no invented statistics, prices, testimonials, people or rankings. Legal, tax, fee and procedure facts are
  stated as general information; check them (you may search the web), keep where you checked in `internalSources`,
  set `review: 'pending'`, and include one `callout` of tone `warn` ("Información general. Consultá con un abogado o
  escribano antes de decidir." / Bolivia: "Información general. Consulta con un abogado o notario de fe pública antes
  de decidir."). When you cannot confirm a figure, say there is no official figure rather than guess.
- Market figures: only from `content/data/py-market.json` / `bo-market.json` (asking prices of listings published on
  Casa-Libre, snapshot date inside the file). Say "precio de publicación", give the snapshot date, say it is not a
  closing price, and never give listing counts. See how `content/pages/alquiler-de-casas-en-luque.js` and
  `content/pages/alquiler-de-casas-en-cochabamba.js` word it. A city without data in the JSON gets no price figures.
- Do not repeat a topic that already lives on another of our sites. Your assignment lists the angle to keep and the
  neighbouring pages to stay away from.

## Before you finish

1. `node scripts/check-content.mjs` must print no errors for your files (it loads every file and checks the rules above).
2. Re-read each article once as a local reader: would a Paraguayan / Bolivian write it this way? Fix anything that
   sounds translated.
3. Report: the files written, the autocomplete evidence per article in one line each, any phrase where locals word it
   differently from your assignment, and every fact you could not confirm.
