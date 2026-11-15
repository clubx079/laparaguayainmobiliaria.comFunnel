// GET /api/analytics-config/ → { key, host }: the PostHog project key and ingestion host from this server's env.
// Read at request time (never baked into the build), so the key lives only in the deployment's env:
//   POSTHOG_KEY   the project's client key (phc_…)
//   POSTHOG_HOST  the ingestion host, default https://us.i.posthog.com
export const dynamic = 'force-dynamic';

export function GET() {
  const env = process.env;
  const key = env['POSTHOG_KEY'] || '';
  const host = env['POSTHOG_HOST'] || 'https://us.i.posthog.com';
  return Response.json({ key, host }, { headers: { 'cache-control': 'public, max-age=300' } });
}
