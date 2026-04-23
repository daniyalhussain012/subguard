import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingDown, AlertTriangle, DollarSign, CheckCircle, Flame } from 'lucide-react'
import { useApp } from '../App'
import {
  getMonthlyAmount, getYearlyAmount, formatCurrency,
  CATEGORY_COLORS, CATEGORY_ICONS
} from '../utils/storage'
import { subMonths, format } from 'date-fns'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm shadow-xl">
        <p className="text-slate-300">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">{formatCurrency(p.value)}</p>
        ))}
      </div>
    )
  }
  return null
}

function PieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm shadow-xl">
        <p className="text-slate-300">{name}</p>
        <p className="font-semibold text-teal-400">{formatCurrency(value)}/mo</p>
      </div>
    )
  }
  return null
}

export default function SavingsReport() {
  const { subscriptions, darkMode } = useApp()
  const navigate = useNavigate()

  const active = useMemo(() => subscriptions.filter(s => s.status === 'Active'), [subscriptions])
  const paused = useMemo(() => subscriptions.filter(s => s.status === 'Paused'), [subscriptions])
  const cancelled = useMemo(() => subscriptions.filter(s => s.status === 'Cancelled'), [subscriptions])
  const canLiveWithout = useMemo(() => active.filter(s => s.importance === 'Can Live Without'), [active])

  const totalMonthly = useMemo(() => active.reduce((s, sub) => s + getMonthlyAmount(sub), 0), [active])
  const totalYearly = useMemo(() => active.reduce((s, sub) => s + getYearlyAmount(sub), 0), [active])
  const savedMonthly = useMemo(() => [...paused, ...cancelled].reduce((s, sub) => s + getMonthlyAmount(sub), 0), [paused, cancelled])
  const potentialSavings = useMemo(() => canLiveWithout.reduce((s, sub) => s + getMonthlyAmount(sub), 0), [canLiveWithout])

  // Category breakdown
  const categoryData = useMemo(() => {
    const map = {}
    active.forEach(sub => {
      const key = sub.category
      if (!map[key]) map[key] = 0
      map[key] += getMonthlyAmount(sub)
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value)
  }, [active])

  // Simulated monthly trend (last 6 months)
  const trendData = useMemo(() => {
    const base = totalMonthly
    return Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i)
      const variance = (Math.random() - 0.5) * base * 0.2
      return {
        month: format(date, 'MMM'),
        spend: parseFloat((base + variance).toFixed(2)),
      }
    })
  }, [totalMonthly])

  // Forgotten subscriptions: Active + Can Live Without + not reviewed in 30d
  const forgotten = useMemo(() => active.filter(sub => {
    if (sub.importance !== 'Can Live Without') return false
    if (!sub.lastReviewedAt) return true
    const daysSince = (Date.now() - new Date(sub.lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24)
    return daysSince >= 30
  }), [active])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Money Leaks Report</h1>
        <p className="text-sm text-slate-500 mt-0.5">Where your money is going — and where you can save</p>
      </div>

      {/* Big Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card col-span-2 lg:col-span-1">
          <div className="w-9 h-9 bg-teal-500/10 rounded-lg flex items-center justify-center">
            <DollarSign size={18} className="text-teal-400" />
          </div>
          <div className="mt-1">
            <div className="text-2xl font-bold text-slate-100">{formatCurrency(totalMonthly)}</div>
            <div className="text-xs text-slate-500">Monthly recurring</div>
            <div className="text-xs text-slate-600">{formatCurrency(totalYearly)}/year</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center">
            <CheckCircle size={18} className="text-emerald-400" />
          </div>
          <div className="mt-1">
            <div className="text-2xl font-bold text-emerald-400">{formatCurrency(savedMonthly)}</div>
            <div className="text-xs text-slate-500">Saved/month</div>
            <div className="text-xs text-slate-600">paused & cancelled</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-9 h-9 bg-orange-500/10 rounded-lg flex items-center justify-center">
            <TrendingDown size={18} className="text-orange-400" />
          </div>
          <div className="mt-1">
            <div className="text-2xl font-bold text-orange-400">{formatCurrency(potentialSavings)}</div>
            <div className="text-xs text-slate-500">Potential savings</div>
            <div className="text-xs text-slate-600">can live without</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-9 h-9 bg-red-500/10 rounded-lg flex items-center justify-center">
            <Flame size={18} className="text-red-400" />
          </div>
          <div className="mt-1">
            <div className="text-2xl font-bold text-red-400">{forgotten.length}</div>
            <div className="text-xs text-slate-500">Forgotten subs</div>
            <div className="text-xs text-slate-600">not reviewed in 30d</div>
          </div>
        </div>
      </div>

      {/* Motivational Call-out */}
      {potentialSavings > 0 && (
        <div className="card border-orange-500/30 bg-orange-500/5 p-5 flex items-center gap-4">
          <div className="text-4xl">💡</div>
          <div>
            <div className="font-bold text-orange-300 text-lg">
              You could save {formatCurrency(potentialSavings)}/month
            </div>
            <div className="text-sm text-slate-400 mt-0.5">
              by cutting {canLiveWithout.length} non-essential subscription{canLiveWithout.length > 1 ? 's' : ''}.
              That's <span className="text-orange-300 font-semibold">{formatCurrency(potentialSavings * 12)}/year</span>.
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card p-5">
          <h2 className="section-title">Spend by Category</h2>
          {categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    dataKey="value"
                    nameKey="name"
                    strokeWidth={2}
                    stroke="transparent"
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {categoryData.map(({ name, value }) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[name] || '#6b7280' }} />
                      <span className="text-xs text-slate-400">{CATEGORY_ICONS[name]} {name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{formatCurrency(value)}/mo</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bar Chart — Trend */}
        <div className="card p-5">
          <h2 className="section-title">Monthly Spend Trend</h2>
          <p className="text-xs text-slate-500 -mt-2 mb-4">Last 6 months (simulated for MVP)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trendData} barSize={24}>
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="spend" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forgotten Subscriptions Alert */}
      {forgotten.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-400" />
            <h2 className="section-title mb-0 text-amber-300">Forgotten Subscriptions</h2>
          </div>
          <div className="space-y-2">
            {forgotten.map(sub => (
              <div
                key={sub.id}
                className="card border-amber-500/30 bg-amber-500/5 p-4 flex items-center gap-3 cursor-pointer card-hover"
                onClick={() => navigate(`/edit/${sub.id}`)}
              >
                <span className="text-xl">{CATEGORY_ICONS[sub.category]}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-100 text-sm">{sub.name}</div>
                  <div className="text-xs text-amber-400">Not reviewed in 30+ days · marked "Can Live Without"</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-slate-100 text-sm">{formatCurrency(getMonthlyAmount(sub))}/mo</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Can Live Without List */}
      {canLiveWithout.length > 0 && (
        <div>
          <h2 className="section-title">Can Live Without — Cut These to Save</h2>
          <div className="space-y-2">
            {canLiveWithout.map(sub => (
              <div
                key={sub.id}
                className="card p-4 flex items-center gap-3 cursor-pointer card-hover"
                onClick={() => navigate(`/edit/${sub.id}`)}
              >
                <span className="text-xl">{CATEGORY_ICONS[sub.category]}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-100 text-sm">{sub.name}</div>
                  <div className="text-xs text-slate-500">{sub.category} · {sub.billingCycle}</div>
                  {sub.alternativeNotes && (
                    <div className="text-xs text-teal-400 mt-0.5">💡 {sub.alternativeNotes}</div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-slate-100 text-sm">{formatCurrency(getMonthlyAmount(sub))}/mo</div>
                  <div className="text-xs text-emerald-400">Save {formatCurrency(getYearlyAmount(sub))}/yr</div>
                </div>
              </div>
            ))}
            <div className="card border-orange-500/20 p-3 text-center">
              <span className="text-sm text-orange-400 font-semibold">
                Total potential savings: {formatCurrency(potentialSavings)}/mo · {formatCurrency(potentialSavings * 12)}/yr
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Paused & Cancelled — Money Saved */}
      {(paused.length > 0 || cancelled.length > 0) && (
        <div>
          <h2 className="section-title">Money Saved — Paused & Cancelled</h2>
          <div className="space-y-2">
            {[...paused, ...cancelled].map(sub => (
              <div
                key={sub.id}
                className="card p-4 flex items-center gap-3 cursor-pointer card-hover"
                onClick={() => navigate(`/edit/${sub.id}`)}
              >
                <span className="text-xl">{CATEGORY_ICONS[sub.category]}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-100 text-sm">{sub.name}</div>
                  <div className="text-xs text-slate-500">{sub.status} · {sub.category}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-emerald-400 text-sm">+{formatCurrency(getMonthlyAmount(sub))}/mo saved</div>
                  <div className="text-xs text-slate-500">{formatCurrency(getYearlyAmount(sub))}/yr</div>
                </div>
              </div>
            ))}
            <div className="card border-emerald-500/20 p-3 text-center">
              <span className="text-sm text-emerald-400 font-semibold">
                Total saved: {formatCurrency(savedMonthly)}/mo · {formatCurrency(savedMonthly * 12)}/yr
              </span>
            </div>
          </div>
        </div>
      )}

      {subscriptions.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">📊</div>
          <p className="text-slate-500 text-sm">Add subscriptions to generate your savings report.</p>
        </div>
      )}
    </div>
  )
}
