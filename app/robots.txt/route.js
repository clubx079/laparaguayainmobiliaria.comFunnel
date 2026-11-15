import { isProductionHost, siteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic'; // the answer depends on the host name

// Search crawlers and the assistants' search and user-triggered fetchers are all welcome on the real domain.
// On any other host (localhost, previews, temporary hosts) the whole site is closed, so it is never indexed by accident.
const BOTS = [
  'Googlebot', 'Bingbot', 'Google-Extended', 'OAI-SearchBot', 'ChatGPT-User', 'GPTBot',
  'PerplexityBot', 'Perplexity-User', 'Claude-SearchBot', 'Claude-User', 'ClaudeBot',
  'Applebot', 'Applebot-Extended', 'meta-externalagent', 'CCBot', 'DuckAssistBot', 'MistralAI-User',
];

export async function GET(request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  let body;
  if (!isProductionHost(host)) {
    body = 'User-agent: *\nDisallow: /\n';
  } else {
    body = [
      ...BOTS.map((b) => `User-agent: ${b}`), 'Allow: /', 'Disallow: /api/', '',
      'User-agent: *', 'Allow: /', 'Disallow: /api/', '',
      `Sitemap: ${siteUrl()}/sitemap.xml`, '',
    ].join('\n');
  }
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
