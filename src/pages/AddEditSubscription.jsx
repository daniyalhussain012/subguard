import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { format, addDays } from 'date-fns'
import { motion } from 'framer-motion'
import { Save, Trash2, ArrowLeft, Bell, ToggleLeft, ToggleRight, CheckCircle, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../App'
import {
  CATEGORIES, BILLING_CYCLES, STATUSES, IMPORTANCE,
  formatCurrency, getMonthlyAmount
} from '../utils/storage'
import ServiceAutocomplete from '../components/ServiceAutocomplete'

const REMINDER_OPTIONS = [
  { label: '1 day before', value: 1 },
  { label: '2 days before', value: 2 },
  { label: '3 days before', value: 3 },
  { label: '7 days before', value: 7 },
  { label: '14 days before', value: 14 },
]

const CURRENCIES = [
  { code: 'USD', symbol: '$',   label: 'USD — US Dollar' },
  { code: 'CAD', symbol: 'C$',  label: 'CAD — Canadian Dollar' },
  { code: 'AUD', symbol: 'A$',  label: 'AUD — Australian Dollar' },
  { code: 'GBP', symbol: '£',   label: 'GBP — British Pound' },
  { code: 'EUR', symbol: '€',   label: 'EUR — Euro' },
  { code: 'PKR', symbol: '₨',   label: 'PKR — Pakistani Rupee' },
  { code: 'INR', symbol: '₹',   label: 'INR — Indian Rupee' },
  { code: 'NZD', symbol: 'NZ$', label: 'NZD — New Zealand Dollar' },
  { code: 'SGD', symbol: 'S$',  label: 'SGD — Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', label: 'AED — UAE Dirham' },
]

const EMPTY = {
  name: '', category: 'Streaming', amount: '', currency: 'USD', billingCycle: 'Monthly',
  nextBillingDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
  autoRenewal: true, paymentMethod: '', notes: '', status: 'Active',
  importance: 'Nice to Have', canDowngrade: false, alternativeNotes: '',
  reminderDays: 3, isTrial: false, trialEndsDate: '', isPriceIncrease: false,
  originalPrice: '', usedBy: [], lastUsed: null, totalPaid: '', monthsTracked: '',
}

function Toggle({ value, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!value)}>
      {value ? <ToggleRight size={26} className="text-cyan-400" /> : <ToggleLeft size={26} className="text-slate-600" />}
    </button>
  )
}

const FREE_LIMIT = 5

export default function AddEditSubscription() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, reminders, addReminder, deleteReminder, household, darkMode, isPremium } = useApp()

  const [form, setForm] = useState(EMPTY)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [existingReminder, setExistingReminder] = useState(null)
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const isEditing = Boolean(id)
  const atFreeLimit = !isEditing && !isPremium && subscriptions.length >= FREE_LIMIT

  useEffect(() => {
    // Pre-fill from Smart Scanner
    const prefill = sessionStorage.getItem('subguard_prefill')
    if (prefill && !isEditing) {
      try {
        const p = JSON.parse(prefill)
        setForm(f => ({ ...f, ...p }))
        sessionStorage.removeItem('subguard_prefill')
      } catch {}
    }
    if (isEditing) {
      const sub = subscriptions.find(s => s.id === id)
      if (sub) {
        setForm({ ...EMPTY, ...sub, amount: sub.amount?.toString() || '' })
        const rem = reminders.find(r => r.subscriptionId === id)
        if (rem) { setReminderEnabled(true); setExistingReminder(rem) }
      }
    }
  }, [id, subscriptions, reminders, isEditing])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) e.amount = 'Enter a valid amount'
    if (!form.nextBillingDate) e.nextBillingDate = 'Date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (atFreeLimit) { navigate('/upgrade'); return }
    if (!validate()) return
    const now = new Date().toISOString()
    const sub = {
      ...form,
      amount: parseFloat(form.amount),
      totalPaid: form.totalPaid ? parseFloat(form.totalPaid) : 0,
      monthsTracked: form.monthsTracked ? parseInt(form.monthsTracked) : 1,
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      id: isEditing ? id : uuidv4(),
      createdAt: isEditing ? (subscriptions.find(s => s.id === id)?.createdAt || now) : now,
      updatedAt: now,
      lastReviewedAt: now,
    }
    if (isEditing) {
      updateSubscription(id, sub)
      if (existingReminder) deleteReminder(existingReminder.id)
    } else {
      addSubscription(sub)
    }
    if (reminderEnabled) {
      addReminder({ id: uuidv4(), subscriptionId: sub.id, daysBefore: parseInt(form.reminderDays), createdAt: now })
    }
    setSaved(true)
    setTimeout(() => navigate('/subscriptions'), 800)
  }

  function handleDelete() {
    if (!window.confirm(`Delete "${form.name}"? This cannot be undone.`)) return
    if (existingReminder) deleteReminder(existingReminder.id)
    deleteSubscription(id)
    navigate('/subscriptions')
  }

  const monthly = form.amount && !isNaN(parseFloat(form.amount))
    ? getMonthlyAmount({ ...form, amount: parseFloat(form.amount) }) : 0

  if (atFreeLimit) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="btn-icon"><ArrowLeft size={19} /></button>
          <h1 className="page-header mb-0">Add Subscription</h1>
        </div>
        <div className="card p-8 text-center space-y-4 border-amber-500/30">
          <div className="text-4xl">🔒</div>
          <h2 className="font-bold text-slate-100">You've reached the free limit of {FREE_LIMIT} subscriptions</h2>
          <p className="text-sm text-slate-400">
            Upgrade to Pro to track unlimited subscriptions, plus email scanning, money-leak detection, and more — $10 one-time for 3 years.
          </p>
          <button onClick={() => navigate('/upgrade')} className="btn-primary justify-center mx-auto">
            Upgrade to Pro
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-icon"><ArrowLeft size={19} /></button>
        <div>
          <h1 className="page-header mb-0">{isEditing ? `Edit ${form.name || 'Subscription'}` : 'Add Subscription'}</h1>
          <p className="text-sm text-slate-500">{isEditing ? 'Update subscription details' : 'Track a new recurring charge'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h2 className="section-title">Basic Info</h2>
          <div>
            <label className="label">Name *</label>
            {!isEditing ? (
              <ServiceAutocomplete
                value={form.name}
                onChange={v => set('name', v)}
                onSelect={svc => {
                  set('name', svc.name)
                  set('category', svc.category)
                  if (svc.defaultAmount > 0) set('amount', svc.defaultAmount.toString())
                }}
                error={!!errors.name}
              />
            ) : (
              <input className={`input ${errors.name ? 'border-red-500/60' : ''}`} value={form.name} onChange={e => set('name', e.target.value)} />
            )}
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Billing Cycle *</label>
              <select className="input" value={form.billingCycle} onChange={e => set('billingCycle', e.target.value)}>
                {BILLING_CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount *</label>
              <div className="flex gap-2">
                <select
                  className="input w-24 shrink-0 text-sm px-2"
                  value={form.currency || 'USD'}
                  onChange={e => set('currency', e.target.value)}
                  title="Currency"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">
                    {CURRENCIES.find(c => c.code === (form.currency || 'USD'))?.symbol || '$'}
                  </span>
                  <input className={`input pl-8 ${errors.amount ? 'border-red-500/60' : ''}`} type="number" step="0.01" min="0" placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)} />
                </div>
              </div>
              {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
              {monthly > 0 && form.billingCycle !== 'Monthly' && (
                <p className="text-xs text-slate-500 mt-1">≈ {formatCurrency(monthly)}/mo</p>
              )}
            </div>
            <div>
              <label className="label">Next Billing Date *</label>
              <input className={`input ${errors.nextBillingDate ? 'border-red-500/60' : ''}`} type="date" value={form.nextBillingDate} onChange={e => set('nextBillingDate', e.target.value)} />
              {errors.nextBillingDate && <p className="text-red-400 text-xs mt-1">{errors.nextBillingDate}</p>}
            </div>
          </div>
          <div>
            <label className="label">Payment Method (optional)</label>
            <input className="input" placeholder="e.g. Visa ending 4242, Apple Pay, PayPal..." value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)} />
          </div>
        </div>

        {/* Status */}
        <div className="card p-5 space-y-4">
          <h2 className="section-title">Status & Classification</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Importance</label>
              <select className="input" value={form.importance} onChange={e => set('importance', e.target.value)}>
                {IMPORTANCE.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
          {[
            { key: 'autoRenewal', label: 'Auto-Renewal', sub: 'Renews automatically' },
            { key: 'canDowngrade', label: 'Can Downgrade', sub: 'A cheaper tier exists' },
            { key: 'isTrial', label: 'Free Trial', sub: 'Currently in trial period' },
            { key: 'isPriceIncrease', label: 'Price Increase', sub: 'Price was recently raised' },
          ].map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-700/30">
              <div><div className="text-sm font-medium text-slate-200">{label}</div><div className="text-xs text-slate-600">{sub}</div></div>
              <Toggle value={form[key]} onChange={v => set(key, v)} />
            </div>
          ))}
          {form.isTrial && (
            <div>
              <label className="label">Trial Ends Date</label>
              <input className="input" type="date" value={form.trialEndsDate} onChange={e => set('trialEndsDate', e.target.value)} />
            </div>
          )}
          {form.isPriceIncrease && (
            <div>
              <label className="label">Original Price (before increase)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
                <input className="input pl-7" type="number" step="0.01" placeholder="0.00" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Reminder */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-amber-400" />
              <h2 className="section-title mb-0">Renewal Reminder</h2>
            </div>
            <Toggle value={reminderEnabled} onChange={setReminderEnabled} />
          </div>
          {reminderEnabled && (
            <div>
              <label className="label">Remind me</label>
              <select className="input" value={form.reminderDays} onChange={e => set('reminderDays', e.target.value)}>
                {REMINDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* History */}
        <div className="card p-5 space-y-4">
          <h2 className="section-title">History (optional)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Total Paid So Far ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
                <input className="input pl-7" type="number" step="0.01" min="0" placeholder="0.00" value={form.totalPaid} onChange={e => set('totalPaid', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Months Tracked</label>
              <input className="input" type="number" min="1" placeholder="1" value={form.monthsTracked} onChange={e => set('monthsTracked', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Used By */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-cyan-400" />
            <h2 className="section-title mb-0">Used By</h2>
          </div>
          {household.length === 0 ? (
            <p className="text-sm text-slate-500">
              No family members yet.{' '}
              <Link to="/household" className="text-cyan-400 hover:underline">Add members in Household Hub →</Link>
            </p>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {household.map(member => {
                const selected = (form.usedBy || []).includes(member.id)
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      const current = form.usedBy || []
                      set('usedBy', selected ? current.filter(id => id !== member.id) : [...current, member.id])
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      selected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800/40 text-slate-400 border-slate-700/40 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-base">{member.avatar}</span> {member.name}
                    {selected && <span className="text-cyan-400 text-xs">✓</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="card p-5 space-y-4">
          <h2 className="section-title">Notes & Alternatives</h2>
          <div>
            <label className="label">Notes (optional)</label>
            <textarea className="input min-h-[72px] resize-none" placeholder="Any notes..." value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <div>
            <label className="label">Cheaper Alternative Notes</label>
            <textarea className="input min-h-[60px] resize-none" placeholder="e.g. Could use free tier, Plex instead of Netflix..." value={form.alternativeNotes} onChange={e => set('alternativeNotes', e.target.value)} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className={`btn-primary flex-1 justify-center ${saved ? 'bg-emerald-500 hover:bg-emerald-400' : ''}`}
          >
            {saved ? <><CheckCircle size={15} /> Saved!</> : <><Save size={15} /> {isEditing ? 'Save Changes' : 'Add Subscription'}</>}
          </motion.button>
          {isEditing && (
            <button type="button" onClick={handleDelete} className="btn-danger px-4 py-2.5">
              <Trash2 size={15} /> Delete
            </button>
          )}
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  )
}
