import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'https://subguard-api-cug1.onrender.com'

export default function AuthCallback() {
  const { handleAuthCallback } = useAuth()
  const navigate = useNavigate()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const legacyToken = params.get('token') // pre-exchange flow; remove once stable

    // Strip the code from the address bar immediately so it never lingers
    // in history even while the exchange is in flight
    window.history.replaceState({}, '', '/auth/callback')

    if (code) {
      fetch(`${API_URL}/auth/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(({ token }) => handleAuthCallback(token))
        .catch(() => setFailed(true))
    } else if (legacyToken) {
      handleAuthCallback(legacyToken)
    } else {
      navigate('/login')
    }
  }, [])

  if (failed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-slate-300 text-sm mb-3">Sign-in didn't complete. Please try again.</p>
          <button onClick={() => navigate('/login')} className="text-cyan-400 text-sm underline">Back to login</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Signing you in…</p>
      </div>
    </div>
  )
}
