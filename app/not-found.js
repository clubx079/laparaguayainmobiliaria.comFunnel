import Link from 'next/link';

// Shown for any address that is not a page of the site.
export default function NotFound() {
  return (
    <div className="site">
      <main className="main">
        <div className="grid grid-plain">
          <article className="article">
            <p className="kicker">Error 404</p>
            <h1>No encontramos esa página</h1>
            <div className="answer"><p className="answer-text">Puede que la dirección haya cambiado. Todas las guías están en el índice.</p></div>
            <p className="paths"><Link href="/guias/">Todas las guías</Link><Link href="/">Inicio</Link></p>
          </article>
        </div>
      </main>
    </div>
  );
}
