import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Check, Zap, Crown, Star, ArrowLeft, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../App'

const API_URL = import.meta.env.VITE_API_URL || 'https://subguard-api-cug1.onrender.com'

const FREE_FEATURES = [
  'Track up to 5 subscriptions',
  'Command Center dashboard',
  'Renewal Radar & alerts',
  'Smart Alerts',
  'Basic calendar view',
]

const PRO_FEATURES = [
  'Unlimited subscriptions',
  'Everything in Free',
  'Household Hub (family plans)',
  'Smart Scanner (email parsing)',
  'Money Leaks Detective',
  'Cancellation Center',
  'Price Compare tool',
  'Savings Victory Board',
  'Data export / import',
  'Priority support',
]

const LOCKED_ON_FREE = ['Household Hub', 'Smart Scanner (email parsing)', 'Money Leaks Detective', 'Cancellation Center', 'Price Compare tool', 'Savings Victory Board']

export default function Upgrade() {
  const { user, token, isPremium, refreshUser } = useAuth()
  const { subscriptions, darkMode } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [justUpgraded, setJustUpgraded] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('upgraded') === 'true') {
      setJustUpgraded(true)
      refreshUser()
      window.history.replaceState({}, '', '/upgrade')
    }
  }, [])

  const activeSubs = subscriptions.filter(s => s.status === 'Active').length

  const handleUpgrade = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url }
      else { setError('Could not start checkout. Please try again.') }
    } catch { setError('Something went wrong. Please check your connection.') }
    setLoading(false)
  }

  if (isPremium || justUpgraded) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/30">
          <Crown size={36} className="text-white" />
        </motion.div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">You're on RenewBell Pro!</h1>
        <p className="text-slate-400 mb-8">All features unlocked. Track unlimited subscriptions.</p>
        <div className="card p-5 text-left space-y-2.5 mb-6">
          {PRO_FEATURES.map(f => (
            <div key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
              <Check size={14} className="text-amber-400 shrink-0" /> {f}
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/')} className="btn-primary">Back to Dashboard</button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <button onClick={() => navigate(-1)} className={`flex items-center gap-1.5 text-sm mb-6 transition-colors ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-700'}`}>
        <ArrowLeft size={15} /> Back
      </button>

      <div className="text-center mb-10">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
          <ShieldCheck size={22} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Upgrade to RenewBell Pro</h1>
        <p className="text-slate-400 text-sm">One-time payment · No subscription · No recurring fees · 3 years of access</p>
      </div>

      <div className={`card p-4 mb-6 flex items-center justify-between gap-4 ${activeSubs >= 5 ? 'border border-red-500/30' : ''}`}>
        <div>
          <div className="text-sm font-semibold text-slate-200">Free Plan Usage</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {activeSubs} of 5 active subscription slots used
            {activeSubs >= 5 && <span className="text-red-400 ml-1.5 font-medium">— limit reached</span>}
          </div>
        </div>
        <div className="w-28 shrink-0">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${activeSubs >= 5 ? 'bg-red-500' : activeSubs >= 4 ? 'bg-amber-500' : 'bg-cyan-500'}`}
              style={{ width: `${Math.min((activeSubs / 5) * 100, 100)}%` }} />
          </div>
          <div className="text-right text-[10px] text-slate-600 mt-0.5">{activeSubs}/5</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-6 opacity-80">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={17} className="text-slate-500" />
            <h2 className="font-bold text-slate-300">Free</h2>
          </div>
          <div className="text-3xl font-bold text-slate-200 mb-4">$0</div>
          <div className="space-y-2 mb-6">
            {FREE_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-slate-400">
                <Check size={13} className="text-slate-600 shrink-0" /> {f}
              </div>
            ))}
            <div className="border-t border-slate-800 pt-2 mt-2 space-y-1.5">
              {LOCKED_ON_FREE.map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-700">
                  <Lock size={11} className="text-slate-700 shrink-0" /> {f}
                </div>
              ))}
            </div>
          </div>
          <div className={`w-full text-center py-2 rounded-xl text-xs font-semibold ${darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>Current Plan</div>
        </div>

        <motion.div className="card p-6 border-2 border-cyan-500/50 relative overflow-hidden"
          initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-600 to-cyan-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-2xl tracking-wide">BEST VALUE</div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={17} className="text-cyan-400" />
            <h2 className="font-bold text-cyan-300">Pro</h2>
          </div>
          <div className="flex items-end gap-1.5 mb-0.5">
            <span className="text-3xl font-bold text-slate-100">$10</span>
            <span className="text-slate-400 text-sm mb-1">one-time</span>
          </div>
          <p className="text-[11px] text-slate-600 mb-4">Pay once, 3 years of access. No recurring charges.</p>
          <div className="space-y-2 mb-6">
            {PRO_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                <Check size={13} className="text-cyan-400 shrink-0" /> {f}
              </div>
            ))}
          </div>
          {error && <p className="text-xs text-red-400 mb-2 text-center">{error}</p>}
          <button onClick={handleUpgrade} disabled={loading} className="btn-primary w-full justify-center py-2.5 text-sm font-bold">
            <Zap size={15} />
            {loading ? 'Opening checkout…' : 'Upgrade for $10'}
          </button>
          <p className="text-[10px] text-slate-600 text-center mt-2 flex items-center justify-center gap-1">
            <Star size={10} className="text-slate-600" /> Secure checkout via Stripe
          </p>
        </motion.div>
      </div>

      {user?.email && (
        <p className="text-center text-xs text-slate-600 mt-6">
          Upgrading account: <span className="text-slate-400">{user.email}</span>
        </p>
      )}
    </div>
  )
}
