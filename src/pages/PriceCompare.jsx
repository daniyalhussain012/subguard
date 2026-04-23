import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingDown, ExternalLink, Star, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { useApp } from '../App'
import { getMonthlyAmount, formatCurrency, CATEGORY_ICONS } from '../utils/storage'
import {
  findServiceInDb, detectCurrentPlan, getCheaperPlans,
  getFreeAlternatives, getPaidAlternatives,
} from '../data/priceDatabase'

function PlanRow({ plan, isCurrent, isCheaper, currentMonthly }) {
  const savingsPerMonth = isCheaper && currentMonthly
    ? currentMonthly - plan.monthlyPrice
    : 0

  return (
    <div className={`flex items-center gap-3 p-2.5 rounded-lg border text-sm transition-all ${
      isCurrent
        ? 'bg-cyan-500/10 border-cyan-500/30'
        : isCheaper
          ? 'bg-emerald-500/10 border-emerald-500/25'
          : 'bg-slate-800/40 border-slate-700/40'
    }`}>
      <div className="flex-1 min-w-0">
        <div className={`font-semibold flex items-center gap-1.5 flex-wrap ${
          isCurrent ? 'text-cyan-300' : isCheaper ? 'text-emerald-300' : 'text-slate-400'
        }`}>
          {plan.name}
          {isCurrent && <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full font-bold">Current</span>}
          {isCheaper && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">Cheaper</span>}
        </div>
        {plan.note && <div className="text-xs text-slate-600 mt-0.5">{plan.note}</div>}
      </div>
      <div className="text-right shrink-0">
        <div className={`font-bold ${isCheaper ? 'text-emerald-400' : isCurrent ? 'text-cyan-300' : 'text-slate-300'}`}>
          {formatCurrency(plan.monthlyPrice)}<span className="text-slate-500 text-xs font-normal">/mo</span>
        </div>
        {plan.yearlyPrice && (
          <div className="text-xs text-slate-600">{formatCurrency(plan.yearlyPrice)}/yr</div>
        )}
      </div>
      {isCheaper && savingsPerMonth > 0 && (
        <div className="text-xs font-bold text-emerald-400 shrink-0 ml-1">
          Save {formatCurrency(savingsPerMonth)}/mo
        </div>
      )}
    </div>
  )
}

function ServiceCard({ item }) {
  const { sub, monthly, db, currentPlan, cheaper, free, paid } = item
  const [expanded, setExpanded] = useState(false)
  const bestSaving = cheaper?.length && currentPlan
    ? currentPlan.monthlyPrice - Math.min(...cheaper.map(p => p.monthlyPrice))
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{CATEGORY_ICONS[sub.category] || '📦'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-100">{sub.name}</h3>
            {bestSaving > 0 && (
              <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs">
                💡 Save {formatCurrency(bestSaving)}/mo
              </span>
            )}
            {free?.length > 0 && (
              <span className="badge bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 text-xs">
                ⭐ Free alternative exists
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
            <span>{currentPlan ? `${currentPlan.name}` : 'Unrecognized plan'} — {formatCurrency(monthly)}/mo</span>
            {db.pricePageUrl && (
              <a
                href={db.pricePageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-0.5 transition-colors"
              >
                Check latest price <ExternalLink size={10} />
              </a>
            )}
            <span className="text-slate-700">· Verified {db.lastUpdated}</span>
          </div>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="btn-icon shrink-0"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Plans */}
      {expanded && (
        <div className="space-y-4">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Available Plans</div>
            <div className="space-y-1.5">
              {db.plans.map(p => (
                <PlanRow
                  key={p.name}
                  plan={p}
                  isCurrent={currentPlan?.name === p.name}
                  isCheaper={cheaper?.some(c => c.name === p.name)}
                  currentMonthly={currentPlan?.monthlyPrice}
                />
              ))}
            </div>
          </div>

          {free?.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Star size={11} className="text-yellow-400" /> Free Alternatives
              </div>
              <div className="flex flex-wrap gap-2">
                {free.map(a => (
                  <span
                    key={a.name}
                    className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-xs text-emerald-300"
                  >
                    ⭐ {a.name} — {a.type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {paid?.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Paid Alternatives</div>
              <div className="flex flex-wrap gap-2">
                {paid.map(a => (
                  <span
                    key={a.name}
                    className="px-2.5 py-1 bg-slate-800/40 border border-slate-700/40 rounded-lg text-xs text-slate-400"
                  >
                    {a.name}{a.price > 0 ? ` — ${formatCurrency(a.price)}/mo` : ''} · {a.type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsed quick tip */}
      {!expanded && (cheaper?.length > 0 || free?.length > 0) && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full text-left text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
        >
          <ChevronDown size={12} />
          {cheaper?.length > 0 ? `${cheaper.length} cheaper plan${cheaper.length > 1 ? 's' : ''} available` : ''}
          {cheaper?.length > 0 && free?.length > 0 ? ' · ' : ''}
          {free?.length > 0 ? `${free.length} free alternative${free.length > 1 ? 's' : ''}` : ''}
          — tap to expand
        </button>
      )}
    </motion.div>
  )
}

export default function PriceCompare() {
  const { subscriptions } = useApp()
  const active = useMemo(
    () => subscriptions.filter(s => s.status === 'Active'),
    [subscriptions]
  )

  const analyzed = useMemo(() => active.map(sub => {
    const monthly = getMonthlyAmount(sub)
    const db = findServiceInDb(sub.name)
    if (!db) return { sub, monthly, db: null }
    const currentPlan = detectCurrentPlan(db, monthly)
    const cheaper = getCheaperPlans(db, currentPlan)
    const free = getFreeAlternatives(db)
    const paid = getPaidAlternatives(db)
    return { sub, monthly, db, currentPlan, cheaper, free, paid }
  }), [active])

  const matched = useMemo(() => analyzed.filter(a => a.db), [analyzed])
  const unmatched = useMemo(() => analyzed.filter(a => !a.db), [analyzed])

  const downgradeSavings = useMemo(() => matched.reduce((sum, { cheaper, currentPlan }) => {
    if (!cheaper?.length || !currentPlan) return sum
    const cheapest = Math.min(...cheaper.map(p => p.monthlyPrice))
    return sum + Math.max(0, currentPlan.monthlyPrice - cheapest)
  }, 0), [matched])

  const freeAltCount = useMemo(
    () => matched.filter(({ free }) => free?.length > 0).length,
    [matched]
  )

  const totalMatchedMonthly = useMemo(
    () => matched.reduce((s, { monthly }) => s + monthly, 0),
    [matched]
  )

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <DollarSign size={19} className="text-emerald-400" />
          <h1 className="page-header mb-0">Price Compare</h1>
        </div>
        <p className="page-sub mb-0">See if you're overpaying and discover cheaper alternatives</p>
      </div>

      {/* Savings Summary */}
      <div className="card p-5 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/25">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown size={16} className="text-emerald-400" />
          <h2 className="font-bold text-emerald-300 text-sm uppercase tracking-wide">Your Savings Opportunities</h2>
        </div>
        {active.length === 0 ? (
          <p className="text-sm text-slate-500">Add active subscriptions to see savings opportunities.</p>
        ) : matched.length === 0 ? (
          <p className="text-sm text-slate-500">No pricing data found for your subscriptions yet.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Downgrade savings</div>
              <div className="text-2xl font-bold text-emerald-400">
                {formatCurrency(downgradeSavings)}
                <span className="text-sm text-slate-500 font-normal">/mo</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Free alternatives for</div>
              <div className="text-2xl font-bold text-yellow-400">
                {freeAltCount}
                <span className="text-sm text-slate-500 font-normal"> service{freeAltCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Services analyzed</div>
              <div className="text-2xl font-bold text-cyan-400">
                {matched.length}
                <span className="text-sm text-slate-500 font-normal"> of {active.length}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Yearly savings possible</div>
              <div className="text-2xl font-bold text-emerald-300">
                {formatCurrency(downgradeSavings * 12)}
                <span className="text-sm text-slate-500 font-normal">/yr</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Matched subscriptions */}
      {matched.length > 0 && (
        <div className="space-y-3">
          <div className="section-title">Your Subscriptions — Pricing Breakdown</div>
          {matched.map(item => (
            <ServiceCard key={item.sub.id} item={item} />
          ))}
        </div>
      )}

      {/* Unmatched */}
      {unmatched.length > 0 && (
        <div>
          <div className="section-title flex items-center gap-1.5">
            <Info size={13} /> No Pricing Data Available
          </div>
          <div className="space-y-1.5">
            {unmatched.map(({ sub, monthly }) => (
              <div key={sub.id} className="card p-3 flex items-center gap-3 opacity-60">
                <span className="text-lg">{CATEGORY_ICONS[sub.category] || '📦'}</span>
                <span className="text-sm text-slate-400 flex-1 truncate">{sub.name}</span>
                <span className="text-xs text-slate-600">{formatCurrency(monthly)}/mo</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-700 mt-2">
            Pricing data covers 55+ popular services. More services added regularly.
          </p>
        </div>
      )}
    </div>
  )
}
