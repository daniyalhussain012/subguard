import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, PauseCircle, PlayCircle } from 'lucide-react'
import { formatCurrency, getMonthlyAmount } from '../utils/storage'
import { findCancellationGuide } from '../data/cancellationGuides'

export function PauseConfirmModal({ sub, onClose, onConfirm }) {
  const guide = findCancellationGuide(sub.name)
  const monthly = getMonthlyAmount(sub)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative w-full sm:max-w-sm bg-slate-900 border border-slate-700/60 rounded-t-2xl sm:rounded-2xl p-6 space-y-4"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          <button onClick={onClose} className="btn-icon absolute top-4 right-4"><X size={18} /></button>
          <div className="text-center">
            <PauseCircle size={40} className="text-amber-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-100 mb-1">Pause {sub.name}?</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              This marks it as paused in SubGuard ({formatCurrency(monthly)}/mo won't count toward active spend).
              You'll need to check with {sub.name} directly to pause your actual account there.
            </p>
          </div>

          {guide?.url && (
            <a
              href={guide.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Visit {sub.name} to check pause options →
            </a>
          )}

          <div className="flex gap-2">
            <button
              onClick={onConfirm}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-sm hover:bg-amber-500/30 transition-colors"
            >
              <PauseCircle size={15} /> Pause in SubGuard
            </button>
            <button onClick={onClose} className="btn-secondary px-4">Nevermind</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export function ResumeConfirmModal({ sub, onClose, onConfirm }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative w-full sm:max-w-sm bg-slate-900 border border-slate-700/60 rounded-t-2xl sm:rounded-2xl p-6 space-y-4"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          <button onClick={onClose} className="btn-icon absolute top-4 right-4"><X size={18} /></button>
          <div className="text-center">
            <PlayCircle size={40} className="text-emerald-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-100 mb-1">Resume {sub.name}?</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              This marks it as active again in SubGuard. Make sure you've also reactivated it directly with {sub.name}.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onConfirm}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-sm hover:bg-emerald-500/30 transition-colors"
            >
              <PlayCircle size={15} /> Resume
            </button>
            <button onClick={onClose} className="btn-secondary px-4">Cancel</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
