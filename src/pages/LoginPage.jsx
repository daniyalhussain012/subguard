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
    try {
      // Wake up the Render server before redirecting — prevents the raw Render
      // "SERVICE WAKING UP" screen from showing. no-cors means we don't need
      // CORS headers; we just need the server to receive the request.
      await Promise.race([
        fetch(`${API_URL}/api/status`, { mode: 'no-cors' }),
        new Promise(resolve => setTimeout(resolve, 12000)), // wait up to 12s
      ])
    } catch {
      // Network error — redirect anyway, Google OAuth will still work
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
          <h1 className="text-2xl font-bold text-slate-100">SubGuard</h1>
          <p className="text-slate-400 text-sm mt-1">Stop getting charged for things you forgot about</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          {waking ? (
            <div className="text-center py-4">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-300 font-medium text-sm">Connecting to server…</p>
              <p className="text-slate-500 text-xs mt-1">This takes up to 15 seconds on first load</p>
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
