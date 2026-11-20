// POST /api/seo/publish (Bearer SEO_PUBLISH_SECRET), body { paths: ['/slug/', …] }: the Casa-Libre admin calls it
// after a pipeline run. Drops the cached AI SEO feed (tag 'seo': every page that read it regenerates on its next
// visit) and revalidates the given paths, every /guias/ index, /sitemap.xml and /llms.txt.  -> { ok: true }
import { revalidatePath, revalidateTag } from 'next/cache';
import { SITE as site } from '@/lib/site';
import { sitePath } from '@/lib/content';
import { internalPath } from '@/lib/seoFeedClean';
import { SEO_TAG } from '@/lib/seoFeed';
import { authorized, unauthorized } from '@/lib/seoAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!authorized(request)) return unauthorized();
  let body = {};
  try { body = await request.json(); } catch { body = {}; }
  const given = (Array.isArray(body?.paths) ? body.paths.slice(0, 200) : []).map(internalPath).filter(Boolean).map((p) => p.split('#')[0]);
  const paths = new Set(given);
  for (const cc of site.countries) paths.add(sitePath(cc, 'guias'));
  revalidateTag(SEO_TAG);
  // trailingSlash is on: Next tags a cached page with its path WITH the slash ('/guias/', '/sitemap.xml/'), so both
  // spellings are revalidated.
  for (const p of [...paths, '/sitemap.xml', '/llms.txt']) {
    const bare = p === '/' ? '/' : p.replace(/\/$/, '');
    revalidatePath(bare);
    if (bare !== '/') revalidatePath(`${bare}/`);
  }
  return Response.json({ ok: true, revalidated: [...paths, '/sitemap.xml', '/llms.txt'] }, { headers: { 'cache-control': 'no-store' } });
}
