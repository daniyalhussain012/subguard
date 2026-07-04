import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'https://subguard-api-cug1.onrender.com'

export default function LoginPage() {
  const { loginWithGoogle, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const [waking, setWaking] = useState(false)

  useEffect(() => {
    if (!loading && isAuthenticated) navigate('/')
  }, [isAuthenticated, loading])

  async function handleLogin() {
    setWaking(true)
    // Poll /health until the real API responds — Render's wake-up page returns
    // HTML without CORS headers, so fetch throws or returns non-JSON until the
    // actual server is running. Only redirect once we get a real answer.
    const deadline = Date.now() + 120000 // up to 2 minutes
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`${API_URL}/health`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json().catch(() => null)
          if (data?.status === 'ok') break // server is truly awake
        }
      } catch { /* still waking — keep polling */ }
      await new Promise(r => setTimeout(r, 3000))
    }
    loginWithGoogle() // redirects browser to Google OAuth
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/25">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">RenewBell</h1>
          <p className="text-slate-300 text-sm mt-0.5 font-medium">Subscription Tracker &amp; Reminders</p>
          <p className="text-slate-500 text-xs mt-1">Never miss a renewal again.</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          {waking ? (
            <div className="text-center py-4">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-300 font-medium text-sm">Waking up the server…</p>
              <p className="text-slate-500 text-xs mt-1">This can take up to a minute on first load. You'll be redirected automatically.</p>
            </div>
          ) : (
            <>
              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl transition-colors font-medium shadow-sm"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="mt-6 space-y-2">
                {[
                  'Track all your subscriptions in one place',
                  "Get renewal reminders before you're charged",
                  'Free up to 5 subscriptions · Pro $5 one-time',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-1 h-1 rounded-full bg-cyan-500 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-700 mt-5">
          Your data is stored in your browser · Each account is fully isolated
        </p>
      </div>
    </div>
  )
              }
