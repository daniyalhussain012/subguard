import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'https://subguard-api-cug1.onrender.com'

// Landing page for the "confirm your email" link sent after password signup.
// Same fragment trick as AuthEmail: the token rides in #t= so it never reaches
// a server log, and prefetching scanners can't burn it. On success the account
// is activated and we sign the user straight in.
export default function AuthVerify() {
  const { handleAuthCallback } = useAuth()
  const navigate = useNavigate()
  const [failed, setFailed] = useState(false)
  const ranOnce = useRef(false)

  useEffect(() => {
    if (ranOnce.current) return
    ranOnce.current = true
    const token = new URLSearchParams(window.location.hash.slice(1)).get('t')
    window.history.replaceState({}, '', '/auth/verify')

    if (!token) { navigate('/login'); return }

    fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(({ token: sessionToken }) => handleAuthCallback(sessionToken))
      .catch(() => setFailed(true))
  }, [])

  if (failed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center px-6">
          <p className="text-slate-200 font-semibold mb-1">This confirmation link is invalid or expired</p>
          <p className="text-slate-500 text-sm mb-4">Links are valid for 24 hours. Sign in again to get a fresh one.</p>
          <button onClick={() => navigate('/login')} className="btn-primary justify-center mx-auto">
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Confirming your email…</p>
      </div>
    </div>
  )
}
