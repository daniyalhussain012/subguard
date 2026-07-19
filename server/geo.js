'use strict';

// Best-effort country for a request, used only for the admin signup list.
//
// Render fronts services with Cloudflare, which stamps `cf-ipcountry` on the
// forwarded request — accurate and free, so it's the first choice. The other
// header names cover us if the hosting edge ever changes. As a last resort we
// accept a hint the frontend computes from the browser's own locale/timezone
// (`x-client-region`), which is all we get when no edge header is present.
//
// Deliberately never does an IP lookup against a third-party geo API: that
// would ship user IPs off to another vendor for a nice-to-have admin column.

const EDGE_HEADERS = [
  'cf-ipcountry',            // Cloudflare (Render's edge)
  'x-vercel-ip-country',     // Vercel
  'x-appengine-country',     // Google
  'x-geo-country',
];

// Cloudflare uses these for traffic it can't place (Tor, internal probes).
const UNKNOWN = new Set(['XX', 'T1', 'ZZ']);

function countryFromRequest(req) {
  for (const h of EDGE_HEADERS) {
    const v = (req.headers[h] || '').toString().trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(v) && !UNKNOWN.has(v)) return v;
  }
  const hint = (req.headers['x-client-region'] || '').toString().trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(hint) && !UNKNOWN.has(hint)) return hint;
  return '';
}

// The browser's IANA timezone (e.g. "Asia/Karachi"). Kept alongside country
// because it survives VPNs better and is a useful tiebreaker in the admin list.
function timezoneFromRequest(req) {
  const tz = (req.headers['x-client-tz'] || '').toString().trim();
  return /^[A-Za-z_+-]+\/[A-Za-z_+\-/]+$/.test(tz) ? tz.slice(0, 64) : '';
}

module.exports = { countryFromRequest, timezoneFromRequest };
