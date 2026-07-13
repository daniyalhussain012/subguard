# RenewBell — Never Miss a Renewal Again

Subscription tracker & reminder PWA. Track every recurring charge, get notified before renewals hit your card, and find step-by-step cancellation guides.

**Live app:** https://subguard-five.vercel.app

## Features

- **Renewal reminders** — push notifications 7/2/1 days before each charge, even when the app is closed
- **Billing calendar** — every upcoming charge projected across future months
- **Smart Scanner** — paste receipt text or upload screenshots/PDFs; OCR extracts the details in your browser
- **Email scanning** (Pro) — connect Gmail or Outlook to auto-detect subscriptions from receipts
- **Money Leaks Detective** — spot zombie charges, price creep, and forgotten trials
- **Price Compare** — check against fair market rates for 55+ services
- **Cancellation Center** — step-by-step cancellation guides for 76+ services
- **Household Hub** — track who uses what, split costs
- **PWA** — install to your home screen, works offline

## Pricing

Free tier: up to 5 subscriptions. **Pro: $10 one-time** for 3 years — unlimited subscriptions, email scanning, and all premium features.

## Tech Stack

- React 18 + Vite + Tailwind CSS + Framer Motion
- Tesseract.js (client-side OCR) + pdf.js
- Express + MongoDB Atlas backend (auth, push notifications, subscription sync, Stripe billing)
- Google OAuth sign-in · Web Push (VAPID) · Stripe Checkout

## Development

```bash
npm install
npm run dev        # frontend on http://localhost:5173
npm run dev:all    # frontend + API backend together
```

The backend (`/server`) needs a `.env` — see [SETUP_EMAIL.md](SETUP_EMAIL.md) for the email-scanning OAuth credentials.

## Privacy

- Sign-in via Google OAuth; subscription data syncs to the server only to power push reminders
- Email scanning is read-only and stores only detected subscription details (service, price, date) — never email content
- Full policy: [/privacy](https://subguard-five.vercel.app/privacy) · in-app account deletion under Settings → Danger Zone
