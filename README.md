# SubGuard — Stop Getting Charged for Things You Forgot About

Free, privacy-first subscription tracker that runs entirely in your browser. No account required.

## Features

- **Automatic detection** — Connect Gmail or Outlook to scan your inbox for subscriptions
- **Renewal Radar** — See every upcoming charge before it hits your card, with push notifications
- **Smart Scanner** — Paste receipt text or upload screenshots; OCR extracts the details
- **Price Compare** — Check if you're overpaying against fair market rates for 55+ services
- **Cancellation Center** — Step-by-step cancellation guides for 76+ services
- **Household Hub** — Track which family members use which subscriptions, split costs
- **Savings Victory Board** — Celebrate every subscription you cancel
- **PWA** — Install to your home screen, works offline

## Tech Stack

- React 18 + Vite 5
- Tailwind CSS 3
- Framer Motion (animations)
- Recharts (charts)
- Tesseract.js (OCR for receipt images)
- Express.js backend (optional, for Gmail/Outlook scanning)
- Google Gmail API + Microsoft Graph API

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Email Scanning Setup (Optional)

The email scanning feature requires OAuth credentials. See [SETUP_EMAIL.md](SETUP_EMAIL.md) for step-by-step instructions for Gmail and Outlook.

Once configured:

```bash
npm run dev:all   # Runs frontend + email backend together
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/⌘ + N` | New subscription |
| `Ctrl/⌘ + S` | Smart Scanner |
| `Ctrl/⌘ + R` | Renewal Radar |
| `Ctrl/⌘ + H` | Home |

## Privacy

- All data stored in **localStorage** — nothing leaves your browser
- Email scanning uses OAuth read-only access; email content is never stored
- No analytics, no tracking, no accounts
