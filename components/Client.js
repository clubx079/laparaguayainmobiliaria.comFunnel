'use client';
// The small client-side pieces every page carries: PostHog + attribution, Casa-Libre click tracking.
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initAnalytics, setPage, capture, keepAttribution } from '@/lib/analytics';

function Pageviews({ site, domain, cc }) {
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    setPage({ site, domain, cc }, pathname);
    const qs = search?.toString();
    capture('$pageview', { $current_url: window.location.origin + pathname + (qs ? `?${qs}` : '') });
  }, [site, domain, cc, pathname, search]);
  return null;
}

/** meta = { site: 'owners' | 'owners2' | 'agents' | 'library', domain, cc }. Renders nothing. */
export function Analytics({ site, domain, cc }) {
  useEffect(() => {
    keepAttribution();
    initAnalytics({ site, domain, cc }, window.location.pathname);
  }, [site, domain, cc]);
  return <Suspense fallback={null}><Pageviews site={site} domain={domain} cc={cc} /></Suspense>;
}

/** One dataLayer event and one PostHog cl_click per click on a link to Casa-Libre, with where the link sits. No personal data. */
export function Track() {
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || !/^https?:\/\/([a-z0-9-]+\.)?casa-libre\./i.test(a.href)) return;
      const pos = a.closest('[data-pos]');
      const position = pos ? pos.getAttribute('data-pos') : 'other';
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'casalibre_click', link_position: position, link_url: a.href, page_path: window.location.pathname });
      let utmContent = '';
      try { utmContent = new URL(a.href).searchParams.get('utm_content') || ''; } catch { /* ignore */ }
      capture('cl_click', { href: a.href, utm_content: utmContent, position });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
