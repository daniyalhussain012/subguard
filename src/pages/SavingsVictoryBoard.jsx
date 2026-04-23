import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Trophy, TrendingDown, CheckCircle, Star, Zap } from 'lucide-react'
import { useApp } from '../App'
import { getMonthlyAmount, getYearlyAmount, formatCurrency, CATEGORY_ICONS } from '../utils/storage'
import CountUp from '../components/CountUp'

const MILESTONES = [
  { amount: 10, label: 'First $10 Saved', icon: '🌱', color: 'text-emerald-400' },
  { amount: 50, label: '$50 Saved!', icon: '💪', color: 'text-cyan-400' },
  { amount: 100, label: '$100 Saved!', icon: '🎉', color: 'text-yellow-400' },
  { amount: 500, label: '$500 Saved!', icon: '🏆', color: 'text-orange-400' },
  { amount: 1000, label: '$1,000 Saved!', icon: '💎', color: 'text-purple-400' },
]

function MilestoneCard({ milestone, achieved, savedMonthly }) {
  const progress = Math.min((savedMonthly * 12) / milestone.amount * 100, 100)
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`card p-4 transition-all ${achieved ? 'border-yellow-500/30 bg-yellow-500/5' : 'opacity-50'}`}
    >
      <div className="text-2xl mb-1">{milestone.icon}</div>
      <div className={`font-bold text-sm ${achieved ? milestone.color : 'text-slate-500'}`}>{milestone.label}</div>
      {!achieved && (
        <div className="mt-2">
          <div className="h-1.5 bg-slate-800 rounded-full">
            <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-xs text-slate-600 mt-1">{Math.round(progress)}% there</div>
        </div>
      )}
      {achieved && <div className="text-xs text-yellow-400 mt-0.5">✓ Achieved!</div>}
    </motion.div>
  )
}

export default function SavingsVictoryBoard() {
  const { subscriptions, cancellations, darkMode } = useApp()

  const active = useMemo(() => subscriptions.filter(s => s.status === 'Active'), [subscriptions])
  const paused = useMemo(() => subscriptions.filter(s => s.status === 'Paused'), [subscriptions])
  const cancelled = useMemo(() => subscriptions.filter(s => s.status === 'Cancelled'), [subscriptions])

  const savedMonthly = useMemo(() =>
    [...paused, ...cancelled].reduce((s, sub) => s + getMonthlyAmount(sub), 0),
    [paused, cancelled])

  const savedYearly = savedMonthly * 12

  const top3Cancelled = useMemo(() =>
    [...cancelled].sort((a, b) => getMonthlyAmount(b) - getMonthlyAmount(a)).slice(0, 3),
    [cancelled])

  const potentialMonthly = useMemo(() =>
    active.filter(s => s.importance === 'Can Live Without').reduce((s, sub) => s + getMonthlyAmount(sub), 0),
    [active])

  const downgradeOpportunities = useMemo(() =>
    active.filter(s => s.canDowngrade),
    [active])

  const monthsActive = Math.max(1, Math.round(
    subscriptions.reduce((s, sub) => s + (sub.monthsTracked || 0), 0) / Math.max(subscriptions.length, 1)
  ))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={20} className="text-yellow-400" />
          <h1 className="page-header mb-0">Savings Victory Board</h1>
        </div>
        <p className="page-sub mb-0">Your financial wins — every cancelled subscription is a victory</p>
      </div>

      {/* Hero Savings Number */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card border-yellow-500/25 bg-gradient-to-br from-yellow-500/5 to-transparent p-8 text-center"
      >
        <div className="text-5xl mb-4">🏆</div>
        <p className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-2">Total Money Saved</p>
        <p className="text-6xl font-black text-slate-100">
          <CountUp target={savedMonthly} prefix="$" decimals={2} duration={1500} />
          <span className="text-2xl text-slate-500">/mo</span>
        </p>
        <p className="text-2xl font-bold text-yellow-400 mt-2">
          = <CountUp target={savedYearly} prefix="$" decimals={2} duration={1800} />/year
        </p>
        <p className="text-sm text-slate-500 mt-3">
          from {paused.length + cancelled.length} paused or cancelled subscription{paused.length + cancelled.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: '✅', label: 'Cancelled', value: cancelled.length, sub: 'all time', color: 'text-emerald-400' },
          { icon: '⏸️', label: 'Paused', value: paused.length, sub: 'not deleted', color: 'text-amber-400' },
          { icon: '💰', label: 'Potential more', value: formatCurrency(potentialMonthly) + '/mo', sub: 'cut non-essentials', color: 'text-cyan-400' },
          { icon: '📅', label: 'Months tracked', value: monthsActive, sub: 'subscription history', color: 'text-purple-400' },
        ].map(({ icon, label, value, sub, color }) => (
          <div key={label} className="stat-card text-center">
            <div className="text-2xl">{icon}</div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
            <div className="text-xs text-slate-600">{sub}</div>
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div>
        <span className="section-title">Savings Milestones</span>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {MILESTONES.map(m => (
            <MilestoneCard
              key={m.amount}
              milestone={m}
              achieved={savedYearly >= m.amount}
              savedMonthly={savedMonthly}
            />
          ))}
        </div>
      </div>

      {/* Cancelled Hall of Fame */}
      {cancelled.length > 0 && (
        <div>
          <span className="section-title">🏅 Cancelled Subscriptions — Your Victories</span>
          <div className="space-y-2">
            {[...cancelled].sort((a, b) => getMonthlyAmount(b) - getMonthlyAmount(a)).map((sub, i) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-4 flex items-center gap-3"
              >
                <div className="w-8 text-center">
                  {i === 0 && <span className="text-xl">🥇</span>}
                  {i === 1 && <span className="text-xl">🥈</span>}
                  {i === 2 && <span className="text-xl">🥉</span>}
                  {i > 2 && <span className="text-sm text-slate-600 font-bold">#{i + 1}</span>}
                </div>
                <span className="text-xl">{CATEGORY_ICONS[sub.category]}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-300 line-through text-sm">{sub.name}</div>
                  <div className="text-xs text-slate-600">{sub.category} · {sub.billingCycle}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-emerald-400 text-sm">+{formatCurrency(getMonthlyAmount(sub))}/mo saved</div>
                  <div className="text-xs text-slate-600">= {formatCurrency(getYearlyAmount(sub))}/yr</div>
                </div>
              </motion.div>
            ))}
            <div className="card border-emerald-500/25 p-3 text-center">
              <span className="text-sm font-bold text-emerald-400">Total from cancellations: {formatCurrency(cancelled.reduce((s, sub) => s + getMonthlyAmount(sub), 0))}/mo · {formatCurrency(cancelled.reduce((s, sub) => s + getYearlyAmount(sub), 0))}/yr</span>
            </div>
          </div>
        </div>
      )}

      {/* Downgrade Opportunities */}
      {downgradeOpportunities.length > 0 && (
        <div>
          <span className="section-title">⬇️ Downgrade Opportunities</span>
          <div className="space-y-2">
            {downgradeOpportunities.map(sub => (
              <div key={sub.id} className="card p-4 flex items-center gap-3">
                <span className="text-xl">{CATEGORY_ICONS[sub.category]}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-200 text-sm">{sub.name}</div>
                  <div className="text-xs text-cyan-400 mt-0.5">💡 {sub.alternativeNotes || 'A cheaper tier is available'}</div>
                </div>
                <div className="text-sm font-bold text-slate-100">{formatCurrency(getMonthlyAmount(sub))}/mo</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {cancelled.length === 0 && paused.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <h3 className="font-bold text-slate-200 mb-2">No victories yet — let's change that!</h3>
          <p className="text-sm text-slate-500 mb-4">Review your subscriptions and cancel the ones you don't use. Every cancellation is money back in your pocket.</p>
        </div>
      )}

      {/* Motivational footer */}
      <div className="card border-cyan-500/15 p-5 text-center">
        <Zap size={20} className="text-cyan-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-200">Still active: {formatCurrency(potentialMonthly)}/mo in non-essential subscriptions</p>
        <p className="text-xs text-slate-500 mt-1">Cancel them all to save {formatCurrency(potentialMonthly * 12)}/year more</p>
      </div>
    </div>
  )
}
