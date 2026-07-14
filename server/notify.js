'use strict'

// Emails the admin about notable events (signups, purchases, feedback).
// Uses Resend. Fire-and-forget: never blocks or fails the calling request.
// Requires RESEND_API_KEY in env — logs and skips when absent.

const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || 'daniyalhussain829@gmail.com'

// NOTIFY_FROM must be an address on a domain verified in the Resend account
// (resend.dev fallback only delivers to the account owner). Strip stray
// quotes/whitespace from the env value — a pasted "..." breaks Resend's
// from-field validation with a 422.
function fromAddress() {
  const raw = (process.env.NOTIFY_FROM || '').trim().replace(/^["']+|["']+$/g, '').trim()
  return raw || 'RenewBell <onboarding@resend.dev>'
}

async function sendEmail(to, subject, text, html) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Notify] RESEND_API_KEY not set — skipped:', subject)
    return false
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
        from: fromAddress(),
        to: [to],
        subject,
        text,
        ...(html ? { html } : {}),
      }),
    })
    if (!res.ok) {
      console.error('[Notify] Resend error:', res.status, await res.text())
      return false
    }
    return true
  } catch (err) {
    console.error('[Notify] Failed:', err.message)
    return false
  }
}

async function notifyAdmin(subject, text) {
  return sendEmail(ADMIN_EMAIL, subject, text)
}

module.exports = { notifyAdmin, sendEmail }
