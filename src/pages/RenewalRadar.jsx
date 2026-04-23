import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Radar, ShieldCheck, AlertTriangle, XCircle, ChevronDown, ChevronUp, Clock, DollarSign, Zap } from 'lucide-react'
import { useApp } from '../App'
import {
  getMonthlyAmount, formatCurrency, getDaysUntil,
  formatDaysUntil, CATEGORY_ICONS, getCountdown
} from '../utils/storage'
import { format, addDays } from 'date-fns'

const RANGE_OPTIONS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

const LAST_USED_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'this_week' },
  { label: 'This month', value: 'this_month' },
  { label: "Can't remember", value: 'cant_remember' },
]

function CountdownBadge({ dateStr }) {
  const [cd, setCd] = useState(getCountdown(dateStr))
  useEffect(() => {
    const interval = setInterval(() => setCd(getCountdown(dateStr)), 60000)
    return () => clearInterval(interval)
  }, [dateStr])
  if (!cd) return null
  if (cd.expired) return <span className="text-xs font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Overdue</span>
  return (
    <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
      {cd.days > 0 && `${cd.days}d `}{cd.hours}h {cd.minutes}m
    </span>
  )
}

function RiskBadge({ importance }) {
  if (importance === 'Essential') return (
    <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
      <ShieldCheck size={13} /> Essential
    </div>
  )
  if (importance === 'Nice to Have') return (
    <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
      <AlertTriangle size={13} /> Review
    </div>
  )
  return (
    <div className="flex items-center gap-1 text-red-400 text-xs font-semibold">
      <XCircle size={13} /> Cancel Candidate
    </div>
  )
}

function DecisionCard({ sub, onDecision, onUpdateLastUsed, onSnooze }) {
  const [expanded, setExpanded] = useState(false)
  const [lastUsed, setLastUsed] = useState(sub.lastUsed || null)
  const days = getDaysUntil(sub.nextBillingDate)
  const monthly = getMonthlyAmount(sub)
  const isUrgent = days <= 3
  const isAnnual = sub.billingCycle === 'Yearly'
  const totalPaid = sub.totalPaid || 0
  const monthsTracked = sub.monthsTracked || 1

  function handleLastUsed(val) {
    setLastUsed(val)
    onUpdateLastUsed(sub.id, val)
  }

  const borderColor = sub.importance === 'Essential' ? 'border-emerald-500/25' :
    sub.importance === 'Nice to Have' ? 'border-amber-500/25' : 'border-red-500/25'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card ${borderColor} ${isUrgent ? 'pulse-glow' : ''} overflow-hidden`}
    >
      {/* Card Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="text-2xl">{CATEGORY_ICONS[sub.category] || '📦'}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-100">{sub.name}</span>
            {isAnnual && <span className="badge bg-purple-500/20 text-purple-400 border border-purple-500/30">Annual</span>}
            {sub.isTrial && <span className="badge bg-pink-500/20 text-pink-400 border border-pink-500/30">Trial</span>}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <RiskBadge importance={sub.importance} />
            <span className="text-xs text-slate-500">{sub.category}</span>
            <CountdownBadge dateStr={sub.nextBillingDate} />
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-bold text-slate-100">{formatCurrency(sub.amount)}</div>
          <div className="text-xs text-slate-500">{sub.billingCycle.toLowerCase()}</div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-slate-500 shrink-0" /> : <ChevronDown size={16} className="text-slate-500 shrink-0" />}
      </div>

      {/* Annual Warning */}
      {isAnnual && days <= 14 && (
        <div className="mx-4 mb-3 p-2.5 bg-purple-500/10 border border-purple-500/25 rounded-lg">
          <p className="text-xs text-purple-300 font-semibold">
            ⚠️ This is a {formatCurrency(sub.amount)} annual charge, not monthly! That's {formatCurrency(sub.amount / 12)}/mo.
          </p>
        </div>
      )}

      {/* Expanded Decision Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-slate-700/40 pt-4">
              {/* Price history */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="card p-3 text-center">
                  <div className="text-xs text-slate-500 mb-1">Total paid</div>
                  <div className="font-bold text-slate-100">{formatCurrency(totalPaid)}</div>
                  <div className="text-xs text-slate-600">over {monthsTracked} month{monthsTracked !== 1 ? 's' : ''}</div>
                </div>
                <div className="card p-3 text-center">
                  <div className="text-xs text-slate-500 mb-1">Monthly equiv.</div>
                  <div className="font-bold text-slate-100">{formatCurrency(monthly)}</div>
                  <div className="text-xs text-slate-600">normalized</div>
                </div>
              </div>

              {/* Usage check */}
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  When did you last use {sub.name}? Be honest.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {LAST_USED_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleLastUsed(opt.value)}
                      className={`text-xs py-2 px-3 rounded-lg border font-medium transition-all ${
                        lastUsed === opt.value
                          ? opt.value === 'cant_remember'
                            ? 'border-red-500/60 bg-red-500/15 text-red-300'
                            : 'border-cyan-500/60 bg-cyan-500/15 text-cyan-300'
                          : 'border-slate-700/40 bg-slate-800/40 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {lastUsed === 'cant_remember' && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                  >
                    <p className="text-sm font-bold text-red-300">
                      🚨 You're about to pay {formatCurrency(sub.amount)} for something you don't use!
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Decision Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDecision(sub.id, 'keep')}
                  className="py-2.5 rounded-lg font-bold text-sm bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-all flex items-center justify-center gap-2"
                >
                  ✓ KEEP
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDecision(sub.id, 'cancel')}
                  className="py-2.5 rounded-lg font-bold text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-all flex items-center justify-center gap-2"
                >
                  ✗ CANCEL
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDecision(sub.id, 'downgrade')}
                  className="py-2.5 rounded-lg font-bold text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 transition-all flex items-center justify-center gap-2"
                >
                  ↓ DOWNGRADE
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSnooze(sub.id)}
                  className="py-2.5 rounded-lg font-bold text-sm bg-slate-700/40 hover:bg-slate-700/60 text-slate-400 border border-slate-600/30 transition-all flex items-center justify-center gap-2"
                >
                  💤 SNOOZE 1d
                </motion.button>
              </div>

              {/* Alternative notes */}
              {sub.alternativeNotes && (
                <div className="text-xs text-cyan-400 p-2 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                  💡 Alternative idea: {sub.alternativeNotes}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function RenewalRadar() {
  const { subscriptions, updateSubscription, darkMode } = useApp()
  const navigate = useNavigate()
  const [range, setRange] = useState(30)

  const upcoming = useMemo(() => {
    return subscriptions
      .filter(s => {
        if (s.status !== 'Active') return false
        const d = getDaysUntil(s.nextBillingDate)
        return d >= 0 && d <= range
      })
      .sort((a, b) => getDaysUntil(a.nextBillingDate) - getDaysUntil(b.nextBillingDate))
  }, [subscriptions, range])

  const insights = useMemo(() => {
    const highestRisk = upcoming
      .filter(s => s.importance === 'Can Live Without')
      .sort((a, b) => getMonthlyAmount(b) - getMonthlyAmount(a))[0]

    const potentialSavings = upcoming
      .filter(s => s.importance === 'Can Live Without')
      .reduce((sum, s) => sum + getMonthlyAmount(s), 0)

    const needsDecision = upcoming.filter(s => getDaysUntil(s.nextBillingDate) <= 2).length

    const keptThisMonth = subscriptions.filter(s => s.decisionStatus === 'keep').length
    const cancelledThisMonth = subscriptions.filter(s => s.status === 'Cancelled').length

    return { highestRisk, potentialSavings, needsDecision, keptThisMonth, cancelledThisMonth }
  }, [upcoming, subscriptions])

  function handleDecision(id, decision) {
    if (decision === 'cancel') {
      updateSubscription(id, { status: 'Cancelled', decisionStatus: 'cancel' })
    } else if (decision === 'keep') {
      updateSubscription(id, { decisionStatus: 'keep', lastReviewedAt: new Date().toISOString() })
    } else if (decision === 'downgrade') {
      updateSubscription(id, { canDowngrade: true, decisionStatus: 'downgrade' })
    }
  }

  function handleSnooze(id) {
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')
    updateSubscription(id, { snoozedUntil: tomorrow, decisionStatus: 'snoozed' })
  }

  function handleUpdateLastUsed(id, val) {
    updateSubscription(id, { lastUsed: val })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radar size={20} className="text-cyan-400" />
            <h1 className="page-header mb-0">Renewal Radar</h1>
          </div>
          <p className="page-sub mb-0">Make keep/cancel decisions before charges hit</p>
        </div>
        {/* Range toggle */}
        <div className="flex rounded-lg border border-slate-700/50 overflow-hidden">
          {RANGE_OPTIONS.map(opt => (
            <button
              key={opt.days}
              onClick={() => setRange(opt.days)}
              className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                range === opt.days
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Smart Insights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {insights.highestRisk && (
          <div className="card border-red-500/25 p-3 col-span-2 flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div className="min-w-0">
              <div className="text-xs font-bold text-red-400 uppercase tracking-wide">Highest Risk This Week</div>
              <div className="text-sm font-semibold text-slate-200 truncate">{insights.highestRisk.name}</div>
              <div className="text-xs text-slate-500">{formatCurrency(getMonthlyAmount(insights.highestRisk))}/mo · Can Live Without</div>
            </div>
          </div>
        )}
        <div className="card border-amber-500/25 p-3 flex items-center gap-2">
          <span className="text-xl">💰</span>
          <div>
            <div className="text-xs font-bold text-amber-400">Potential savings</div>
            <div className="text-sm font-semibold text-slate-200">{formatCurrency(insights.potentialSavings)}/mo</div>
          </div>
        </div>
        <div className="card border-red-500/25 p-3 flex items-center gap-2">
          <span className="text-xl">⏰</span>
          <div>
            <div className="text-xs font-bold text-red-400">Decide in 48h</div>
            <div className="text-sm font-semibold text-slate-200">{insights.needsDecision} renewal{insights.needsDecision !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {/* Renewal Timeline */}
      <div>
        <div className="section-title">
          {upcoming.length} Renewal{upcoming.length !== 1 ? 's' : ''} in Next {range} Days
        </div>
        {upcoming.length === 0 ? (
          <div className="card p-10 text-center">
            <ShieldCheck size={40} className="text-emerald-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-200 mb-1">All Clear!</h3>
            <p className="text-sm text-slate-500">No renewals in the next {range} days.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(sub => (
              <DecisionCard
                key={sub.id}
                sub={sub}
                onDecision={handleDecision}
                onUpdateLastUsed={handleUpdateLastUsed}
                onSnooze={handleSnooze}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
