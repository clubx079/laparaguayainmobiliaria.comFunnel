// Only the real domain may be indexed. Any other host (localhost, previews, temporary hosts) is always noindex,
// so a preview can never end up in a search engine.
import { NextResponse } from 'next/server';
import { isProductionHost } from './lib/site.js';

export function middleware(request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const res = NextResponse.next();
  if (!isProductionHost(host)) res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = {
  matcher: ['/((?!api/|_next/|.*\\.(?:svg|png|jpg|jpeg|webp|ico|woff2?)$).*)'],
};
