'use strict';

// Abuse protection for the auth surface. The real threats for a small app
// aren't volumetric DDoS (Render/Vercel absorb that) but cheap scripted abuse:
//   • signup / magic-link floods that burn the Resend email quota and can get
//     the sending domain flagged as spammy,
//   • email-bombing a victim by scripting the link endpoints with their address,
//   • password brute-force / credential stuffing on login.
//
// Limits are keyed per client IP (needs `trust proxy` set — see index.js) and
// deliberately generous: a legit user authenticates rarely (token lasts 30
// days) and fat-fingers a password a handful of times, so these ceilings stay
// far above real use while stopping a bot cold. Carrier CGNAT can put many
// phones behind one IP, which is why the auth ceiling isn't tighter.

const rateLimit = require('express-rate-limit');

const json = (res, msg) => res.status(429).json({ error: msg });

// Endpoints that send an email on each call — the most abuse-sensitive, since
// each hit costs real email quota. Tightest ceiling.
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => json(res, 'Too many email requests from this network. Please wait a while and try again.'),
});

// Password login — brute-force / credential-stuffing guard. Tolerant of typos
// and shared IPs, but well below what a cracking script needs.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => json(res, 'Too many sign-in attempts. Please wait a few minutes and try again.'),
});

// Token-redemption endpoints (verify / exchange). Guessing a signed JWT is
// infeasible, so this is purely a flood cap, hence roomy.
const tokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => json(res, 'Too many requests. Please wait a moment and try again.'),
});

// Broad backstop for everything else. High enough that a single active user —
// or several sharing a CGNAT IP — never trips it, low enough to blunt a flood.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => json(res, 'Too many requests. Please slow down and try again shortly.'),
});

module.exports = { emailLimiter, loginLimiter, tokenLimiter, globalLimiter };
