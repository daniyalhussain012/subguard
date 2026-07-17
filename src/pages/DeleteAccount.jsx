import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, Trash2 } from 'lucide-react'

// Public page required by Google Play's Data safety declaration: the
// "Delete account URL" must be reachable without signing in, name the app,
// spell out the deletion steps, and state what is deleted vs retained.
export default function DeleteAccount() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-100">RenewBell</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-100">Delete your RenewBell account</h1>
          <p className="text-sm text-slate-400 mt-2">
            This page explains how to delete your <strong className="text-slate-300">RenewBell</strong> account
            (app: <span className="text-slate-300">RenewBell Subscription Tracker</span>) and exactly what happens
            to your data.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-100">How to delete your account</h2>
          <ol className="text-sm text-slate-400 leading-relaxed space-y-2 list-decimal list-inside">
            <li>Open the RenewBell app (or go to <span className="text-slate-300">renewbell.app</span>) and sign in.</li>
            <li>Go to <strong className="text-slate-300">Settings</strong>.</li>
            <li>Scroll to the <strong className="text-slate-300">Danger Zone</strong> section.</li>
            <li>Tap <strong className="text-slate-300">Delete My Account</strong>.</li>
            <li>Confirm twice when prompted. Your account and data are erased immediately.</li>
          </ol>
          <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-4 flex gap-3">
            <Trash2 size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Deletion is immediate and permanent. There is no recovery period and no way to restore the account
              afterwards. If you want a copy of your data first, use{' '}
              <strong className="text-slate-300">Settings → Data Management → Export My Data</strong> before deleting.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-100">What is deleted</h2>
          <p className="text-sm text-slate-400">Deleting your account permanently erases all of the following from our servers:</p>
          <ul className="text-sm text-slate-400 leading-relaxed space-y-1.5 list-disc list-inside">
            <li>Your account record — name, email address, and password (if set)</li>
            <li>All of your subscription records — service names, prices, billing cycles, and renewal dates</li>
            <li>Your push notification registration for every device</li>
            <li>Any Gmail or Outlook connection, including the access tokens used for inbox scanning</li>
            <li>Any feedback you submitted through the app</li>
          </ul>
          <p className="text-sm text-slate-400">
            Data stored locally in your browser or on your device is removed at the same time. You can also clear it
            yourself at any point via <strong className="text-slate-300">Settings → Data Management → Clear All My Data</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-100">What is retained, and for how long</h2>
          <ul className="text-sm text-slate-400 leading-relaxed space-y-1.5 list-disc list-inside">
            <li>
              <strong className="text-slate-300">Payment records:</strong> if you purchased RenewBell Pro, the transaction
              record is held by our payment processor, Stripe, not by RenewBell. Stripe retains it for financial,
              tax, and anti-fraud purposes as required by law — typically up to <strong className="text-slate-300">7 years</strong>.
              We never store your card details at any point.
            </li>
            <li>
              <strong className="text-slate-300">Nothing else.</strong> RenewBell keeps no backup copy of your account,
              subscriptions, emails, or feedback once deletion completes.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-100">Deleting only some of your data</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            You don't have to delete your whole account to remove data. You can delete any individual subscription
            from the Subscriptions screen, and disconnect Gmail or Outlook at any time from the Smart Scanner screen —
            which erases the stored access tokens for that mailbox. Both take effect on our servers immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-100">Need help?</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            If you can't sign in and need your account deleted, send a request from the email address on the account
            using the Feedback option in the app, or contact the developer via the contact details on the RenewBell
            Google Play listing. We action verified requests within 30 days.
          </p>
        </section>

        <p className="text-xs text-slate-600">
          See our <Link to="/privacy" className="text-cyan-500 hover:text-cyan-400 underline">Privacy Policy</Link> for
          full details on what we collect and why.
        </p>

        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-cyan-500 hover:text-cyan-400">
          <ArrowLeft size={14} /> Back to RenewBell
        </Link>
      </div>
    </div>
  )
}
