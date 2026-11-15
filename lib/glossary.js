// "Glosario": the words a reader meets in these guides, in plain language. The terms live in lib/data/glossary.js,
// one list per country this site covers. Definitions are general information: no figures, no fees.
import { GLOSSARY } from './data/glossary.js';

export function glossaryFor(cc) {
  const g = GLOSSARY[cc];
  if (!g) return null;
  return { intro: g.intro, terms: g.terms.map(([term, def]) => ({ term, def })).sort((a, b) => a.term.localeCompare(b.term, 'es')) };
}
