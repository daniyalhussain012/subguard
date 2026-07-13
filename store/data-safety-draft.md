# RenewBell — Play Console Data Safety Form (Draft Answers)

Play Console → App content → Data safety. Answer each section as below.
These answers match what the app ACTUALLY does as of 2026-07-13 — if features
change (especially payments or analytics), update the form.

## Overview questions

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (HTTPS everywhere) |
| Do you provide a way for users to request that their data is deleted? | **Yes** — in-app: Settings → Danger Zone → Delete My Account (removes account, subscriptions, push registration from servers). Web info: https://renewbell.vercel.app/privacy |

## Data types — declare these as COLLECTED

### 1. Personal info → Name
- Collected: Yes | Shared: No
- Processed ephemerally: No
- Required or optional: **Required** (comes with Google sign-in)
- Purposes: **Account management**

### 2. Personal info → Email address
- Collected: Yes | Shared: No
- Processed ephemerally: No
- Required or optional: **Required** (Google sign-in identity)
- Purposes: **Account management, App functionality**

### 3. Financial info → Other financial info
- What it is: subscription names, prices, and billing dates the user enters (synced to our server to power renewal reminders)
- Collected: Yes | Shared: No
- Processed ephemerally: No
- Required or optional: **Optional** (user chooses what to enter)
- Purposes: **App functionality**

### 4. Messages → Emails (ONLY because of optional inbox scanning)
- What it is: with explicit user consent (OAuth), the app reads email metadata/previews to detect subscription receipts; only detected subscription details (service, price, date) are stored — email content is not retained
- Collected: Yes | Shared: No
- Processed ephemerally: **Yes** (email content is processed transiently; only extracted subscription details persist)
- Required or optional: **Optional** (Pro feature, off by default, revocable anytime)
- Purposes: **App functionality**

### 5. Device or other IDs
- What it is: push notification registration token
- Collected: Yes | Shared: No
- Processed ephemerally: No
- Required or optional: **Optional** (only if user enables push reminders)
- Purposes: **App functionality**

## Data types — declare as NOT collected
Location, health, photos/videos, audio, contacts, calendar, SMS/call logs,
browsing history, app activity/analytics, crash logs (no analytics or crash
SDK is integrated), files/docs.

## Sharing section
**No data shared with third parties.**
(Stripe processes Pro payments on Stripe's own checkout page — the app never
receives or stores card details, so payment data is collected by Stripe under
its own policy, not by the app. Google/Microsoft OAuth likewise happens on
their pages.)

## Notes / future TODOs
- If Play Billing (Digital Goods API) is adopted for the $10 Pro purchase,
  add "Financial info → Purchase history" (collected, purpose: app functionality).
- Consider a dedicated web page for account-deletion requests
  (e.g. /delete-account) — Play increasingly prefers a URL that leads
  directly to deletion steps rather than a general privacy policy.
- Keep the marketing copy, privacy policy, and this form aligned — mismatch
  is a common rejection reason.
