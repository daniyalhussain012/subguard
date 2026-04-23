import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, ExternalLink, CheckSquare, Square, CheckCircle } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import { formatCurrency, getMonthlyAmount } from '../utils/storage'
import { findCancellationGuide, getDifficultyColor, getDifficultyIcon } from '../data/cancellationGuides'

const CANCEL_REASONS = [
  'Too expensive',
  'Don\'t use it enough',
  'Found a cheaper alternative',
  'Poor quality',
  'Switching to free option',
  'Other',
]

const GUIDE_CHECKLIST = [
  { id: 'fees', text: 'Checked for contract or cancellation fees' },
  { id: 'data', text: 'Downloaded any data I want to keep' },
  { id: 'credits', text: 'Checked for unused credits or prepaid balance' },
  { id: 'cancelled', text: 'Actually cancelled on the service\'s website' },
  { id: 'confirmation', text: 'Got a confirmation email or screenshot' },
]

function Confetti() {
  const pieces = Array.from({ length: 30 }, (_, i) => i)
  const colors = ['#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map(i => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-8px',
            backgroundColor: colors[i % colors.length],
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, (Math.random() - 0.5) * 120],
            rotate: [0, Math.random() * 360],
            opacity: [1, 0],
          }}
          transition={{
            duration: 1.5 + Math.random() * 1,
            delay: Math.random() * 0.8,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  )
}

export default function CancelConfirmModal({ sub, onClose, onConfirmed }) {
  const [step, setStep] = useState(1)
  const [guideChecked, setGuideChecked] = useState([])
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [confNum, setConfNum] = useState('')
  const [reason, setReason] = useState('Too expensive')
  const [notes, setNotes] = useState('')
  const [setReminder, setSetReminder] = useState(true)

  const guide = findCancellationGuide(sub.name)
  const monthly = getMonthlyAmount(sub)
  const verifyDate = format(addDays(new Date(sub.nextBillingDate || new Date()), 5), 'MMM d, yyyy')

  function toggleGuideCheck(id) {
    setGuideChecked(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id])
  }

  function handleConfirm() {
    const cancellationData = {
      id: uuidv4(),
      subscriptionId: sub.id,
      subscriptionName: sub.name,
      amount: sub.amount,
      billingCycle: sub.billingCycle,
      cancelledAt: date,
      confirmationNumber: confNum,
      reason,
      notes,
      setReminder,
      expectedLastCharge: sub.nextBillingDate,
      verifyDate: sub.nextBillingDate
        ? format(addDays(new Date(sub.nextBillingDate), 5), 'yyyy-MM-dd')
        : null,
      verified: null,
      createdAt: new Date().toISOString(),
    }
    onConfirmed(cancellationData)
    setStep(4)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={step < 4 ? onClose : undefined} />
        <motion.div
          className="relative w-full sm:max-w-lg bg-slate-900 border border-slate-700/60 rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[92vh] flex flex-col"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(s => (
                  <div
                    key={s}
                    className={`w-2 h-2 rounded-full transition-all ${s <= step ? 'bg-cyan-400' : 'bg-slate-700'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500">Step {step} of 4</span>
            </div>
            {step < 4 && (
              <button onClick={onClose} className="btn-icon">
                <X size={18} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            <AnimatePresence mode="wait">
              {/* Step 1: Warning */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-5"
                >
                  <div className="text-center">
                    <div className="text-5xl mb-3">⚠️</div>
                    <h2 className="text-xl font-bold text-slate-100 mb-2">
                      SubGuard does NOT cancel subscriptions for you
                    </h2>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Clicking "cancel" here only marks <strong className="text-slate-200">{sub.name}</strong> as cancelled inside SubGuard.
                      You still need to cancel directly with {sub.name}.
                    </p>
                  </div>

                  <div className="card bg-amber-500/10 border-amber-500/25 p-4">
                    <p className="text-sm text-amber-300 font-semibold mb-1">Still getting charged?</p>
                    <p className="text-xs text-amber-400/80">
                      Even after "cancelling" here, {sub.name} will keep charging your card until you cancel through their website or app.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => setStep(guide ? 2 : 3)}
                      className="btn-primary w-full justify-center py-3 text-sm"
                    >
                      📖 Show Me How to Cancel {sub.name}
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="btn-secondary w-full justify-center py-2.5 text-sm text-slate-400"
                    >
                      I've Already Cancelled — Just Mark It
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Guide */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-4"
                >
                  {guide ? (
                    <>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`badge border px-2.5 py-1 ${getDifficultyColor(guide.difficulty)}`}>
                          {getDifficultyIcon(guide.difficulty)} {guide.difficulty} · {guide.estimatedTime}
                        </span>
                        {guide.url && (
                          <a
                            href={guide.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary text-xs py-1.5"
                          >
                            <ExternalLink size={12} /> Go to {sub.name} Cancel Page
                          </a>
                        )}
                      </div>

                      {guide.warnings.length > 0 && (
                        <div className="card border-red-500/25 bg-red-500/5 p-3 space-y-1">
                          {guide.warnings.map((w, i) => (
                            <p key={i} className="text-xs text-red-300 flex items-start gap-1.5">
                              <AlertTriangle size={11} className="shrink-0 mt-0.5" /> {w}
                            </p>
                          ))}
                        </div>
                      )}

                      {guide.retentionTactics.length > 0 && (
                        <div className="card border-amber-500/25 bg-amber-500/5 p-3">
                          <p className="text-xs font-bold text-amber-400 mb-1">⚠️ Watch for retention tricks:</p>
                          {guide.retentionTactics.map((t, i) => (
                            <p key={i} className="text-xs text-slate-400">• {t}</p>
                          ))}
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Steps:</p>
                        <ol className="space-y-2">
                          {guide.steps.map((s, i) => (
                            <li key={i} className="flex gap-2.5 text-sm">
                              <span className="w-5 h-5 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                              <span className="text-slate-300">{s}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Checklist:</p>
                        <div className="space-y-1.5">
                          {GUIDE_CHECKLIST.map(item => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleGuideCheck(item.id)}
                              className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-700/30 transition-colors text-left"
                            >
                              {guideChecked.includes(item.id)
                                ? <CheckSquare size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                                : <Square size={16} className="text-slate-600 shrink-0 mt-0.5" />
                              }
                              <span className={`text-sm ${guideChecked.includes(item.id) ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                                {item.text}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-400">
                        We don't have a specific guide for <strong className="text-slate-200">{sub.name}</strong> yet.
                      </p>
                      <a
                        href={`https://www.google.com/search?q=how+to+cancel+${encodeURIComponent(sub.name)}+subscription`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary w-full justify-center text-sm"
                      >
                        <ExternalLink size={14} /> Search: how to cancel {sub.name}
                      </a>
                      <div className="space-y-1.5">
                        {GUIDE_CHECKLIST.map(item => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleGuideCheck(item.id)}
                            className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-700/30 transition-colors text-left"
                          >
                            {guideChecked.includes(item.id)
                              ? <CheckSquare size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                              : <Square size={16} className="text-slate-600 shrink-0 mt-0.5" />
                            }
                            <span className={`text-sm ${guideChecked.includes(item.id) ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                              {item.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setStep(3)}
                    className="btn-primary w-full justify-center py-3"
                  >
                    I've completed cancellation →
                  </button>
                </motion.div>
              )}

              {/* Step 3: Details */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-4"
                >
                  <div>
                    <h2 className="font-bold text-slate-100 text-lg mb-1">Confirm Cancellation</h2>
                    <p className="text-xs text-slate-500">{sub.name} · {formatCurrency(monthly)}/mo</p>
                  </div>

                  <div>
                    <label className="label">Date Cancelled</label>
                    <input
                      className="input"
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="label">Confirmation Number / Reference (optional)</label>
                    <input
                      className="input"
                      placeholder="e.g. CXL-12345 or email subject"
                      value={confNum}
                      onChange={e => setConfNum(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="label">Reason for Cancelling</label>
                    <select className="input" value={reason} onChange={e => setReason(e.target.value)}>
                      {CANCEL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="label">Notes (optional)</label>
                    <textarea
                      className="input min-h-[60px] resize-none"
                      placeholder="Any additional notes..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setSetReminder(v => !v)}
                    className="w-full flex items-start gap-2.5 p-3 rounded-lg bg-slate-800/40 border border-slate-700/40 hover:border-slate-600 transition-colors text-left"
                  >
                    {setReminder
                      ? <CheckSquare size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                      : <Square size={16} className="text-slate-600 shrink-0 mt-0.5" />
                    }
                    <div>
                      <div className="text-sm font-semibold text-slate-200">Set a reminder to verify charge stopped</div>
                      <div className="text-xs text-slate-500">We'll remind you on {verifyDate} to confirm {sub.name} stopped billing.</div>
                    </div>
                  </button>

                  <button
                    onClick={handleConfirm}
                    className="btn-danger w-full justify-center py-3 font-bold"
                  >
                    Confirm Cancellation
                  </button>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 space-y-4 text-center relative"
                >
                  <Confetti />
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.3 }}
                      className="text-6xl mb-4"
                    >
                      🎉
                    </motion.div>
                    <h2 className="text-2xl font-bold text-slate-100 mb-1">
                      You cancelled {sub.name}!
                    </h2>
                    <p className="text-slate-500 text-sm mb-5">Great job taking control of your subscriptions.</p>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="card p-3 bg-emerald-500/10 border-emerald-500/25">
                        <div className="text-xs text-slate-500">Monthly savings</div>
                        <div className="text-xl font-bold text-emerald-400">{formatCurrency(monthly)}</div>
                      </div>
                      <div className="card p-3 bg-emerald-500/10 border-emerald-500/25">
                        <div className="text-xs text-slate-500">Yearly savings</div>
                        <div className="text-xl font-bold text-emerald-400">{formatCurrency(monthly * 12)}</div>
                      </div>
                    </div>

                    {setReminder && (
                      <p className="text-xs text-slate-500 mb-5">
                        ✅ We'll remind you on {verifyDate} to verify {sub.name} stopped charging you.
                      </p>
                    )}

                    <button onClick={onClose} className="btn-primary w-full justify-center py-3">
                      <CheckCircle size={16} /> Done
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
