// Detects when RenewBell is running inside the Android app (a Trusted Web
// Activity launched from Google Play) rather than a normal browser.
//
// Google Play billing policy forbids paying for digital goods through an
// external processor (Stripe) inside the app. So in the Android app we hide
// the in-app purchase flow entirely — Pro is bought on the website, and
// because Pro is tied to the server-side account, it then applies in the app
// automatically for the same signed-in user.
//
// Signal: a TWA sets document.referrer to `android-app://<package>` on
// launch. We capture it once and persist it, because client-side SPA
// navigation can later clear document.referrer.

let cached = null

export function isAndroidApp() {
  if (cached !== null) return cached
  try {
    if (typeof document !== 'undefined' && document.referrer && document.referrer.startsWith('android-app://')) {
      sessionStorage.setItem('rb_android_app', '1')
    }
    cached = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rb_android_app') === '1'
  } catch {
    cached = false
  }
  return cached
}
