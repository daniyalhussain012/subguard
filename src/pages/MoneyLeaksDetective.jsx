import React, { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingDown, AlertTriangle, Copy, Download, CheckCircle, DollarSign } from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { subMonths, format } from 'date-fns'
import { useApp } from '../App'
import {
  getMonthlyAmount, getYearlyAmount, formatCurrency,
  CATEGORY_COLORS, CATEGORY_ICONS, getDaysUntil
} from '../utils/storage'

const CAT_GROUPS = {
  'Entertainment': ['Streaming', 'Music', 'Gaming', 'App Store'],
  'Productivity': ['Software', 'Cloud Storage', 'Phone/Internet'],
  'Health & Fitness': ['Fitness', 'Insurance'],
  'Shopping & Food': ['Shopping', 'Food Delivery', 'Subscription Box'],
  'Information': ['News/Magazine'],
  'Financial': ['Bank Fee', 'Installment Plan', 'Recurring Donation'],
  'Utilities': ['Utilities'],
  'Other': ['Membership', 'Other'],
}

function PieTooltip({ active, payload }) {
  if (active && payload?.length) {
    const { name, value } = payload[0].payload
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="text-slate-300 font-semibold">{name}</p>
        <p className="text-cyan-400 font-bold">{formatCurrency(value)}/mo</p>
      </div>
    )
  }
  return null
}

function BarTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="text-slate-400">{label}</p>
        <p className="text-cyan-400 font-bold">{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function MoneyLeaksDetective() {
  const { subscriptions, darkMode } = useApp()
  const navigate = useNavigate()
  const reportRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const active = useMemo(() => subscriptions.filter(s => s.status === 'Active'), [subscriptions])
  const paused = useMemo(() => subscriptions.filter(s => s.status === 'Paused'), [subscriptions])
  const cancelled = useMemo(() => subscriptions.filter(s => s.status === 'Cancelled'), [subscriptions])

  const currencyTotals = useMemo(() => {
    const map = {}
    active.forEach(sub => {
      const cur = sub.currency || 'USD'
      if (!map[cur]) map[cur] = { monthly: 0, yearly: 0 }
      map[cur].monthly += getMonthlyAmount(sub)
      map[cur].yearly += getYearlyAmount(sub)
    })
    return Object.entries(map).map(([currency, v]) => ({
      currency,
      monthly: parseFloat(v.monthly.toFixed(2)),
      yearly: parseFloat(v.yearly.toFixed(2)),
    })).sort((a, b) => b.monthly - a.monthly)
  }, [active])

  const totalMonthly = useMemo(() => currencyTotals.reduce((s, c) => s + c.monthly, 0), [currencyTotals])
  const totalYearly = useMemo(() => currencyTotals.reduce((s, c) => s + c.yearly, 0), [currencyTotals])
  const savedMonthly = useMemo(() => [...paused, ...cancelled].reduce((s, sub) => s + getMonthlyAmount(sub), 0), [paused, cancelled])

  const canLiveWithout = useMemo(() => active.filter(s => s.importance === 'Can Live Without'), [active])
  const potentialSavings = useMemo(() => canLiveWithout.reduce((s, sub) => s + getMonthlyAmount(sub), 0), [canLiveWithout])

  const smallCharges = useMemo(() => active.filter(s => getMonthlyAmount(s) < 5), [active])
  const smallTotal = useMemo(() => smallCharges.reduce((s, sub) => s + getMonthlyAmount(sub), 0), [smallCharges])

  const annualCharges = useMemo(() => active.filter(s => s.billingCycle === 'Yearly').sort((a, b) => getDaysUntil(a.nextBillingDate) - getDaysUntil(b.nextBillingDate)), [active])

  const forgotten = useMemo(() => active.filter(sub => {
    if (sub.importance !== 'Can Live Without') return false
    if (!sub.lastReviewedAt) return true
    return (Date.now() - new Date(sub.lastReviewedAt).getTime()) / 86400000 >= 30
  }), [active])

  // Category breakdown
  const categoryData = useMemo(() => {
    const map = {}
    active.forEach(sub => {
      if (!map[sub.category]) map[sub.category] = 0
      map[sub.category] += getMonthlyAmount(sub)
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value)
  }, [active])

  // 6-month trend (simulated)
  const trendData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i)
      const variance = (Math.sin(i * 0.8) * 0.15 + (Math.random() - 0.5) * 0.1) * totalMonthly
      return {
        month: format(date, 'MMM'),
        spend: parseFloat(Math.max(0, totalMonthly + variance).toFixed(2)),
      }
    })
  }, [totalMonthly])

  async function handleDownload() {
    if (!reportRef.current) return
    setDownloading(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#0F172A',
        scale: 2,
      })
      const link = document.createElement('a')
      link.download = `renewbell-leaks-report-${format(new Date(), 'yyyy-MM-dd')}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (e) {
      console.error('Download failed', e)
    }
    setDownloading(false)
  }

  function handleCopyReport() {
    const top3 = [...active].sort((a, b) => getMonthlyAmount(b) - getMonthlyAmount(a)).slice(0, 3)
    const text = `
RenewBell Money Leaks Report — ${format(new Date(), 'MMMM d, yyyy')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total monthly spend: ${formatCurrency(totalMonthly)}
Annual spend: ${formatCurrency(totalYearly)}
Potential monthly savings: ${formatCurrency(potentialSavings)}
Already saved (paused/cancelled): ${formatCurrency(savedMonthly)}/mo

Top 3 most expensive:
${top3.map((s, i) => `  ${i + 1}. ${s.name} — ${formatCurrency(getMonthlyAmount(s))}/mo`).join('\n')}

Cancel candidates (${canLiveWithout.length}):
${canLiveWithout.map(s => `  • ${s.name} — ${formatCurrency(getMonthlyAmount(s))}/mo`).join('\n')}

Generated by RenewBell — Never miss a renewal again.
`.trim()
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={19} className="text-orange-400" />
            <h1 className="page-header mb-0">Money Leaks Detective</h1>
          </div>
          <p className="page-sub mb-0">Find every dollar quietly leaving your account each month</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopyReport} className="btn-secondary text-xs">
            {copied ? <><CheckCircle size={13} /> Copied!</> : <><Copy size={13} /> Copy Report</>}
          </button>
          <button onClick={handleDownload} disabled={downloading} className="btn-secondary text-xs">
            {downloading ? 'Saving...' : <><Download size={13} /> Download PNG</>}
          </button>
        </div>
      </div>

      {/* Report Content (captured for download) */}
      <div ref={reportRef} className="space-y-6">

        {/* Big number headline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card border-orange-500/25 bg-orange-500/5 p-6 text-center"
        >
          <p className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-2">Total Monthly Money Leaving Your Account</p>
          {currencyTotals.length <= 1 ? (
            <>
              <p className="text-5xl font-black text-slate-100">{formatCurrency(currencyTotals[0]?.monthly ?? 0, currencyTotals[0]?.currency ?? 'USD')}</p>
              <p className="text-slate-500 mt-1 text-sm">{formatCurrency(currencyTotals[0]?.yearly ?? 0, currencyTotals[0]?.currency ?? 'USD')}/year across {active.length} active charges</p>
            </>
          ) : (
            <>
              <div className="flex flex-wrap justify-center gap-4 mb-2">
                {currencyTotals.map(({ currency, monthly }) => (
                  <div key={currency} className="text-center">
                    <p className="text-4xl font-black text-slate-100">{formatCurrency(monthly, currency)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{currency}/month</p>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-sm">{active.length} active charges across {currencyTotals.length} currencies</p>
            </>
          )}
        </motion.div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Saved Monthly', value: formatCurrency(savedMonthly), sub: 'paused & cancelled', color: 'text-emerald-400' },
            { label: 'Potential Savings', value: formatCurrency(potentialSavings), sub: 'cancel non-essentials', color: 'text-orange-400' },
            { label: 'Forgotten Charges', value: forgotten.length, sub: 'not reviewed 30d+', color: 'text-red-400' },
            { label: 'Small Leaks', value: formatCurrency(smallTotal), sub: `${smallCharges.length} charges under $5`, color: 'text-amber-400' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="stat-card">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</div>
              <div className={`text-xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-slate-600">{sub}</div>
            </div>
          ))}
        </div>

        {/* Savings Call-out */}
        {potentialSavings > 0 && (
          <div className="card border-cyan-500/25 p-5 flex items-center gap-4">
            <span className="text-4xl">💡</span>
            <div>
              <p className="font-bold text-cyan-300 text-lg">
                Cut {canLiveWithout.length} non-essential subscription{canLiveWithout.length !== 1 ? 's' : ''} — save {formatCurrency(potentialSavings)}/month
              </p>
              <p className="text-sm text-slate-400 mt-0.5">That's <span className="font-bold text-cyan-300">{formatCurrency(potentialSavings * 12)}/year</span> back in your pocket</p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Category Donut */}
          <div className="card p-5">
            <span className="section-title">Spend by Category</span>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" strokeWidth={0}>
                      {categoryData.map(entry => (
                        <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {categoryData.map(({ name, value }) => (
                    <div key={name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[name] || '#6b7280' }} />
                        <span className="text-slate-500">{CATEGORY_ICONS[name]} {name}</span>
                      </div>
                      <span className="font-semibold text-slate-300">{formatCurrency(value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-sm text-center py-8">Add subscriptions to see breakdown</p>
            )}
          </div>

          {/* Bar Chart Trend */}
          <div className="card p-5">
            <span className="section-title">6-Month Spend Trend</span>
            <p className="text-xs text-slate-600 -mt-1 mb-3">Simulated trend based on current charges</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData} barSize={22}>
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${Math.round(v)}`} />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="spend" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* The Annual Trap */}
        {annualCharges.length > 0 && (
          <div>
            <span className="section-title">📅 The Annual Trap</span>
            <div className="space-y-2">
              {annualCharges.map(sub => (
                <div key={sub.id} className="card p-4 flex items-center gap-3 card-hover" onClick={() => navigate(`/edit/${sub.id}`)}>
                  <span className="text-xl">{CATEGORY_ICONS[sub.category]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-100 text-sm">{sub.name}</div>
                    <div className="text-xs text-slate-500">Annual · renews {format(new Date(sub.nextBillingDate), 'MMM d, yyyy')}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-purple-400">{formatCurrency(sub.amount)}</div>
                    <div className="text-xs text-slate-500">one-time charge</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Small But Adding Up */}
        {smallCharges.length > 0 && (
          <div>
            <span className="section-title">🪤 Small But Adding Up (under $5/mo)</span>
            <div className="card p-4 space-y-2">
              {smallCharges.map(sub => (
                <div key={sub.id} className="flex items-center gap-3 py-1">
                  <span className="text-base">{CATEGORY_ICONS[sub.category]}</span>
                  <span className="text-sm text-slate-300 flex-1">{sub.name}</span>
                  <span className="text-xs font-semibold text-amber-400">{formatCurrency(getMonthlyAmount(sub))}/mo</span>
                </div>
              ))}
              <div className="border-t border-slate-700/40 pt-2 flex justify-between">
                <span className="text-xs font-bold text-slate-400">Combined total</span>
                <span className="text-xs font-bold text-amber-400">{formatCurrency(smallTotal)}/mo · {formatCurrency(smallTotal * 12)}/yr</span>
              </div>
            </div>
          </div>
        )}

        {/* Forgotten + Cancel Candidates */}
        {(forgotten.length > 0 || canLiveWithout.length > 0) && (
          <div>
            <span className="section-title">🚨 Cancel Candidates</span>
            <div className="space-y-2">
              {canLiveWithout.map(sub => (
                <div key={sub.id} className="card card-hover p-4 flex items-center gap-3" onClick={() => navigate(`/cancellation`)}>
                  <span className="text-xl">{CATEGORY_ICONS[sub.category]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-100 text-sm">{sub.name}</div>
                    <div className="text-xs text-slate-500">{sub.category} · Can Live Without</div>
                    {sub.alternativeNotes && <div className="text-xs text-cyan-400 mt-0.5">💡 {sub.alternativeNotes}</div>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-red-400 text-sm">{formatCurrency(getMonthlyAmount(sub))}/mo</div>
                    <div className="text-xs text-emerald-400">Save {formatCurrency(getYearlyAmount(sub))}/yr</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
