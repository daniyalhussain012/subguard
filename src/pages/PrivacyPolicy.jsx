import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowLeft } from 'lucide-react'

function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-bold text-slate-100">{title}</h2>
      <div className="text-sm text-slate-400 leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

export default function PrivacyPolicy() {
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
          <h1 className="text-2xl font-bold text-slate-100">Privacy Policy</h1>
          <p className="text-xs text-slate-600 mt-1">Effective date: July 11, 2026</p>
        </div>

        <Section title="Overview">
          <p>
            RenewBell ("we", "our", "the app") is a subscription tracking and renewal reminder service.
            This policy explains what information we collect, how we use it, and the choices you have.
            By using RenewBell, you agree to the practices described here.
          </p>
        </Section>

        <Section title="Information We Collect">
          <p><strong className="text-slate-300">Account information.</strong> When you sign in with Google, we receive your name, email address, and profile picture from Google. We do not receive or store your Google password.</p>
          <p><strong className="text-slate-300">Subscription data.</strong> Information you enter about your subscriptions — service name, price, billing cycle, renewal date, category, and notes — is stored so we can track renewals and send you reminders.</p>
          <p><strong className="text-slate-300">Email scanning (optional).</strong> If you connect Gmail or Outlook using the Smart Scanner feature, we request read-only access to scan for subscription-related receipts and confirmation emails. We only extract subscription details (service name, amount, renewal date) from matching emails — we do not read, store, or share the full content of your inbox.</p>
          <p><strong className="text-slate-300">Payment information.</strong> One-time Pro upgrades are processed by Stripe. We never see or store your card number — Stripe handles payment data directly under its own privacy policy.</p>
          <p><strong className="text-slate-300">Push notification data.</strong> If you enable renewal reminders, your device registers a push subscription token so we can deliver notifications when the app is closed.</p>
          <p><strong className="text-slate-300">Device storage.</strong> Most of your subscription data is also stored locally in your browser (localStorage) so the app works offline and loads instantly.</p>
        </Section>

        <Section title="How We Use Your Information">
          <ul className="list-disc list-inside space-y-1">
            <li>To create and secure your account</li>
            <li>To track your subscriptions and calculate renewal dates and spending totals</li>
            <li>To send renewal reminder notifications (email-scan matches, push notifications)</li>
            <li>To process one-time Pro upgrade payments</li>
            <li>To maintain and improve the service (bug fixes, performance)</li>
          </ul>
          <p>We do not sell your personal information, and we do not use your data for advertising.</p>
        </Section>

        <Section title="Third-Party Services">
          <p>We rely on the following third parties to operate RenewBell. Each processes data under its own privacy policy:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong className="text-slate-300">Google</strong> — sign-in (OAuth) and, if you opt in, Gmail scanning</li>
            <li><strong className="text-slate-300">Microsoft</strong> — Outlook scanning, if you opt in</li>
            <li><strong className="text-slate-300">Stripe</strong> — payment processing for Pro upgrades</li>
            <li><strong className="text-slate-300">MongoDB Atlas</strong> — secure database hosting for account and subscription records</li>
            <li><strong className="text-slate-300">Render / Vercel</strong> — application hosting and infrastructure</li>
          </ul>
        </Section>

        <Section title="Data Retention">
          <p>
            We retain your account and subscription data for as long as your account is active. If you delete
            your account, we permanently remove your account record, subscriptions, reminders, and push
            registration from our servers. Locally stored data in your browser is removed when you clear it
            from Settings or clear your browser storage.
          </p>
        </Section>

        <Section title="Your Rights & Choices">
          <ul className="list-disc list-inside space-y-1">
            <li><strong className="text-slate-300">Export</strong> your data as a JSON file at any time from Settings</li>
            <li><strong className="text-slate-300">Disconnect</strong> Gmail or Outlook scanning at any time from the Smart Scanner page</li>
            <li><strong className="text-slate-300">Delete your account</strong> permanently, including all server-side data, from Settings → Danger Zone — see <Link to="/delete-account" className="text-cyan-500 hover:text-cyan-400 underline">how to delete your account</Link> for the full steps and what's retained</li>
          </ul>
          <p>If you have questions about your data or need help with a request, contact us using the details below.</p>
        </Section>

        <Section title="Data Security">
          <p>
            We use industry-standard measures to protect your data, including encrypted connections (HTTPS),
            hashed authentication tokens, and access-controlled databases. No method of transmission or storage
            is 100% secure, but we work to protect your information to industry standards.
          </p>
        </Section>

        <Section title="Children's Privacy">
          <p>RenewBell is not directed to children under 13, and we do not knowingly collect personal information from children under 13.</p>
        </Section>

        <Section title="Changes to This Policy">
          <p>We may update this policy from time to time. Material changes will be reflected by updating the effective date above.</p>
        </Section>

        <Section title="Contact Us">
          <p>Questions about this policy or your data? Send us a message from inside the app — <strong className="text-slate-300">Settings → Feedback</strong> — and we'll get back to you.</p>
        </Section>

        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-cyan-500 hover:text-cyan-400">
          <ArrowLeft size={14} /> Back to RenewBell
        </Link>
      </div>
    </div>
  )
}
