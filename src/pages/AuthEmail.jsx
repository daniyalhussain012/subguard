import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'https://subguard-api-cug1.onrender.com'

// Landing page for email sign-in links. The magic token arrives in the URL
// fragment (#t=...) — invisible to servers and to email link scanners, which
// fetch the page but never run this JS. We redeem it with a POST and receive
// the session token directly.
export default function AuthEmail() {
  const { handleAuthCallback } = useAuth()
  const navigate = useNavigate()
  const [failed, setFailed] = useState(false)
  const ranOnce = useRef(false)

  useEffect(() => {
    // The effect clears the hash, so a second run (React StrictMode remounts)
    // would see no token and bounce to /login — run exactly once.
    if (ranOnce.current) return
    ranOnce.current = true
    const token = new URLSearchParams(window.location.hash.slice(1)).get('t')
    // Clear the fragment so the token doesn't linger in the address bar
    window.history.replaceState({}, '', '/auth/email')

    if (!token) { navigate('/login'); return }

    fetch(`${API_URL}/auth/email/verify`, {
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
          <p className="text-slate-200 font-semibold mb-1">This sign-in link is invalid or expired</p>
          <p className="text-slate-500 text-sm mb-4">Links are valid for 15 minutes and can only be used once.</p>
          <button onClick={() => navigate('/login')} className="btn-primary justify-center mx-auto">
            Request a new link
          </button>
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
