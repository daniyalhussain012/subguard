import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Bell } from 'lucide-react'

const OPTIONS = [
  { label: '1 day before', value: 1 },
  { label: '2 days before', value: 2 },
  { label: '3 days before', value: 3 },
  { label: '7 days before', value: 7 },
  { label: '14 days before', value: 14 },
]

export default function ReminderModal({ sub, onClose, onSave }) {
  const [days, setDays] = useState(3)

  function handleSave() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    onSave(days)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal max-w-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Bell size={17} className="text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Set Reminder</h2>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={17} /></button>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Remind me before <span className="text-slate-200 font-semibold">{sub.name}</span> renews.</p>
          <div className="space-y-2">
            {OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`w-full p-3 rounded-lg border text-sm font-semibold text-left transition-all ${
                  days === opt.value
                    ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300'
                    : 'border-slate-700/40 bg-slate-800/40 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-600">Reminders appear on your dashboard and as browser notifications (if enabled).</p>
          <div className="flex gap-3">
            <button onClick={handleSave} className="btn-primary flex-1 justify-center"><Bell size={14} /> Set Reminder</button>
            <button onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
