import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Bell, User, Palette, Database, ToggleLeft, ToggleRight, Download, Upload, Trash2, Sun, Moon, ShieldCheck, Smartphone, CheckCircle, XCircle, AlertCircle, Zap, Crown, MessageSquare } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../App'
import { useAuth } from '../contexts/AuthContext'
import { AVATAR_OPTIONS, defaultSettings } from '../utils/storage'
import { requestNotificationPermission, subscribeToPush, unsubscribeFromPush, getPushSubscriptionStatus } from '../utils/notifications'
import { isAndroidApp } from '../utils/platform'

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} className="transition-colors shrink-0">
      {value
        ? <ToggleRight size={26} className="text-cyan-400" />
        : <ToggleLeft size={26} className="text-slate-600" />}
    </button>
  )
}

function SettingRow({ label, sub, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-800/80 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-200">{label}</div>
        {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className="text-cyan-400" />
        <h2 className="font-bold text-slate-200 text-sm uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  )
}

const API_URL = import.meta.env.VITE_API_URL || 'https://subguard-api-cug1.onrender.com'

const CURRENCIES = [
  { code: 'USD', label: '$ US Dollar' },
  { code: 'EUR', label: '€ Euro' },
  { code: 'GBP', label: '£ British Pound' },
  { code: 'CAD', label: 'CA$ Canadian Dollar' },
  { code: 'AUD', label: 'A$ Australian Dollar' },
]

export default function Settings() {
  const { settings, updateSettings, darkMode, setDarkMode, activeKeys, subscriptions, reloadData } = useApp()
  const { user, isPremium, logout, deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [notifStatus, setNotifStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )
  const [exportSuccess, setExportSuccess] = useState(false)
  const [importError, setImportError] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [deleteAccountError, setDeleteAccountError] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwSaveState, setPwSaveState] = useState('idle') // idle | saving | saved | error
  const [pwSaveError, setPwSaveError] = useState('')
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSending, setFeedbackSending] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [adminData, setAdminData] = useState(null)

  // Admin-only signup/subscription tracking — the server returns 403 for
  // everyone except ADMIN_EMAILS accounts, so the section stays hidden
  useEffect(() => {
    fetch(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('subguard_token') || ''}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setAdminData(d) })
      .catch(() => {})
  }, [])
  const [testPushState, setTestPushState] = useState('idle') // idle | sending
  const [testPushResult, setTestPushResult] = useState(null) // { stage, localShown, sent, devices, serverError }
  const [excelBusy, setExcelBusy] = useState(false)
  const [excelMsg, setExcelMsg] = useState(null) // { ok, text }
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)

  const notifs = settings.notifications || {}
  const display = settings.display || {}
  const profile = settings.profile || {}

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true)
    getPushSubscriptionStatus().then(setPushSubscribed)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)

  function updateNotif(key, val) { updateSettings({ notifications: { ...notifs, [key]: val } }) }
  function updateDisplay(key, val) { updateSettings({ display: { ...display, [key]: val } }) }
  function updateProfile(key, val) { updateSettings({ profile: { ...profile, [key]: val } }) }

  async function handleRequestNotifications() {
    const result = await requestNotificationPermission()
    setNotifStatus(result)
    if (result === 'granted') {
      updateNotif('enabled', true)
      setPushLoading(true)
      const sub = await subscribeToPush()
      setPushSubscribed(!!sub)
      setPushLoading(false)
    }
  }

  async function handleTogglePush() {
    setPushLoading(true)
    if (pushSubscribed) {
      await unsubscribeFromPush()
      setPushSubscribed(false)
    } else {
      const sub = await subscribeToPush()
      setPushSubscribed(!!sub)
    }
    setPushLoading(false)
  }

  async function handleInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') { setIsInstalled(true); setInstallPrompt(null) }
  }

  function handleExport() {
    const data = {
      subscriptions: JSON.parse(localStorage.getItem(activeKeys.SUBSCRIPTIONS) || '[]'),
      reminders:     JSON.parse(localStorage.getItem(activeKeys.REMINDERS) || '[]'),
      household:     JSON.parse(localStorage.getItem(activeKeys.HOUSEHOLD) || '[]'),
      settings:      JSON.parse(localStorage.getItem(activeKeys.SETTINGS) || '{}'),
      exportedAt: new Date().toISOString(),
      version: '2.0',
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `renewbell-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExportSuccess(true)
    setTimeout(() => setExportSuccess(false), 2000)
  }

  function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.subscriptions) localStorage.setItem(activeKeys.SUBSCRIPTIONS, JSON.stringify(data.subscriptions))
        if (data.reminders)     localStorage.setItem(activeKeys.REMINDERS,     JSON.stringify(data.reminders))
        if (data.household)     localStorage.setItem(activeKeys.HOUSEHOLD,     JSON.stringify(data.household))
        if (data.settings)      localStorage.setItem(activeKeys.SETTINGS,      JSON.stringify(data.settings))
        window.location.reload()
      } catch {
        setImportError('Invalid file format. Please use a RenewBell backup file.')
      }
    }
    reader.readAsText(file)
  }

  function handleClearData() {
    if (!window.confirm('This will delete ALL your RenewBell data permanently. Are you sure?')) return
    if (!window.confirm('This cannot be undone. Delete everything?')) return
    Object.values(activeKeys).forEach(k => localStorage.removeItem(k))
    window.location.reload()
  }

  // Two-stage diagnostic so "no notification appeared" pinpoints WHICH layer
  // failed: a local browser notification (no server involved — if this one
  // doesn't appear, the OS is muting the browser), then a real end-to-end
  // push through the server.
  async function handleTestPush() {
    setTestPushState('sending')
    setTestPushResult(null)
    try {
      if (typeof Notification === 'undefined') { setTestPushResult({ stage: 'unsupported' }); setTestPushState('idle'); return }
      let perm = Notification.permission
      if (perm === 'default') perm = await Notification.requestPermission()
      if (perm !== 'granted') { setTestPushResult({ stage: 'blocked' }); setTestPushState('idle'); return }
      setNotifStatus('granted')

      // Stage 1: local notification straight from the service worker
      let localShown = false
      try {
        const reg = await navigator.serviceWorker.ready
        await reg.showNotification('🔔 RenewBell test 1 of 2', {
          body: 'This one came straight from your browser — no server involved.',
          icon: '/icon-192.png',
          tag: 'renewbell-local-test',
        })
        localShown = true
      } catch {}

      // Stage 2: register this device, then a real push through the server
      await subscribeToPush().catch(() => {})
      setPushSubscribed(true)
      const r = await fetch(`${API_URL}/api/push/test`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('subguard_token') || ''}` },
      })
      const data = await r.json().catch(() => ({}))
      setTestPushResult({
        stage: 'done',
        localShown,
        sent: data.sent || 0,
        devices: data.devices || 0,
        serverError: data.ok ? '' : (data.error || ''),
      })
    } catch { setTestPushResult({ stage: 'error' }) }
    setTestPushState('idle')
  }

  async function handleExportExcel() {
    if (!isPremium) { navigate('/upgrade'); return }
    setExcelBusy(true)
    try {
      const XLSX = await import('xlsx')
      const rows = subscriptions.map(s => ({
        Name: s.name,
        Category: s.category || 'Other',
        Amount: s.amount,
        Currency: s.currency || 'USD',
        'Billing Cycle': s.billingCycle || 'Monthly',
        'Next Billing Date': s.nextBillingDate || '',
        Status: s.status || 'Active',
        'Auto Renewal': s.autoRenewal === false ? 'No' : 'Yes',
        'Payment Method': s.paymentMethod || '',
        Notes: s.notes || '',
      }))
      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Subscriptions')
      XLSX.writeFile(wb, `renewbell-subscriptions-${new Date().toISOString().slice(0, 10)}.xlsx`)
      setExcelMsg({ ok: true, text: `Exported ${rows.length} subscriptions to Excel` })
    } catch {
      setExcelMsg({ ok: false, text: 'Export failed — please try again' })
    }
    setExcelBusy(false)
    setTimeout(() => setExcelMsg(null), 5000)
  }

  async function handleImportExcel(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return
    if (!isPremium) { navigate('/upgrade'); return }
    setExcelBusy(true)
    try {
      const XLSX = await import('xlsx')
      const { v4: uuidv4 } = await import('uuid')
      const wb = XLSX.read(await file.arrayBuffer())
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
      const norm = k => k.toLowerCase().replace(/[^a-z]/g, '')
      const get = (row, ...names) => {
        for (const key of Object.keys(row)) if (names.includes(norm(key))) return row[key]
        return undefined
      }
      const existingNames = new Set(subscriptions.map(s => s.name?.toLowerCase()))
      const now = new Date().toISOString()
      const imported = []
      for (const row of rows) {
        const name = (get(row, 'name', 'service', 'subscription') || '').toString().trim()
        const amount = parseFloat(get(row, 'amount', 'price', 'cost'))
        if (!name || isNaN(amount) || amount <= 0) continue
        if (existingNames.has(name.toLowerCase())) continue // skip duplicates
        let nextBillingDate = get(row, 'nextbillingdate', 'renewaldate', 'nextbilling', 'duedate')
        if (nextBillingDate instanceof Date) nextBillingDate = nextBillingDate.toISOString().slice(0, 10)
        else if (typeof nextBillingDate === 'number') {
          // Excel serial date
          nextBillingDate = new Date(Date.UTC(1899, 11, 30) + nextBillingDate * 86400000).toISOString().slice(0, 10)
        } else nextBillingDate = (nextBillingDate || '').toString().slice(0, 10)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(nextBillingDate)) {
          const d = new Date(); d.setDate(d.getDate() + 30)
          nextBillingDate = d.toISOString().slice(0, 10)
        }
        imported.push({
          id: uuidv4(),
          name,
          amount,
          currency: (get(row, 'currency') || 'USD').toString().toUpperCase().slice(0, 3),
          billingCycle: ['Weekly', 'Monthly', 'Quarterly', 'Yearly'].find(c => c.toLowerCase() === (get(row, 'billingcycle', 'cycle', 'frequency') || '').toString().toLowerCase()) || 'Monthly',
          category: (get(row, 'category') || 'Other').toString(),
          nextBillingDate,
          status: 'Active',
          autoRenewal: !/^(no|false|0)$/i.test((get(row, 'autorenewal', 'renews') || 'yes').toString()),
          paymentMethod: (get(row, 'paymentmethod') || '').toString(),
          notes: (get(row, 'notes') || '').toString(),
          createdAt: now,
          updatedAt: now,
        })
      }
      if (imported.length) {
        const merged = [...subscriptions, ...imported]
        localStorage.setItem(activeKeys.SUBSCRIPTIONS, JSON.stringify(merged))
        reloadData()
        setExcelMsg({ ok: true, text: `Imported ${imported.length} subscriptions (${rows.length - imported.length} skipped as duplicates/invalid)` })
      } else {
        setExcelMsg({ ok: false, text: 'Nothing to import — needs Name and Amount columns; duplicates are skipped' })
      }
    } catch {
      setExcelMsg({ ok: false, text: 'Could not read that file — is it a valid .xlsx?' })
    }
    setExcelBusy(false)
    setTimeout(() => setExcelMsg(null), 8000)
  }

  async function handleSetPassword() {
    if (newPassword.length < 8) { setPwSaveState('error'); setPwSaveError('Password must be at least 8 characters'); return }
    setPwSaveState('saving')
    setPwSaveError('')
    try {
      const r = await fetch(`${API_URL}/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('subguard_token') || ''}` },
        body: JSON.stringify({ password: newPassword }),
      })
      const data = await r.json().catch(() => ({}))
      if (r.ok) { setPwSaveState('saved'); setNewPassword(''); setTimeout(() => setPwSaveState('idle'), 3000) }
      else { setPwSaveState('error'); setPwSaveError(data.error || 'Could not save password') }
    } catch { setPwSaveState('error'); setPwSaveError('Could not reach the server') }
  }

  async function handleSendFeedback() {
    if (!feedbackText.trim()) return
    setFeedbackSending(true)
    try {
      const r = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('subguard_token') || ''}` },
        body: JSON.stringify({ message: feedbackText.trim() }),
      })
      if (r.ok) {
        setFeedbackSent(true)
        setFeedbackText('')
        setTimeout(() => setFeedbackSent(false), 3000)
      }
    } catch {}
    setFeedbackSending(false)
  }

  async function handleDeleteAccount() {
    if (!window.confirm('This permanently deletes your RenewBell account and erases your data — subscriptions, reminders, and push registration — from our servers. This cannot be undone. Continue?')) return
    if (!window.confirm('Are you absolutely sure? There is no way to recover your account after this.')) return
    setDeleteAccountError('')
    setDeletingAccount(true)
    const { ok } = await deleteAccount()
    if (ok) {
      Object.values(activeKeys).forEach(k => localStorage.removeItem(k))
      window.location.href = '/login'
    } else {
      setDeletingAccount(false)
      setDeleteAccountError('Failed to delete your account. Please try again or contact support.')
    }
  }

  const REMINDER_DAY_OPTIONS = [1, 2, 3, 7, 14]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon size={19} className="text-slate-400" />
        <h1 className="page-header mb-0">Settings</h1>
      </div>

      <Section icon={User} title="Account & Plan">
        <div className={`flex items-center justify-between p-3 rounded-xl mb-3 ${darkMode ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
          <div className="flex items-center gap-3">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
              : <span className="text-2xl">{profile.avatar || '\u{1F464}'}</span>
            }
            <div>
              <div className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{user?.name || profile.name || 'My Account'}</div>
              <div className="text-xs text-slate-500">{user?.email || ''}</div>
            </div>
          </div>
          {isPremium ? (
            <span className="flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-400 text-white px-2.5 py-1 rounded-full">
              <Crown size={11} /> PRO
            </span>
          ) : (
            <span className="text-xs font-bold bg-slate-700 text-slate-400 px-2.5 py-1 rounded-full">FREE</span>
          )}
        </div>
        {!isPremium && (
          <button onClick={() => navigate('/upgrade')} className="btn-primary w-full justify-center text-sm mb-2">
            <Zap size={14} /> {isAndroidApp() ? 'Unlock RenewBell Pro' : 'Upgrade to Pro — $10 one-time'}
          </button>
        )}
        <div className="mb-3 p-3 rounded-xl border border-slate-700/40 bg-slate-800/30 space-y-2">
          <div className="text-sm font-medium text-slate-200">{user?.hasPassword ? 'Change password' : 'Set a password'}</div>
          <p className="text-xs text-slate-500">
            {user?.hasPassword
              ? 'Used to sign in with your email on any device.'
              : 'Add a password so you can sign in with your email directly — no Google or email link needed.'}
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="New password (min 8 characters)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="input flex-1 text-sm"
            />
            <button onClick={handleSetPassword} disabled={pwSaveState === 'saving' || !newPassword} className="btn-secondary text-xs px-3 disabled:opacity-40">
              {pwSaveState === 'saving' ? 'Saving…' : pwSaveState === 'saved' ? 'Saved ✓' : 'Save'}
            </button>
          </div>
          {pwSaveState === 'error' && <p className="text-xs text-red-400">{pwSaveError}</p>}
        </div>
        <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/20">
          Sign Out of RenewBell
        </button>
      </Section>

      <Section icon={User} title="Display Profile">
        <SettingRow label="Display Name" sub="Shown in the sidebar">
          <input className="input w-40 text-right text-sm py-1.5" value={profile.name || ''} onChange={e => updateProfile('name', e.target.value)} placeholder="Your name" />
        </SettingRow>
        <div className="py-3">
          <div className="text-sm font-medium text-slate-200 mb-3">Avatar</div>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_OPTIONS.map(av => (
              <button key={av} onClick={() => updateProfile('avatar', av)}
                className={`text-2xl p-2 rounded-xl transition-all ${profile.avatar === av ? 'bg-cyan-500/20 ring-2 ring-cyan-500/50' : 'hover:bg-slate-700/40'}`}>
                {av}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section icon={Palette} title="Display">
        <SettingRow label="Dark Mode" sub="Dark navy background">
          <Toggle value={darkMode} onChange={setDarkMode} />
        </SettingRow>
        <SettingRow label="Currency" sub="Used throughout the app">
          <select className="input w-44 text-sm py-1.5" value={settings.currency || 'USD'} onChange={e => updateSettings({ currency: e.target.value })}>
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
        </SettingRow>
        <SettingRow label="Compact View" sub="Smaller cards and less padding">
          <Toggle value={display.compactView} onChange={v => updateDisplay('compactView', v)} />
        </SettingRow>
        <SettingRow label="Show Amounts As" sub="How costs are displayed">
          <select className="input w-32 text-sm py-1.5" value={display.showAmountsAs || 'monthly'} onChange={e => updateDisplay('showAmountsAs', e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </SettingRow>
      </Section>

      <Section icon={Smartphone} title="Install App">
        {isInstalled ? (
          <div className="flex items-center gap-2 text-sm text-emerald-400 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-lg">
            <CheckCircle size={16} /> RenewBell is installed on your device
          </div>
        ) : installPrompt ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Install RenewBell as an app on your device for a native experience and push notifications that work even when the browser is closed.</p>
            <button onClick={handleInstall} className="btn-primary w-full justify-center">
              <Smartphone size={14} /> Add to Home Screen
            </button>
          </div>
        ) : isIOS ? (
          <div className="space-y-2">
            <p className="text-sm text-slate-400">To install RenewBell on iOS:</p>
            <ol className="text-xs text-slate-500 space-y-1 pl-4 list-decimal">
              <li>Tap the <strong className="text-slate-300">Share</strong> button in Safari</li>
              <li>Scroll down and tap <strong className="text-slate-300">Add to Home Screen</strong></li>
              <li>Tap <strong className="text-slate-300">Add</strong> to confirm</li>
            </ol>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Open RenewBell in Chrome or Edge on your device to install it as an app.</p>
        )}
      </Section>

      <Section icon={Bell} title="Push Notifications">
        <div className="mb-4 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 space-y-1.5">
          <div className="text-xs font-semibold text-cyan-400 mb-2">3-Stage Renewal Reminder System</div>
          <div className="flex items-start gap-2 text-xs text-slate-400">
            <span className="text-base leading-none">🔔</span>
            <span><strong className="text-slate-200">7 days before</strong> — First heads-up. Dismiss to skip reminders for this cycle.</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-400">
            <span className="text-base leading-none">⚠️</span>
            <span><strong className="text-slate-200">2 days before</strong> — Second alert (skipped if you dismissed stage 1).</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-400">
            <span className="text-base leading-none">🚨</span>
            <span><strong className="text-slate-200">1 day before</strong> — Final warning. Always fires, last chance to cancel.</span>
          </div>
        </div>

        <div className="mb-4 space-y-2">
          {notifStatus === 'unsupported' && (
            <div className="flex items-center gap-2 text-xs text-slate-500 p-3 bg-slate-800/40 border border-slate-700/40 rounded-lg">
              <AlertCircle size={14} /> Your browser doesn't support push notifications
            </div>
          )}
          {notifStatus === 'denied' && (
            <div className="flex items-center gap-2 text-xs text-red-300 p-3 bg-red-500/10 border border-red-500/25 rounded-lg">
              <XCircle size={14} /> Notifications blocked — go to browser Settings to re-enable
            </div>
          )}
          {notifStatus === 'granted' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-emerald-400 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-lg">
                <CheckCircle size={14} />
                {pushSubscribed ? 'Background push notifications active' : 'Notifications allowed but not yet subscribed to background push'}
              </div>
              <button onClick={handleTogglePush} disabled={pushLoading} className={`btn-${pushSubscribed ? 'secondary' : 'primary'} w-full justify-center`}>
                <Bell size={14} />
                {pushLoading ? 'Working...' : pushSubscribed ? 'Disable Background Push' : 'Enable Background Push (recommended)'}
              </button>
              <button onClick={handleTestPush} disabled={testPushState === 'sending'} className="btn-secondary w-full justify-center">
                🔔 {testPushState === 'sending' ? 'Testing…' : 'Send Test Notification'}
              </button>
              {testPushResult?.stage === 'done' && (
                <div className="text-xs p-3 bg-slate-800/40 border border-slate-700/40 rounded-lg space-y-1.5">
                  <p className={testPushResult.localShown ? 'text-emerald-400' : 'text-red-400'}>
                    1. Browser notification: {testPushResult.localShown ? 'shown — "RenewBell test 1 of 2" should have just popped up.' : 'FAILED to display.'}
                  </p>
                  <p className={testPushResult.sent > 0 ? 'text-emerald-400' : 'text-red-400'}>
                    2. Server push: {testPushResult.sent > 0
                      ? `delivered to ${testPushResult.sent} of ${testPushResult.devices} device${testPushResult.devices !== 1 ? 's' : ''} — "test 2 of 2" arrives within seconds.`
                      : `failed${testPushResult.serverError ? ` — ${testPushResult.serverError}` : ''}`}
                  </p>
                  <p className="text-slate-500 pt-1 border-t border-slate-700/40">
                    Tests pass but you see nothing pop up? Your operating system is muting the browser:
                    on <strong className="text-slate-400">Windows</strong> — Settings → System → Notifications → turn ON for your browser, and turn OFF "Do not disturb" / Focus Assist.
                    On <strong className="text-slate-400">macOS</strong> — System Settings → Notifications → your browser → Allow.
                  </p>
                </div>
              )}
              {testPushResult?.stage === 'blocked' && (
                <p className="text-xs text-red-400 text-center">Notifications are blocked for this site — click the padlock in the address bar → Notifications → Allow, then retry.</p>
              )}
              {testPushResult?.stage === 'error' && (
                <p className="text-xs text-red-400 text-center">Test failed to run — refresh the page and try again.</p>
              )}
            </div>
          ) : notifStatus !== 'denied' && notifStatus !== 'unsupported' ? (
            <button onClick={handleRequestNotifications} disabled={pushLoading} className="btn-primary w-full justify-center">
              <Bell size={14} /> {pushLoading ? 'Setting up...' : 'Enable Push Notifications'}
            </button>
          ) : null}
        </div>

        <SettingRow label="Notifications Enabled" sub="Master toggle for all alerts">
          <Toggle value={notifs.enabled || false} onChange={v => updateNotif('enabled', v)} />
        </SettingRow>
        <SettingRow label="Renewal Reminders" sub="Alert before subscriptions renew">
          <Toggle value={notifs.renewalReminders !== false} onChange={v => updateNotif('renewalReminders', v)} />
        </SettingRow>
        <SettingRow label="Price Increase Alerts" sub="When a service changes pricing">
          <Toggle value={notifs.priceIncreaseAlerts !== false} onChange={v => updateNotif('priceIncreaseAlerts', v)} />
        </SettingRow>
        <SettingRow label="Trial Ending Alerts" sub="Before free trials expire">
          <Toggle value={notifs.trialEndingAlerts !== false} onChange={v => updateNotif('trialEndingAlerts', v)} />
        </SettingRow>
        <SettingRow label="Weekly Summary" sub="Spending digest every Sunday">
          <Toggle value={notifs.weeklySummary || false} onChange={v => updateNotif('weeklySummary', v)} />
        </SettingRow>
        <div className="py-3">
          <div className="text-sm font-medium text-slate-200 mb-2">Remind me X days before renewal</div>
          <div className="flex gap-2 flex-wrap">
            {REMINDER_DAY_OPTIONS.map(d => {
              const selected = (notifs.remindDaysBefore || [2, 7]).includes(d)
              return (
                <button key={d} onClick={() => {
                  const current = notifs.remindDaysBefore || [2, 7]
                  const next = selected ? current.filter(x => x !== d) : [...current, d]
                  updateNotif('remindDaysBefore', next)
                }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${selected ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-500'}`}
                >
                  {d === 1 ? '1 day' : `${d} days`}
                </button>
              )
            })}
          </div>
        </div>
        <SettingRow label="Quiet Hours" sub="No notifications between these hours">
          <div className="flex items-center gap-1.5 text-xs">
            <select className="input w-20 py-1 text-xs" value={notifs.quietHoursStart ?? 22} onChange={e => updateNotif('quietHoursStart', parseInt(e.target.value))}>
              {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i}:00</option>)}
            </select>
            <span className="text-slate-600">to</span>
            <select className="input w-20 py-1 text-xs" value={notifs.quietHoursEnd ?? 8} onChange={e => updateNotif('quietHoursEnd', parseInt(e.target.value))}>
              {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i}:00</option>)}
            </select>
          </div>
        </SettingRow>
      </Section>

      <Section icon={Database} title="Data Management">
        <div className="space-y-2">
          <button onClick={handleExport} className="btn-secondary w-full justify-center">
            <Download size={14} />
            {exportSuccess ? 'Exported!' : 'Export My Data as JSON'}
          </button>
          <label className="btn-secondary w-full justify-center cursor-pointer">
            <Upload size={14} /> Import from JSON
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          {importError && <p className="text-xs text-red-400 text-center">{importError}</p>}

          <div className="border-t border-slate-800/80 my-3 pt-3 space-y-2">
            <p className="text-xs text-slate-500">Excel (.xlsx) {!isPremium && <span className="text-amber-400 font-semibold">· Pro</span>}</p>
            <button onClick={handleExportExcel} disabled={excelBusy} className="btn-secondary w-full justify-center">
              <Download size={14} /> {excelBusy ? 'Working…' : 'Export to Excel'}
            </button>
            <label className="btn-secondary w-full justify-center cursor-pointer">
              <Upload size={14} /> Import from Excel
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel} />
            </label>
            {excelMsg && <p className={`text-xs text-center ${excelMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{excelMsg.text}</p>}
          </div>

          <button onClick={handleClearData} className="btn-danger w-full justify-center py-2.5 mt-3">
            <Trash2 size={14} /> Clear All My Data
          </button>
        </div>
      </Section>

      {(
        <Section icon={MessageSquare} title="Feedback & Contact">
          <p className="text-xs text-slate-500 mb-3">
            Feature requests, bugs, questions about your data — your message goes straight to the founder. We read everything.
          </p>
          <textarea
            className="input min-h-[90px] resize-none text-sm"
            placeholder="What should we build or fix next?"
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value)}
            maxLength={2000}
          />
          <button
            onClick={handleSendFeedback}
            disabled={!feedbackText.trim() || feedbackSending}
            className="btn-primary w-full justify-center mt-2 disabled:opacity-40"
          >
            {feedbackSent ? <><CheckCircle size={14} /> Sent — thank you!</> : feedbackSending ? 'Sending…' : <><MessageSquare size={14} /> Send Feedback</>}
          </button>
        </Section>
      )}

      {adminData && (
        <Section icon={Crown} title="Admin · Signups & Subscriptions">
          <div className="grid grid-cols-4 gap-2 mb-4 text-center">
            {[
              { label: 'Users', value: adminData.total },
              { label: 'Pro', value: adminData.pro },
              { label: 'Free', value: adminData.free },
              { label: 'Feedback', value: adminData.feedbackCount },
            ].map(s => (
              <div key={s.label} className="bg-slate-800/60 rounded-xl py-2.5">
                <div className="text-lg font-bold text-cyan-400">{s.value}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {adminData.users.map(u => (
              <div key={u.email + u.createdAt} className="flex items-center gap-2 text-xs py-1.5 border-b border-slate-800/60 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-slate-200 font-medium truncate">{u.name || '—'}</div>
                  <div className="text-slate-500 truncate">{u.email}</div>
                </div>
                <span className={`shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${u.plan === 'premium' ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-700/60 text-slate-400'}`}>
                  {u.plan === 'premium' ? 'PRO' : 'FREE'}
                </span>
                <span className="shrink-0 text-slate-600">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section icon={AlertCircle} title="Danger Zone">
        <p className="text-xs text-slate-500 mb-3">
          Permanently delete your RenewBell account and all data associated with it — email, subscriptions, reminders, and push registration — from our servers. This is different from "Clear All My Data" above, which only clears your local device.
        </p>
        <button onClick={handleDeleteAccount} disabled={deletingAccount} className="btn-danger w-full justify-center py-2.5 disabled:opacity-60">
          <Trash2 size={14} /> {deletingAccount ? 'Deleting Account…' : 'Delete My Account'}
        </button>
        {deleteAccountError && <p className="text-xs text-red-400 text-center mt-2">{deleteAccountError}</p>}
      </Section>

      <div className="card p-5 text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-100">RenewBell</span>
        </div>
        <p className="text-xs text-slate-500">Never miss a renewal again.</p>
        <p className="text-xs text-slate-700">v2.0.0 · Data stored per-account in your browser · Signed in with Google</p>
        <p className="text-xs">
          <Link to="/privacy" className="text-cyan-500 hover:text-cyan-400 underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
    }
