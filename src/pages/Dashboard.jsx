import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  ShieldAlert, TrendingDown, CreditCard, Flame, Plus,
  Radar, Mail, Users2, ArrowRight, X, Zap, AlertTriangle,
  CheckCircle, Bell, DollarSign
} from 'lucide-react'
import { useApp } from '../App'
import {
  getMonthlyAmount, getYearlyAmount, formatCurrency, formatMonthlyByCurrency,
  getDaysUntil, formatDaysUntil, CATEGORY_ICONS, generateSmartAlerts
} from '../utils/storage'
import CountUp from '../components/CountUp'

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.3 } }),
}

function StatCard({ icon: Icon, label, value, sub, color, index, onClick }) {
  const colors = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
  }
  const [iconColor, bg] = colors[color]?.split(' ') || ['text-cyan-400', 'bg-cyan-500/10']
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="show"
      className={`stat-card ${onClick ? 'card-hover' : ''}`}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon size={17} className={iconColor} />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-100">{value}</div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
        {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
      </div>
    </motion.div>
  )
}

function AlertCard({ alert, onDismiss, onAction }) {
  const colors = {
    danger: 'border-red-500/25 bg-red-500/5',
    warning: 'border-amber-500/25 bg-amber-500/5',
    info: 'border-cyan-500/25 bg-cyan-500/5',
    success: 'border-emerald-500/25 bg-emerald-500/5',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 30 }}
      className={`card p-3 flex items-start gap-3 ${colors[alert.type] || colors.info}`}
    >
      <span className="text-lg shrink-0 mt-0.5">{alert.icon}</span>
      <p className="flex-1 text-sm text-slate-300 leading-snug">{alert.message}</p>
      <div className="flex items-center gap-1.5 shrink-0">
        {alert.action && (
          <button onClick={() => onAction(alert)} className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold whitespace-nowrap">
            {alert.action}
          </button>
        )}
        <button onClick={() => onDismiss(alert.id)} className="btn-icon p-1">
          <X size={13} />
        </button>
      </div>
    </motion.div>
  )
}

function WeeklyTimeline({ subscriptions }) {
  const days = useMemo(() => {
    const result = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const dateStr = format(d, 'yyyy-MM-dd')
      const charges = subscriptions.filter(s => s.status === 'Active' && s.nextBillingDate?.slice(0, 10) === dateStr)
      result.push({ date: d, dateStr, charges, dayName: format(d, 'EEE'), dayNum: format(d, 'd'), isToday: i === 0 })
    }
    return result
  }, [subscriptions])

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map(({ date, dayName, dayNum, charges, isToday }) => (
        <div key={dayNum} className={`card p-2 text-center min-h-[80px] ${isToday ? 'border-cyan-500/40 bg-cyan-500/5' : ''}`}>
          <div className={`text-[10px] font-bold uppercase ${isToday ? 'text-cyan-400' : 'text-slate-500'}`}>{dayName}</div>
          <div className={`text-sm font-bold ${isToday ? 'text-cyan-300' : 'text-slate-300'}`}>{dayNum}</div>
          <div className="space-y-0.5 mt-1">
            {charges.slice(0, 2).map(sub => (
              <div key={sub.id} className={`text-[9px] rounded px-1 py-0.5 font-medium leading-tight truncate ${
                sub.importance === 'Can Live Without' ? 'bg-red-500/20 text-red-400' :
                sub.importance === 'Nice to Have' ? 'bg-amber-500/20 text-amber-400' :
                'bg-emerald-500/20 text-emerald-400'
              }`}
                title={sub.name}>
                {sub.name.length > 6 ? sub.name.slice(0, 6) + '…' : sub.name}
              </div>
            ))}
            {charges.length > 2 && <div className="text-[9px] text-slate-600">+{charges.length - 2}</div>}
            {charges.length === 0 && <div className="text-[10px] text-slate-700 mt-1">—</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { subscriptions, reminders, household, dismissedAlerts, dismissAlert, updateSubscription, darkMode } = useApp()
  const navigate = useNavigate()

  const active = useMemo(() => subscriptions.filter(s => s.status === 'Active'), [subscriptions])
  const paused = useMemo(() => subscriptions.filter(s => s.status === 'Paused'), [subscriptions])
  const cancelled = useMemo(() => subscriptions.filter(s => s.status === 'Cancelled'), [subscriptions])

  const currencyTotals = useMemo(() => {
    const map = {}
    active.forEach(sub => {
      const cur = sub.currency || 'USD'
      if (!map[cur]) map[cur] = 0
      map[cur] += getMonthlyAmount(sub)
    })
    return Object.entries(map).map(([currency, monthly]) => ({ currency, monthly: parseFloat(monthly.toFixed(2)) }))
      .sort((a, b) => b.monthly - a.monthly)
  }, [active])

  const totalMonthly = useMemo(() => currencyTotals.reduce((s, c) => s + c.monthly, 0), [currencyTotals])
  const savedSubs = useMemo(() => [...paused, ...cancelled], [paused, cancelled])
  const savedMonthly = useMemo(() => savedSubs.reduce((s, sub) => s + getMonthlyAmount(sub), 0), [savedSubs])
  const atRiskSubs = useMemo(() =>
    active.filter(s => s.importance === 'Can Live Without' && getDaysUntil(s.nextBillingDate) <= 7 && getDaysUntil(s.nextBillingDate) >= 0),
    [active])
  const atRiskWeekly = useMemo(() => atRiskSubs.reduce((sum, s) => sum + getMonthlyAmount(s), 0), [atRiskSubs])
  // CountUp animates a single number — only usable when all amounts share one currency
  const isSingleCurrency = subs => new Set(subs.map(s => s.currency || 'USD')).size <= 1

  const urgent48 = useMemo(() =>
    active.filter(s => getDaysUntil(s.nextBillingDate) >= 0 && getDaysUntil(s.nextBillingDate) <= 2)
      .sort((a, b) => getDaysUntil(a.nextBillingDate) - getDaysUntil(b.nextBillingDate)),
    [active])

  const allAlerts = useMemo(() => generateSmartAlerts(subscriptions, household), [subscriptions, household])
  const visibleAlerts = useMemo(() => allAlerts.filter(a => !dismissedAlerts.includes(a.id)), [allAlerts, dismissedAlerts])

  function handleAlertAction(alert) {
    if (alert.subId) navigate(`/edit/${alert.subId}`)
  }

  const today = format(new Date(), 'EEEE, MMMM d, yyyy')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Command Center</h1>
          <p className="text-sm text-slate-500 mt-0.5">{today}</p>
        </div>
        <button onClick={() => navigate('/add')} className="btn-primary shrink-0 hidden sm:flex">
          <Plus size={15} /> Add Subscription
        </button>
      </div>

      {/* 48-Hour Urgent Banner */}
      <AnimatePresence>
        {urgent48.length > 0 && urgent48.map((sub, i) => {
          const days = getDaysUntil(sub.nextBillingDate)
          return (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card border-red-500/40 bg-red-500/8 p-4 flex items-center gap-4 pulse-glow"
            >
              <ShieldAlert size={22} className="text-red-400 shrink-0 animate-pulse" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-red-300 text-sm">
                  {days === 0 ? '🚨 CHARGING TODAY' : days === 1 ? '⚠️ CHARGES TOMORROW' : `⚠️ ${days} DAYS LEFT`}
                </div>
                <div className="text-sm text-slate-300 mt-0.5">
                  <span className="font-semibold">{sub.name}</span> will charge <span className="font-bold text-red-300">{formatCurrency(sub.amount)}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => updateSubscription(sub.id, { status: 'Active', decisionStatus: 'keep' })} className="btn-success text-xs">✓ Keep</button>
                <button onClick={() => navigate(`/cancellation`)} className="btn-danger text-xs">✗ Cancel</button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={TrendingDown} label="Monthly Burn" value={
          currencyTotals.length <= 1
            ? <CountUp target={currencyTotals[0]?.monthly ?? 0} prefix={currencyTotals[0]?.currency === 'USD' || !currencyTotals[0] ? '$' : ''} suffix={currencyTotals[0] && currencyTotals[0].currency !== 'USD' ? ` ${currencyTotals[0].currency}` : ''} decimals={2} duration={1000} />
            : <span className="text-sm leading-tight">{currencyTotals.map(c => formatCurrency(c.monthly, c.currency)).join(' + ')}</span>
        } sub={`${active.length} active charges`} color="cyan" index={0} onClick={() => navigate('/leaks')} />
        <StatCard icon={CheckCircle} label="Saved This Month" value={
          isSingleCurrency(savedSubs)
            ? <CountUp target={savedMonthly} prefix="$" decimals={2} duration={1000} />
            : <span className="text-sm leading-tight">{formatMonthlyByCurrency(savedSubs)}</span>
        } sub="paused & cancelled" color="emerald" index={1} onClick={() => navigate('/victory')} />
        <StatCard icon={Flame} label="At Risk This Week" value={
          isSingleCurrency(atRiskSubs)
            ? <CountUp target={atRiskWeekly} prefix="$" decimals={2} duration={1000} />
            : <span className="text-sm leading-tight">{formatMonthlyByCurrency(atRiskSubs)}</span>
        } sub="non-essential renewals" color="amber" index={2} onClick={() => navigate('/radar')} />
        <StatCard icon={CreditCard} label="Active Charges" value={active.length} sub={`${subscriptions.length} total tracked`} color="red" index={3} onClick={() => navigate('/subscriptions')} />
      </div>

      {/* Smart Alerts Feed */}
      <AnimatePresence mode="popLayout">
        {visibleAlerts.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Bell size={14} className="text-slate-500" />
              <span className="section-title mb-0">Smart Alerts</span>
              <span className="badge bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">{visibleAlerts.length}</span>
            </div>
            {visibleAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} onDismiss={dismissAlert} onAction={handleAlertAction} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Timeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="section-title mb-0">Next 7 Days</span>
          <button onClick={() => navigate('/calendar')} className="btn-ghost text-xs">
            Full calendar <ArrowRight size={12} />
          </button>
        </div>
        <WeeklyTimeline subscriptions={subscriptions} />
      </div>

      {/* Quick Actions */}
      <div>
        <span className="section-title">Quick Actions</span>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Mail, label: 'Scan a Receipt', sub: 'Auto-detect from email', to: '/scanner', color: 'text-purple-400 bg-purple-500/10' },
            { icon: Plus, label: 'Add Manually', sub: 'Enter details yourself', to: '/add', color: 'text-cyan-400 bg-cyan-500/10' },
            { icon: Radar, label: 'Review Renewals', sub: 'Decide keep or cancel', to: '/radar', color: 'text-amber-400 bg-amber-500/10' },
            { icon: Users2, label: 'Household Hub', sub: 'Family subscriptions', to: '/household', color: 'text-emerald-400 bg-emerald-500/10' },
          ].map(({ icon: Icon, label, sub, to, color }) => (
            <motion.button
              key={to}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(to)}
              className="card card-hover p-4 text-left flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={17} className={color.split(' ')[0]} />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-slate-200 leading-tight">{label}</div>
                <div className="text-xs text-slate-500 leading-tight mt-0.5">{sub}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {subscriptions.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <h3 className="text-xl font-bold text-slate-100 mb-2">Welcome to RenewBell</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">Add your subscriptions to start tracking renewals and never get surprised by a charge again.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/add')} className="btn-primary"><Plus size={15} /> Add Manually</button>
            <button onClick={() => navigate('/scanner')} className="btn-secondary"><Mail size={15} /> Scan Receipt</button>
          </div>
        </div>
      )}
    </div>
  )
}
