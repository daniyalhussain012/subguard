import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { format, addDays } from 'date-fns'
import {
  XCircle, ExternalLink, CheckSquare, Square, Trophy, ArrowRight,
  Search, AlertTriangle, ArrowLeft, BookOpen, Flag,
} from 'lucide-react'
import { useApp } from '../App'
import { formatCurrency, getMonthlyAmount, formatMonthlyByCurrency, getNextChargeDate, CATEGORY_ICONS, getDaysUntil, formatDaysUntil } from '../utils/storage'
import {
  CANCELLATION_GUIDES, findCancellationGuide, CANCELLATION_CHECKLIST_ITEMS,
  getDifficultyColor, getDifficultyIcon, getDifficultyEmoji, getGuideCategory, GUIDE_CATEGORIES,
} from '../data/cancellationGuides'

// ─── Cancellation Guide Component ─────────────────────────────────────────────

function GuideSteps({ guide, sub }) {
  const [checklist, setChecklist] = useState(sub?.cancellationChecklist || [])
  const { updateSubscription, addCancellation } = useApp()
  const [confNum, setConfNum] = useState('')
  const [logged, setLogged] = useState(false)

  const progress = (checklist.length / CANCELLATION_CHECKLIST_ITEMS.length) * 100

  function toggleCheck(id) {
    const next = checklist.includes(id) ? checklist.filter(c => c !== id) : [...checklist, id]
    setChecklist(next)
    if (sub) updateSubscription(sub.id, { cancellationChecklist: next })
  }

  function handleLogCancellation() {
    if (!sub) return
    const verifyDate = format(addDays(getNextChargeDate(sub), 5), 'yyyy-MM-dd')
    const data = {
      id: uuidv4(),
      subscriptionId: sub.id,
      subscriptionName: sub.name,
      amount: sub.amount,
      billingCycle: sub.billingCycle,
      cancelledAt: format(new Date(), 'yyyy-MM-dd'),
      confirmationNumber: confNum,
      expectedLastCharge: format(getNextChargeDate(sub), 'yyyy-MM-dd'),
      verifyDate,
      verified: null,
      createdAt: new Date().toISOString(),
    }
    addCancellation(data)
    updateSubscription(sub.id, { status: 'Cancelled', cancellationData: data })
    setLogged(true)
  }

  return (
    <div className="space-y-5">
      {/* Header info */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`badge border px-3 py-1 ${getDifficultyColor(guide.difficulty)}`}>
          {getDifficultyIcon(guide.difficulty)} {guide.difficulty} · {guide.estimatedTime}
        </span>
        {guide.url && (
          <a
            href={guide.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs py-1.5"
          >
            <ExternalLink size={12} /> Open Cancel Page
          </a>
        )}
        <span className="text-xs text-slate-600 ml-auto">Last verified: {guide.lastVerified}</span>
      </div>

      {/* Warnings */}
      {guide.warnings.length > 0 && (
        <div className="card border-red-500/25 bg-red-500/5 p-3 space-y-1.5">
          {guide.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-red-300">
              <AlertTriangle size={12} className="shrink-0 mt-0.5" /> {w}
            </div>
          ))}
        </div>
      )}

      {/* Retention tactics warning */}
      {guide.retentionTactics.length > 0 && (
        <div className="card border-amber-500/25 bg-amber-500/5 p-3">
          <p className="text-xs font-bold text-amber-400 mb-1.5">⚠️ Watch for these retention tricks:</p>
          {guide.retentionTactics.map((t, i) => (
            <p key={i} className="text-xs text-slate-400">• {t}</p>
          ))}
        </div>
      )}

      {/* Steps */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Step-by-step:</p>
        <ol className="space-y-2">
          {guide.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="w-5 h-5 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-slate-300">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Tips */}
      {guide.tips.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">💡 Pro tips:</p>
          {guide.tips.map((t, i) => (
            <p key={i} className="text-xs text-slate-500 py-0.5">• {t}</p>
          ))}
        </div>
      )}

      {/* Refund policy */}
      <div className="card bg-slate-800/40 p-3">
        <p className="text-xs font-bold text-slate-400 mb-1">Refund Policy</p>
        <p className="text-xs text-slate-500">{guide.refundPolicy}</p>
      </div>

      {/* Data export */}
      <div className="card bg-slate-800/40 p-3">
        <p className="text-xs font-bold text-slate-400 mb-1">Data Export</p>
        <p className="text-xs text-slate-500">{guide.dataExport}</p>
      </div>

      {/* Checklist (only when linked to a subscription) */}
      {sub && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Cancellation Checklist</p>
            <span className="text-xs text-slate-500">{checklist.length}/{CANCELLATION_CHECKLIST_ITEMS.length} done</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mb-3">
            <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-1.5">
            {CANCELLATION_CHECKLIST_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className="w-full flex items-start gap-3 text-left p-2.5 rounded-lg hover:bg-slate-700/30 transition-colors"
              >
                {checklist.includes(item.id)
                  ? <CheckSquare size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  : <Square size={16} className="text-slate-600 shrink-0 mt-0.5" />
                }
                <span className={`text-sm ${checklist.includes(item.id) ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                  {item.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Log cancellation (only when linked to a subscription) */}
      {sub && !logged && (
        <div className="card p-4 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Log Your Cancellation</p>
          <div>
            <label className="label">Confirmation Number (optional)</label>
            <input
              className="input"
              placeholder="e.g. CXL-12345"
              value={confNum}
              onChange={e => setConfNum(e.target.value)}
            />
          </div>
          <button onClick={handleLogCancellation} className="btn-danger w-full justify-center py-2.5 font-bold">
            <XCircle size={15} /> Mark as Cancelled & Track
          </button>
        </div>
      )}
      {sub && logged && (
        <div className="card border-emerald-500/25 bg-emerald-500/5 p-4 flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <div className="font-bold text-emerald-300">Cancellation logged!</div>
            <div className="text-xs text-slate-400">We'll remind you to verify {sub.name} stopped charging.</div>
          </div>
        </div>
      )}

      {/* Report outdated */}
      <div className="flex items-center justify-end">
        <a
          href={`mailto:feedback@subtracker.app?subject=Outdated guide: ${guide.name}&body=The cancellation guide for ${guide.name} appears to be outdated. Here's what changed:%0A%0A`}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors"
        >
          <Flag size={11} /> Report outdated info
        </a>
      </div>
    </div>
  )
}

// ─── My Subscriptions Tab ─────────────────────────────────────────────────────

function MySubscriptionsTab({ onSelectSub, search }) {
  const { subscriptions } = useApp()

  const activeSubs = useMemo(
    () => subscriptions.filter(s => s.status === 'Active' || s.status === 'Under Review'),
    [subscriptions]
  )

  const filtered = useMemo(() => {
    if (!search) return activeSubs
    const q = search.toLowerCase()
    return activeSubs.filter(s => s.name.toLowerCase().includes(q))
  }, [activeSubs, search])

  if (filtered.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="text-5xl mb-3">{activeSubs.length === 0 ? '✅' : '🔍'}</div>
        <h3 className="font-bold text-slate-200 mb-1">
          {activeSubs.length === 0 ? 'Nothing to cancel!' : 'No results'}
        </h3>
        <p className="text-sm text-slate-500">
          {activeSubs.length === 0
            ? 'All your active subscriptions are shown here.'
            : 'Try a different search term.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {filtered.map(sub => {
        const guide = findCancellationGuide(sub.name)
        const days = getDaysUntil(sub.nextBillingDate)
        return (
          <motion.div
            key={sub.id}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            onClick={() => onSelectSub(sub.id)}
            className="card card-hover p-4 flex items-center gap-3 cursor-pointer"
          >
            <span className="text-2xl">{CATEGORY_ICONS[sub.category] || '📦'}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-100">{sub.name}</div>
              <div className="flex items-center gap-2 text-xs flex-wrap mt-0.5">
                <span className="text-slate-500">{formatCurrency(getMonthlyAmount(sub))}/mo</span>
                <span className="text-slate-700">·</span>
                <span className={days <= 3 ? 'text-red-400' : 'text-slate-500'}>
                  renews {formatDaysUntil(days)}
                </span>
                {guide ? (
                  <span className={`badge border ${getDifficultyColor(guide.difficulty)}`}>
                    {getDifficultyIcon(guide.difficulty)} {guide.difficulty} · {guide.estimatedTime}
                  </span>
                ) : (
                  <span className="text-slate-600">No guide available</span>
                )}
              </div>
            </div>
            <ArrowRight size={15} className="text-slate-600 shrink-0" />
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Browse All Services Tab ───────────────────────────────────────────────────

function BrowseTab({ onBrowseGuide, search }) {
  const [category, setCategory] = useState('All')

  const filtered = useMemo(() => {
    let list = CANCELLATION_GUIDES
    if (category !== 'All') {
      list = list.filter(g => getGuideCategory(g) === category)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.searchAliases.some(a => a.includes(q))
      )
    }
    return list
  }, [category, search])

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap">
        {GUIDE_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
              category === cat
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800/40 text-slate-500 border-slate-700/40 hover:border-slate-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="text-xs text-slate-600">{filtered.length} service{filtered.length !== 1 ? 's' : ''}</div>

      <div className="space-y-2">
        {filtered.map(guide => (
          <motion.div
            key={guide.name}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            onClick={() => onBrowseGuide(guide)}
            className="card card-hover p-4 flex items-center gap-3 cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-100">{guide.name}</span>
                <span className={`badge border text-xs ${getDifficultyColor(guide.difficulty)}`}>
                  {getDifficultyIcon(guide.difficulty)} {guide.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>{getGuideCategory(guide)}</span>
                <span className="text-slate-700">·</span>
                <span>{guide.estimatedTime}</span>
                <span className="text-slate-700">·</span>
                <span>{guide.steps.length} steps</span>
              </div>
            </div>
            <ArrowRight size={15} className="text-slate-600 shrink-0" />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-bold text-slate-200 mb-1">No guides found</h3>
          <p className="text-sm text-slate-500">Try a different search or category filter.</p>
        </div>
      )}
    </div>
  )
}

// ─── Cancelled Tab ────────────────────────────────────────────────────────────

function CancelledTab() {
  const { subscriptions, cancellations, updateCancellation } = useApp()

  const cancelledSubs = useMemo(
    () => subscriptions.filter(s => s.status === 'Cancelled'),
    [subscriptions]
  )

  const pendingVerification = useMemo(
    () => cancellations.filter(c => c.verified === null && new Date(c.verifyDate) <= new Date()),
    [cancellations]
  )

  const hallOfFame = useMemo(() => {
    const totalSaved = cancelledSubs.reduce((s, sub) => s + getMonthlyAmount(sub), 0)
    const hardest = cancellations.reduce((h, c) => {
      const guide = findCancellationGuide(c.subscriptionName)
      if (!guide) return h
      const rank = { 'Easy': 1, 'Medium': 2, 'Hard': 3, 'Very Hard': 4 }
      if (!h) return c
      const hGuide = findCancellationGuide(h.subscriptionName)
      if ((rank[guide.difficulty] || 0) > (rank[hGuide?.difficulty] || 0)) return c
      return h
    }, null)
    return { totalCancelled: cancelledSubs.length, totalSaved, savedStr: formatMonthlyByCurrency(cancelledSubs), hardest }
  }, [cancelledSubs, cancellations])

  return (
    <div className="space-y-5">
      {/* Pending verification */}
      {pendingVerification.length > 0 && (
        <div className="space-y-2">
          <span className="section-title text-amber-400">⏰ Pending Verification</span>
          {pendingVerification.map(c => (
            <div key={c.id} className="card border-amber-500/25 bg-amber-500/5 p-4 flex items-center gap-3 flex-wrap">
              <AlertTriangle size={18} className="text-amber-400 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-slate-100 text-sm">{c.subscriptionName}</div>
                <div className="text-xs text-amber-400">Did {c.subscriptionName} actually stop charging you?</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateCancellation(c.id, { verified: true })} className="btn-success text-xs">✓ Yes, stopped</button>
                <button onClick={() => updateCancellation(c.id, { verified: false })} className="btn-danger text-xs">⚠️ Still charging</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hall of Fame */}
      {hallOfFame.totalCancelled > 0 && (
        <div className="card border-yellow-500/25 bg-yellow-500/5 p-4 flex items-center gap-4 flex-wrap">
          <Trophy size={28} className="text-yellow-400 shrink-0" />
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-slate-500">Cancelled all-time</div>
              <div className="font-bold text-yellow-400">{hallOfFame.totalCancelled} subscriptions</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Monthly savings freed</div>
              <div className="font-bold text-emerald-400">{hallOfFame.savedStr}/mo</div>
            </div>
            {hallOfFame.hardest && (
              <div>
                <div className="text-xs text-slate-500">Hardest survived</div>
                <div className="font-bold text-red-400">{hallOfFame.hardest.subscriptionName} {getDifficultyEmoji('Very Hard')}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* List */}
      {cancelledSubs.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-3">📋</div>
          <h3 className="font-bold text-slate-200 mb-1">No cancelled subscriptions yet</h3>
          <p className="text-sm text-slate-500">When you cancel a subscription through the guide, it appears here.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {cancelledSubs.map(sub => (
            <div key={sub.id} className="card p-3 flex items-center gap-3 opacity-70">
              <span className="text-lg">{CATEGORY_ICONS[sub.category] || '📦'}</span>
              <div className="flex-1">
                <span className="text-sm text-slate-400 line-through">{sub.name}</span>
              </div>
              <span className="text-xs text-emerald-400 font-semibold">+{formatCurrency(getMonthlyAmount(sub))}/mo saved</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CancellationCenter() {
  const { subscriptions } = useApp()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('mine')
  const [search, setSearch] = useState('')
  const [selectedSubId, setSelectedSubId] = useState(null)
  const [browsingGuide, setBrowsingGuide] = useState(null)

  const selectedSub = selectedSubId ? subscriptions.find(s => s.id === selectedSubId) : null
  const selectedGuide = selectedSub ? findCancellationGuide(selectedSub.name) : null

  const isDetailView = selectedSubId || browsingGuide

  function handleBack() {
    setSelectedSubId(null)
    setBrowsingGuide(null)
  }

  const TABS = [
    { id: 'mine', label: 'My Subscriptions' },
    { id: 'browse', label: `Browse All (${CANCELLATION_GUIDES.length})` },
    { id: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <XCircle size={19} className="text-red-400" />
          <h1 className="page-header mb-0">Cancellation Center</h1>
        </div>
        <p className="page-sub mb-0">Step-by-step guides to cancel any subscription, no matter how tricky</p>
      </div>

      {/* Detail view */}
      {isDetailView ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="btn-icon">
              <ArrowLeft size={17} />
            </button>
            <div className="flex-1 min-w-0">
              {selectedSub ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{CATEGORY_ICONS[selectedSub.category] || '📦'}</span>
                    <h2 className="font-bold text-slate-100">Cancel {selectedSub.name}</h2>
                  </div>
                  <p className="text-xs text-slate-500">
                    {formatCurrency(selectedSub.amount)} {selectedSub.billingCycle?.toLowerCase()} · renews {formatDaysUntil(getDaysUntil(selectedSub.nextBillingDate))}
                  </p>
                </>
              ) : browsingGuide ? (
                <>
                  <h2 className="font-bold text-slate-100">How to Cancel {browsingGuide.name}</h2>
                  <p className="text-xs text-slate-500">
                    {getDifficultyEmoji(browsingGuide.difficulty)} {browsingGuide.difficulty} · {browsingGuide.estimatedTime}
                  </p>
                </>
              ) : null}
            </div>
          </div>

          {/* No guide fallback */}
          {selectedSub && !selectedGuide && (
            <div className="card p-4 space-y-2">
              <p className="text-sm text-slate-400 mb-2">No specific guide for {selectedSub.name}. General tips:</p>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>• Check the service's account/billing settings page</li>
                <li>• Look for "Manage subscription" or "Cancel plan"</li>
                <li>• If you subscribed via Apple/Google, cancel through them</li>
                <li>• Get a confirmation email before closing the tab</li>
              </ul>
            </div>
          )}

          {(selectedGuide || browsingGuide) && (
            <GuideSteps
              guide={selectedGuide || browsingGuide}
              sub={selectedSub || null}
            />
          )}
        </div>
      ) : (
        /* List view */
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input pl-9"
              placeholder={activeTab === 'browse' ? 'Search 76 services...' : 'Search your subscriptions...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearch('') }}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'mine' && (
                <MySubscriptionsTab onSelectSub={setSelectedSubId} search={search} />
              )}
              {activeTab === 'browse' && (
                <BrowseTab onBrowseGuide={setBrowsingGuide} search={search} />
              )}
              {activeTab === 'cancelled' && <CancelledTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
