import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { Search, Plus, Filter, Pause, X, Edit3, Bell, TrendingDown, Play, DollarSign, BookOpen } from 'lucide-react'
import { useApp } from '../App'
import {
  CATEGORIES, getMonthlyAmount, formatCurrency, getDaysUntil,
  formatDaysUntil, CATEGORY_ICONS, CATEGORY_COLORS
} from '../utils/storage'
import { findServiceInDb, detectCurrentPlan, getCheaperPlans, getFreeAlternatives } from '../data/priceDatabase'
import { findCancellationGuide } from '../data/cancellationGuides'
import AlternativeModal from '../components/AlternativeModal'
import ReminderModal from '../components/ReminderModal'
import CancelConfirmModal from '../components/CancelConfirmModal'
import { PauseConfirmModal, ResumeConfirmModal } from '../components/PauseConfirmModal'

const STATUS_BADGE = {
  'Active': 'badge-active',
  'Paused': 'badge-paused',
  'Cancelled': 'badge-cancelled',
  'Under Review': 'badge-review',
}

const IMPORTANCE_COLORS = {
  'Essential': 'bg-slate-700/40 text-slate-300 border border-slate-600/40',
  'Nice to Have': 'bg-violet-500/15 text-violet-400 border border-violet-500/25',
  'Can Live Without': 'bg-orange-500/15 text-orange-400 border border-orange-500/25',
}

export default function Subscriptions() {
  const { subscriptions, updateSubscription, addReminder, household, darkMode } = useApp()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterImportance, setFilterImportance] = useState('All')
  const [filterCycle, setFilterCycle] = useState('All')
  const [sortBy, setSortBy] = useState('date')
  const [showFilters, setShowFilters] = useState(false)
  const [altModal, setAltModal] = useState(null)
  const [reminderModal, setReminderModal] = useState(null)
  const [cancelModal, setCancelModal] = useState(null)
  const [pauseModal, setPauseModal] = useState(null)
  const [resumeModal, setResumeModal] = useState(null)

  const memberMap = useMemo(() => Object.fromEntries(household.map(m => [m.id, m])), [household])

  const filtered = useMemo(() => {
    let list = [...subscriptions]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
    }
    if (filterCategory !== 'All') list = list.filter(s => s.category === filterCategory)
    if (filterStatus !== 'All') list = list.filter(s => s.status === filterStatus)
    if (filterImportance !== 'All') list = list.filter(s => s.importance === filterImportance)
    if (filterCycle !== 'All') list = list.filter(s => s.billingCycle === filterCycle)
    switch (sortBy) {
      case 'amount-desc': list.sort((a, b) => getMonthlyAmount(b) - getMonthlyAmount(a)); break
      case 'amount-asc': list.sort((a, b) => getMonthlyAmount(a) - getMonthlyAmount(b)); break
      case 'date': list.sort((a, b) => getDaysUntil(a.nextBillingDate) - getDaysUntil(b.nextBillingDate)); break
      case 'name': list.sort((a, b) => a.name.localeCompare(b.name)); break
    }
    return list
  }, [subscriptions, search, filterCategory, filterStatus, filterImportance, filterCycle, sortBy])

  const { addCancellation } = useApp()

  function handleCancelConfirmed(sub, data) {
    updateSubscription(sub.id, { status: 'Cancelled', cancellationData: data })
    addCancellation(data)
    setCancelModal(null)
  }

  const activeFilters = [filterCategory, filterStatus, filterImportance, filterCycle].filter(f => f !== 'All').length
  const totalMonthly = filtered.filter(s => s.status === 'Active').reduce((sum, s) => sum + getMonthlyAmount(s), 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header mb-0">All Subscriptions</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {subscriptions.length} tracked · {subscriptions.filter(s => s.status === 'Active').length} active ·{' '}
            <span className="text-cyan-400 font-semibold">{formatCurrency(totalMonthly)}/mo</span> shown
          </p>
        </div>
        <button onClick={() => navigate('/add')} className="btn-primary">
          <Plus size={15} /> Add
        </button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input pl-9 text-sm" placeholder="Search subscriptions..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`btn-secondary gap-2 ${activeFilters > 0 ? 'border-cyan-500/40 text-cyan-400' : ''}`}
          >
            <Filter size={15} />
            <span className="hidden sm:inline text-sm">Filters</span>
            {activeFilters > 0 && <span className="w-5 h-5 bg-cyan-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">{activeFilters}</span>}
          </button>
          <select className="input w-auto text-sm" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="date">By Date</option>
            <option value="amount-desc">$ High → Low</option>
            <option value="amount-asc">$ Low → High</option>
            <option value="name">A → Z</option>
          </select>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="card p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Category', value: filterCategory, set: setFilterCategory, options: ['All', ...CATEGORIES] },
                  { label: 'Status', value: filterStatus, set: setFilterStatus, options: ['All', 'Active', 'Paused', 'Cancelled', 'Under Review'] },
                  { label: 'Importance', value: filterImportance, set: setFilterImportance, options: ['All', 'Essential', 'Nice to Have', 'Can Live Without'] },
                  { label: 'Cycle', value: filterCycle, set: setFilterCycle, options: ['All', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'] },
                ].map(({ label, value, set, options }) => (
                  <div key={label}>
                    <label className="label text-[10px]">{label}</label>
                    <select className="input text-sm py-1.5" value={value} onChange={e => set(e.target.value)}>
                      {options.map(o => <option key={o} value={o}>{o === 'All' ? `All ${label}s` : o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="font-bold text-slate-200 mb-1">No results found</h3>
          <p className="text-sm text-slate-500">
            {subscriptions.length === 0 ? 'Add your first subscription to get started!' : 'Try adjusting your filters.'}
          </p>
          {subscriptions.length === 0 && (
            <button onClick={() => navigate('/add')} className="btn-primary mt-4 mx-auto"><Plus size={15} /> Add Subscription</button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((sub, i) => {
            const days = getDaysUntil(sub.nextBillingDate)
            const isUrgent = sub.status === 'Active' && days >= 0 && days <= 3
            const monthly = getMonthlyAmount(sub)
            const priceDb = findServiceInDb(sub.name)
            const currentPlan = priceDb ? detectCurrentPlan(priceDb, monthly) : null
            const cheaperPlans = priceDb ? getCheaperPlans(priceDb, currentPlan) : []
            const freeAlts = priceDb ? getFreeAlternatives(priceDb) : []
            const hasGuide = !!findCancellationGuide(sub.name)

            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`card p-4 ${isUrgent ? 'border-red-500/30' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: (CATEGORY_COLORS[sub.category] || '#6b7280') + '22' }}
                  >
                    {CATEGORY_ICONS[sub.category] || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-100 truncate">{sub.name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 flex-wrap">
                          <span>{sub.category}</span>
                          {sub.paymentMethod && <><span>·</span><span>{sub.paymentMethod}</span></>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-slate-100 text-sm">{formatCurrency(monthly)}<span className="text-slate-500 text-xs font-normal">/mo</span></div>
                        {sub.billingCycle !== 'Monthly' && (
                          <div className="text-xs text-slate-600">{formatCurrency(sub.amount)} {sub.billingCycle.toLowerCase()}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      <span className={`badge ${STATUS_BADGE[sub.status] || 'badge-active'}`}>{sub.status}</span>
                      <span className={`badge ${IMPORTANCE_COLORS[sub.importance] || ''}`}>{sub.importance}</span>
                      {sub.isTrial && <span className="badge bg-pink-500/15 text-pink-400 border border-pink-500/25">Trial</span>}
                      {sub.canDowngrade && <span className="badge bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">↓ Downgrade</span>}
                      {cheaperPlans?.length > 0 && <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">💡 Cheaper plan</span>}
                      {freeAlts?.length > 0 && <span className="badge bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">⭐ Free alt</span>}
                      <span className={`text-xs font-semibold ${isUrgent ? 'text-red-400' : days < 7 ? 'text-amber-400' : 'text-slate-600'}`}>
                        Due {formatDaysUntil(days)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      {(sub.usedBy || []).length > 0
                        ? (sub.usedBy || []).map(mid => memberMap[mid] ? (
                            <span key={mid} title={memberMap[mid].name} className="text-sm">{memberMap[mid].avatar}</span>
                          ) : null)
                        : <span className="text-xs text-slate-700">Not assigned to anyone</span>
                      }
                    </div>

                    <div className="flex items-center gap-1 mt-2.5 flex-wrap">
                      <button onClick={() => navigate(`/edit/${sub.id}`)} className="btn-ghost py-1 px-2 text-xs"><Edit3 size={12} /> Edit</button>
                      {sub.status === 'Active' && <button onClick={() => setPauseModal(sub)} className="btn-ghost py-1 px-2 text-xs text-amber-400"><Pause size={12} /> Pause</button>}
                      {(sub.status === 'Paused' || sub.status === 'Cancelled') && <button onClick={() => setResumeModal(sub)} className="btn-ghost py-1 px-2 text-xs text-emerald-400"><Play size={12} /> Resume</button>}
                      {sub.status !== 'Cancelled' && <button onClick={() => setCancelModal(sub)} className="btn-ghost py-1 px-2 text-xs text-red-400"><X size={12} /> Cancel</button>}
                      <button onClick={() => setReminderModal(sub)} className="btn-ghost py-1 px-2 text-xs text-amber-400"><Bell size={12} /> Remind</button>
                      <button onClick={() => setAltModal(sub)} className="btn-ghost py-1 px-2 text-xs text-violet-400"><TrendingDown size={12} /> Cheaper?</button>
                      {priceDb && <button onClick={() => navigate('/price-compare')} className="btn-ghost py-1 px-2 text-xs text-emerald-400"><DollarSign size={12} /> Prices</button>}
                      {hasGuide && <button onClick={() => navigate('/cancellation')} className="btn-ghost py-1 px-2 text-xs text-red-400"><BookOpen size={12} /> Guide</button>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      {altModal && (
        <AlternativeModal
          sub={altModal}
          onClose={() => setAltModal(null)}
          onSave={(notes) => { updateSubscription(altModal.id, { alternativeNotes: notes }); setAltModal(null) }}
        />
      )}
      {reminderModal && (
        <ReminderModal
          sub={reminderModal}
          onClose={() => setReminderModal(null)}
          onSave={(days) => { addReminder({ id: uuidv4(), subscriptionId: reminderModal.id, daysBefore: days, createdAt: new Date().toISOString() }); setReminderModal(null) }}
        />
      )}
      {cancelModal && (
        <CancelConfirmModal
          sub={cancelModal}
          onClose={() => setCancelModal(null)}
          onConfirmed={(data) => handleCancelConfirmed(cancelModal, data)}
        />
      )}
      {pauseModal && (
        <PauseConfirmModal
          sub={pauseModal}
          onClose={() => setPauseModal(null)}
          onConfirm={() => { updateSubscription(pauseModal.id, { status: 'Paused' }); setPauseModal(null) }}
        />
      )}
      {resumeModal && (
        <ResumeConfirmModal
          sub={resumeModal}
          onClose={() => setResumeModal(null)}
          onConfirm={() => { updateSubscription(resumeModal.id, { status: 'Active' }); setResumeModal(null) }}
        />
      )}
    </div>
  )
}
