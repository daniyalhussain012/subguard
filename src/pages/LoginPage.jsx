import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'https://subguard-api-cug1.onrender.com'

export default function LoginPage() {
  const { loginWithGoogle, handleAuthCallback, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const [waking, setWaking] = useState(false)
  const [serverReady, setServerReady] = useState(false)
  const [mode, setMode] = useState('signin') // signin | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pwBusy, setPwBusy] = useState(false)
  const [pwError, setPwError] = useState('')
  const [verifySent, setVerifySent] = useState(false)   // signup done, awaiting confirmation
  const [needsVerify, setNeedsVerify] = useState(false) // sign-in blocked until confirmed
  const [resendState, setResendState] = useState('idle')
  const [useLink, setUseLink] = useState(false) // magic-link fallback instead of password
  const [emailState, setEmailState] = useState('idle') // idle | sending | sent | error
  const [emailError, setEmailError] = useState('')
  const [sentToExisting, setSentToExisting] = useState(false)
  const linkError = new URLSearchParams(window.location.search).get('error') === 'email_link_invalid'

  useEffect(() => {
    if (!loading && isAuthenticated) navigate('/')
  }, [isAuthenticated, loading])

  // Pre-warm: the server runs on an always-on instance now, so one ping on
  // page load both warms the TLS connection and confirms it's up — clicking
  // "Continue with Google" then redirects instantly with no waiting screen.
  useEffect(() => {
    fetch(`${API_URL}/health`, { cache: 'no-store' })
      .then(r => r.ok && setServerReady(true))
      .catch(() => {})
  }, [])

  // Fallback for the rare case the pre-warm ping failed (deploy in progress)
  async function waitForServer() {
    const deadline = Date.now() + 120000
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`${API_URL}/health`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json().catch(() => null)
          if (data?.status === 'ok') return true
        }
      } catch { /* keep polling */ }
      await new Promise(r => setTimeout(r, 3000))
    }
    return false
  }

  async function handleLogin() {
    if (serverReady) { loginWithGoogle(); return } // instant path
    setWaking(true)
    await waitForServer()
    loginWithGoogle()
  }

  async function handlePasswordAuth(e) {
    e.preventDefault()
    setPwError('')
    setNeedsVerify(false)
    if (mode === 'signup' && password.length < 8) { setPwError('Password must be at least 8 characters'); return }
    setPwBusy(true)
    try {
      const res = await fetch(`${API_URL}/auth/${mode === 'signup' ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.token) { handleAuthCallback(data.token); return }
      // Signup succeeded but the account is inert until the emailed link is opened
      if (res.ok && data.verificationRequired) { setVerifySent(true); setPwBusy(false); return }
      if (data.verificationRequired) setNeedsVerify(true) // sign-in on an unconfirmed account
      setPwError(data.error || 'Something went wrong — please try again.')
    } catch { setPwError('Could not reach the server — please try again.') }
    setPwBusy(false)
  }

  async function handleResendVerification() {
    setResendState('sending')
    try {
      await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      setResendState('sent')
    } catch { setResendState('idle') }
  }

  async function handleEmailLogin(e) {
    e.preventDefault()
    if (!email.trim()) return
    setEmailState('sending')
    setEmailError('')
    try {
      const res = await fetch(`${API_URL}/auth/email/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), mode }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) { setSentToExisting(!!data.existing); setEmailState('sent') }
      else { setEmailState('error'); setEmailError(data.error || 'Could not send the link. Try again.') }
    } catch {
      setEmailState('error')
      setEmailError('Could not reach the server. Try again.')
    }
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
          {linkError && emailState === 'idle' && (
            <p className="text-xs text-amber-400 text-center mb-4">That sign-in link was invalid or expired — request a fresh one below.</p>
          )}
          {waking ? (
            <div className="text-center py-4">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-300 font-medium text-sm">Waking up the server…</p>
              <p className="text-slate-500 text-xs mt-1">This can take up to a minute on first load. You'll be redirected automatically.</p>
            </div>
          ) : (
            <>
              {/* Sign in / Create account tabs — same backends, but sign-in
                  refuses unknown emails instead of silently creating accounts */}
              <div className="flex rounded-xl border border-slate-800 overflow-hidden mb-5">
                {[['signin', 'Sign in'], ['signup', 'Create account']].map(([m, label]) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setEmailState('idle'); setEmailError(''); setPwError(''); setUseLink(false) }}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                      mode === m ? 'bg-cyan-500/15 text-cyan-300 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

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
                {mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
              </button>

              {/* Email magic-link sign-in for non-Google users */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-xs text-slate-600">or</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {verifySent ? (
                <div className="text-center py-2">
                  <p className="text-sm text-emerald-400 font-medium">✉️ Confirm your email</p>
                  <p className="text-xs text-slate-500 mt-1">
                    We sent a confirmation link to <span className="text-slate-300">{email}</span>. Open it to activate your
                    account — then you're in. The link is valid for 24 hours.
                  </p>
                  <button
                    onClick={handleResendVerification}
                    disabled={resendState !== 'idle'}
                    className="text-xs text-cyan-500 hover:text-cyan-400 underline mt-3 disabled:no-underline disabled:text-emerald-400"
                  >
                    {resendState === 'sent' ? '✓ Sent again' : resendState === 'sending' ? 'Sending…' : "Didn't get it? Resend"}
                  </button>
                  <button
                    onClick={() => { setVerifySent(false); setResendState('idle'); setPassword('') }}
                    className="block w-full text-xs text-slate-500 hover:text-slate-300 mt-3"
                  >
                    ← Use a different email
                  </button>
                </div>
              ) : useLink ? (
                emailState === 'sent' ? (
                  <div className="text-center py-2">
                    <p className="text-sm text-emerald-400 font-medium">✉️ Check your inbox</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {mode === 'signup' && sentToExisting
                        ? <>You already have an account — we sent a <span className="text-slate-300">sign-in link</span> to <span className="text-slate-300">{email}</span> instead.</>
                        : mode === 'signup'
                          ? <>We sent a confirmation link to <span className="text-slate-300">{email}</span> — click it to finish creating your account. Valid for 15 minutes.</>
                          : <>We sent a sign-in link to <span className="text-slate-300">{email}</span>. It's valid for 15 minutes.</>}
                    </p>
                    <button onClick={() => setEmailState('idle')} className="text-xs text-cyan-500 underline mt-2">Use a different email</button>
                  </div>
                ) : (
                  <form onSubmit={handleEmailLogin} className="space-y-2">
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                    />
                    <button
                      type="submit"
                      disabled={emailState === 'sending' || !email.trim()}
                      className="w-full px-6 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl transition-colors font-medium text-sm border border-slate-700"
                    >
                      {emailState === 'sending' ? 'Sending link…' : 'Email me a sign-in link'}
                    </button>
                    {emailError && <p className="text-xs text-red-400 text-center">{emailError}</p>}
                    <button type="button" onClick={() => { setUseLink(false); setEmailError('') }} className="w-full text-xs text-slate-500 hover:text-slate-300 pt-1">
                      ← Back to password {mode === 'signup' ? 'sign-up' : 'sign-in'}
                    </button>
                  </form>
                )
              ) : (
                <form onSubmit={handlePasswordAuth} className="space-y-2">
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                  />
                  <input
                    type="password"
                    required
                    minLength={mode === 'signup' ? 8 : undefined}
                    placeholder={mode === 'signup' ? 'Choose a password (min 8 characters)' : 'Password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                  />
                  <button
                    type="submit"
                    disabled={pwBusy || !email.trim() || !password}
                    className="w-full px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl transition-colors font-semibold text-sm"
                  >
                    {pwBusy ? 'Working…' : mode === 'signup' ? 'Create account' : 'Sign in'}
                  </button>
                  {pwError && <p className="text-xs text-red-400 text-center">{pwError}</p>}
                  {needsVerify && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendState !== 'idle'}
                      className="w-full text-xs text-cyan-500 hover:text-cyan-400 underline disabled:no-underline disabled:text-emerald-400"
                    >
                      {resendState === 'sent' ? '✓ Confirmation link sent — check your inbox' : resendState === 'sending' ? 'Sending…' : 'Resend confirmation link'}
                    </button>
                  )}
                  <button type="button" onClick={() => { setUseLink(true); setPwError(''); setEmailState('idle') }} className="w-full text-xs text-slate-500 hover:text-cyan-400 pt-1">
                    {mode === 'signup' ? 'Prefer no password? Email me a link instead' : 'Forgot password? Email me a sign-in link'}
                  </button>
                </form>
              )}

              <div className="mt-6 space-y-2">
                {[
                  'Track all your subscriptions in one place',
                  "Get renewal reminders before you're charged",
                  'Free up to 5 subscriptions · Pro $10 one-time',
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
        <p className="text-center text-xs mt-2">
          <Link to="/privacy" className="text-slate-600 hover:text-cyan-500 underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
              }
