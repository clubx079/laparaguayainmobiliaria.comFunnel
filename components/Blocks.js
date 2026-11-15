// Renders the content blocks of a guide as plain, server-side HTML (see content/WRITING_GUIDE.md).
const H = ({ as: Tag = 'span', html, ...rest }) => <Tag {...rest} dangerouslySetInnerHTML={{ __html: html || '' }} />;

function Table({ b, id }) {
  const cols = (b.head || b.rows?.[0] || []).length;
  return (
    <div className="tbl" data-cols={cols}>
      {b.caption ? <p className="tbl-cap" id={id}>{b.caption}</p> : null}
      <div className="tbl-wrap" tabIndex={0} role="region" aria-label={b.caption || 'Tabla'}>
        <table>
          {b.head?.length ? (
            <thead><tr>{b.head.map((h, i) => <H as="th" scope="col" key={i} html={h} />)}</tr></thead>
          ) : null}
          <tbody>
            {b.rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (j === 0 ? <H as="th" scope="row" key={j} html={c} /> : <H as="td" key={j} html={c} />))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {b.note ? <H as="p" className="tbl-note" html={b.note} /> : null}
    </div>
  );
}

const TONE_LABEL = { tip: 'Consejo', warn: 'Importante', fact: 'Dato' };

export function Block({ b, k }) {
  switch (b.t) {
    case 'p': return <H as="p" html={b.html} />;
    case 'h3': return <h3>{b.text}</h3>;
    case 'ul': return <ul className="checks">{b.items.map((it, i) => <H as="li" key={i} html={it} />)}</ul>;
    case 'ol': return <ol>{b.items.map((it, i) => <H as="li" key={i} html={it} />)}</ol>;
    case 'steps':
      return (
        <ol className="steps">
          {b.items.map((it, i) => (
            <li key={i}><p className="step-title">{it.title}</p><H as="p" className="step-body" html={it.html} /></li>
          ))}
        </ol>
      );
    case 'table': return <Table b={b} id={`t-${k}`} />;
    case 'callout':
      return (
        <div className={`callout callout-${b.tone || 'tip'}`} role="note">
          <p className="callout-kicker">{TONE_LABEL[b.tone] || 'Nota'}</p>
          {b.title && b.title !== TONE_LABEL[b.tone] ? <p className="callout-title">{b.title}</p> : null}
          <H as="p" html={b.html} />
        </div>
      );
    case 'example':
      return (
        <div className="callout callout-fact example" role="note">
          <p className="callout-kicker">Ejemplo</p>
          <p className="callout-title">{b.title}</p>
          {b.html ? <H as="p" html={b.html} /> : null}
          {b.rows?.length ? (
            <div className="tbl-wrap"><table className="example-rows"><tbody>
              {b.rows.map((r, i) => (
                <tr key={i}><H as="th" scope="row" html={r[0]} />{r.slice(1).map((c, j) => <H as="td" key={j} html={c} />)}</tr>
              ))}
            </tbody></table></div>
          ) : null}
        </div>
      );
    case 'casalibre':
      return (
        <div className="offer-inline" role="note" data-pos="block">
          <p className="offer-kicker">Elección editorial</p>
          <p className="offer-title">{b.title}</p>
          <H as="p" className="offer-text" html={b.html} />
          <p className="offer-action"><a className="offer-link" href={b.href}>{b.button} <span aria-hidden="true">↗</span></a></p>
        </div>
      );
    default: return null;
  }
}

export function Blocks({ blocks, k = 's' }) {
  return (blocks || []).map((b, i) => <Block b={b} key={i} k={`${k}-${i}`} />);
}
