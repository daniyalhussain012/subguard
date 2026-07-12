'use strict'

// Emails the admin about notable events (signups, purchases, feedback).
// Uses Resend. Fire-and-forget: never blocks or fails the calling request.
// Requires RESEND_API_KEY in env — logs and skips when absent.

const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || 'daniyalhussain829@gmail.com'

async function notifyAdmin(subject, text) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Notify] RESEND_API_KEY not set — skipped:', subject)
    return
  }
  try {
    const fetch = (...args) => import('node-fetch').then(m => m.default(...args))
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RenewBell <onboarding@resend.dev>',
        to: [ADMIN_EMAIL],
        subject,
        text,
      }),
    })
    if (!res.ok) console.error('[Notify] Resend error:', res.status, await res.text())
  } catch (err) {
    console.error('[Notify] Failed:', err.message)
  }
}

module.exports = { notifyAdmin }
