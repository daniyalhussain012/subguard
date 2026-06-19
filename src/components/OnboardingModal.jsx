import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Radar, Mail, Trophy, ArrowRight, X } from 'lucide-react'

const STEPS = [
  {
    icon: ShieldCheck,
    color: 'from-cyan-500 to-cyan-600',
    title: 'Welcome to RenewBell',
    body: 'Never miss a renewal again. RenewBell tracks every subscription, alerts you before renewals, and helps you cancel what you don\'t use.',
  },
  {
    icon: Radar,
    color: 'from-violet-500 to-violet-600',
    title: 'Renewal Radar',
    body: 'See every upcoming charge before it hits your card. Get push notifications 1–14 days before any renewal so you\'re never surprised.',
  },
  {
    icon: Mail,
    color: 'from-emerald-500 to-emerald-600',
    title: 'Smart Scanner',
    body: 'Connect Gmail or Outlook to automatically find subscriptions in your inbox. Or paste a receipt, upload a screenshot — RenewBell reads it all.',
  },
  {
    icon: Trophy,
    color: 'from-amber-500 to-amber-600',
    title: 'You\'re in control',
    body: 'Track savings from every cancellation, compare prices against fair market rates, and share costs across household members. Let\'s get started.',
  },
]

export default function OnboardingModal({ onClose }) {
  const [step, setStep] = useState(0)

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden"
          initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        >
          {/* Skip button */}
          <div className="flex justify-end p-4 pb-0">
            <button onClick={onClose} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Skip <X size={12} />
            </button>
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="px-8 pt-4 pb-6 text-center"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${current.color} flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                <Icon size={30} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 mb-3">{current.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{current.body}</p>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 pb-4">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-full transition-all ${i === step ? 'w-5 h-2 bg-cyan-400' : 'w-2 h-2 bg-slate-700'}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={() => isLast ? onClose() : setStep(s => s + 1)}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 transition-all flex items-center justify-center gap-2"
            >
              {isLast ? 'Get Started' : 'Next'}
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
