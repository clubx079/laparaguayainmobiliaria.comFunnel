'use client';
// PostHog for this site, in the SAME PostHog project as the Casa-Libre sites (manual $pageview, $pageleave,
// autocapture, identified-only persons).
//
// Every event carries funnel_site / funnel_country / funnel_page / funnel_domain (registered super properties):
//   funnel_site    the kind of site (lib/site.js funnelSite)
//   funnel_domain  the site's real domain
// We never register site_country: the Casa-Libre admin counts its own country sites by $host + site_country, and
// this traffic must not be counted as a Casa-Libre site.
//
// Also keeps the visit's first-touch attribution (utm_* + referrer) in sessionStorage so the lead form can send it
// with the lead. That part works with or without PostHog.
import posthog from 'posthog-js';

// The PostHog key and host come from the server's env (POSTHOG_KEY, POSTHOG_HOST), read at request time by
// /api/analytics-config/ (app/api/analytics-config/route.js). Nothing is written in the code, and it works even when
// the hosting platform's build does not pass NEXT_PUBLIC_* variables. No key in the env = no tracking.
let config = null;      // { key, host } once loaded
let loading = null;
function loadConfig() {
  if (!loading) {
    loading = fetch('/api/analytics-config/', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : {}))
      .then((j) => { config = { key: String(j.key || ''), host: String(j.host || '') }; return config; })
      .catch(() => { config = { key: '', host: '' }; return config; });
  }
  return loading;
}

const PREFIXES = ['bolivia', 'uruguay', 'venezuela', 'el-salvador'];

/** '/bolivia/x/' -> 'x', '/' -> 'home', '/guias/' -> 'guias'. */
export function slugOf(pathname) {
  const parts = String(pathname || '/').split('/').filter(Boolean);
  if (PREFIXES.includes(parts[0])) parts.shift();
  return parts.join('/') || 'home';
}

const queued = [];
// Local work (localhost, 127.0.0.1, LAN addresses) never reaches PostHog: only real hosts are measured.
const isLocal = () => /^(localhost|127\.|10\.|192\.168\.|\[::1\])/.test(window.location.hostname);
const allowed = () => typeof window !== 'undefined' && !isLocal();
const on = () => allowed() && (config === null || !!config.key);   // before the config arrives, events wait in the queue

/** Send to PostHog now, or right after init when it hasn't started yet. Never throws. */
export function capture(event, props = {}) {
  if (!on()) return;
  if (!posthog.__loaded) { if (queued.length < 50) queued.push([event, props]); return; }
  try { posthog.capture(event, props); } catch { /* analytics must never break the page */ }
}

/** Starts PostHog once and stamps the funnel super properties. meta = { site, domain, cc }. */
export async function initAnalytics(meta, pathname) {
  if (!allowed()) return;
  const c = await loadConfig();
  if (!c.key) { queued.length = 0; return; }
  if (!posthog.__loaded) {
    try {
      posthog.init(c.key, {
        api_host: c.host || 'https://us.i.posthog.com',
        capture_pageview: false, // sent by hand on each route change
        capture_pageleave: true,
        persistence: 'localStorage+cookie',
        person_profiles: 'identified_only',
      });
    } catch { return; }
  }
  setPage(meta, pathname);
  for (const [e, p] of queued.splice(0)) { try { posthog.capture(e, p); } catch { /* ignore */ } }
}

/** Updates funnel_page (and country) when the visitor moves to another page. */
export function setPage(meta, pathname) {
  if (!on() || !posthog.__loaded) return;
  try {
    posthog.register({ funnel_site: meta.site, funnel_country: meta.cc, funnel_page: slugOf(pathname), funnel_domain: meta.domain });
  } catch { /* ignore */ }
}

/** PostHog's anonymous id of this visitor, or ''. */
export function distinctId() {
  try { return on() && posthog.__loaded ? String(posthog.get_distinct_id() || '') : ''; } catch { return ''; }
}

// ---- first-touch attribution (utm_* + referrer), kept for the browser session ----
const ATTR_KEY = 'funnel_attr';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

/** Saves the landing page's utm_* and document.referrer the first time in this session. */
export function keepAttribution() {
  try {
    if (sessionStorage.getItem(ATTR_KEY)) return;
    const q = new URLSearchParams(window.location.search);
    const utm = {};
    for (const k of UTM_KEYS) { const v = q.get(k); if (v) utm[k] = v.slice(0, 200); }
    sessionStorage.setItem(ATTR_KEY, JSON.stringify({ utm, referrer: String(document.referrer || '').slice(0, 500) }));
  } catch { /* storage blocked: the lead is sent without attribution */ }
}

/** { utm, referrer } saved by keepAttribution, or empty values. */
export function getAttribution() {
  try {
    keepAttribution();
    const a = JSON.parse(sessionStorage.getItem(ATTR_KEY) || '{}');
    return { utm: a.utm || {}, referrer: a.referrer || '' };
  } catch { return { utm: {}, referrer: '' }; }
}
