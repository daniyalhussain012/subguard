import React, { useState, useEffect, createContext, useContext, useCallback, lazy, Suspense, useMemo } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import Layout from './components/Layout'
import OnboardingModal from './components/OnboardingModal'
import { format } from 'date-fns'
import { defaultSettings, getNextChargeDate } from './utils/storage'
import { checkAndSendNotifications, registerServiceWorker, dismissNotifStage1, subscribeToPush } from './utils/notifications'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallback'
import AuthEmailPage from './pages/AuthEmail'
import AuthVerifyPage from './pages/AuthVerify'
import PrivacyPolicy from './pages/PrivacyPolicy'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Subscriptions = lazy(() => import('./pages/Subscriptions'))
const AddEditSubscription = lazy(() => import('./pages/AddEditSubscription'))
const CalendarView = lazy(() => import('./pages/CalendarView'))
const RenewalRadar = lazy(() => import('./pages/RenewalRadar'))
const SmartScanner = lazy(() => import('./pages/SmartScanner'))
const HouseholdHub = lazy(() => import('./pages/HouseholdHub'))
const MoneyLeaksDetective = lazy(() => import('./pages/MoneyLeaksDetective'))
const CancellationCenter = lazy(() => import('./pages/CancellationCenter'))
const PriceCompare = lazy(() => import('./pages/PriceCompare'))
const Settings = lazy(() => import('./pages/Settings'))
const SavingsVictoryBoard = lazy(() => import('./pages/SavingsVictoryBoard'))
const Upgrade = lazy(() => import('./pages/Upgrade'))

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

const API_URL = import.meta.env.VITE_API_URL || 'https://subguard-api-cug1.onrender.com'

const pageVariants = {
  initial: { opacity: 0, x: 18 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, x: -18, transition: { duration: 0.15 } },
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function AuthGate({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}

function PremiumGate({ children }) {
  const { isPremium } = useAuth()
  if (!isPremium) return <Navigate to="/upgrade" replace />
  return children
}

function AnimatedRoutes() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      const mod = e.ctrlKey || e.metaKey
      if (!mod) return
      switch (e.key) {
        case 'n': e.preventDefault(); navigate('/add'); break
        case 's': e.preventDefault(); navigate('/scanner'); break
        case 'r': e.preventDefault(); navigate('/radar'); break
        case 'h': e.preventDefault(); navigate('/'); break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ minHeight: '100%' }}>
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/auth/email" element={<AuthEmailPage />} />
            <Route path="/auth/verify" element={<AuthVerifyPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/" element={<AuthGate><Layout /></AuthGate>}>
              <Route index element={<Dashboard />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="add" element={<AddEditSubscription />} />
              <Route path="edit/:id" element={<AddEditSubscription />} />
              <Route path="calendar" element={<CalendarView />} />
              <Route path="radar" element={<RenewalRadar />} />
              <Route path="scanner" element={<PremiumGate feature="Smart Scanner"><SmartScanner /></PremiumGate>} />
              <Route path="household" element={<PremiumGate feature="Household Hub"><HouseholdHub /></PremiumGate>} />
              <Route path="leaks" element={<PremiumGate feature="Money Leaks Detective"><MoneyLeaksDetective /></PremiumGate>} />
              <Route path="cancellation" element={<PremiumGate feature="Cancellation Center"><CancellationCenter /></PremiumGate>} />
              <Route path="price-compare" element={<PremiumGate feature="Price Compare"><PriceCompare /></PremiumGate>} />
              <Route path="victory" element={<PremiumGate feature="Savings Victory Board"><SavingsVictoryBoard /></PremiumGate>} />
              <Route path="settings" element={<Settings />} />
              <Route path="upgrade" element={<Upgrade />} />
              <Route path="report" element={<Navigate to="/leaks" replace />} />
              <Route path="smart-add" element={<Navigate to="/scanner" replace />} />
              <Route path="dashboard" element={<Navigate to="/" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

function AppInner() {
  const { user, isPremium, refreshUser } = useAuth()
  const userId = user?.id || null

  // Per-user localStorage keys — switching users auto-isolates data
  const activeKeys = useMemo(() => {
    const p = userId ? `subguard_${userId}` : 'subguard'
    return {
      SUBSCRIPTIONS: `${p}_subscriptions`,
      REMINDERS:     `${p}_reminders`,
      SETTINGS:      `${p}_settings`,
      FIRST_VISIT:   `${p}_first_visit`,
      HOUSEHOLD:     `${p}_household`,
      SCAN_HISTORY:  `${p}_scan_history`,
      ALERTS_DISMISSED: `${p}_alerts_dismissed`,
      CANCELLATIONS: `${p}_cancellations`,
      ONBOARDING:    `${p}_onboarding_done`,
    }
  }, [userId])

  const [settings, setSettings] = useState(defaultSettings())
  const [subscriptions, setSubscriptions] = useState([])
  const [reminders, setReminders] = useState([])
  const [household, setHousehold] = useState([])
  const [scanHistory, setScanHistory] = useState([])
  const [dismissedAlerts, setDismissedAlerts] = useState([])
  const [cancellations, setCancellations] = useState([])
  const [showOnboarding, setShowOnboarding] = useState(false)
  // Gates the server-sync effect until we've either confirmed local data exists
  // or restored it from the server — prevents a fresh domain/device from
  // syncing an empty subscriptions array and wiping the server's copy.
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(false)

    // First visit: initialize empty state for this user (no sample data — keeps accounts isolated)
    if (!localStorage.getItem(activeKeys.FIRST_VISIT)) {
      localStorage.setItem(activeKeys.SUBSCRIPTIONS,    JSON.stringify([]))
      localStorage.setItem(activeKeys.HOUSEHOLD,        JSON.stringify([]))
      localStorage.setItem(activeKeys.REMINDERS,        JSON.stringify([]))
      localStorage.setItem(activeKeys.SCAN_HISTORY,     JSON.stringify([]))
      localStorage.setItem(activeKeys.ALERTS_DISMISSED, JSON.stringify([]))
      localStorage.setItem(activeKeys.CANCELLATIONS,    JSON.stringify([]))
      localStorage.setItem(activeKeys.SETTINGS,         JSON.stringify(defaultSettings()))
      localStorage.setItem(activeKeys.FIRST_VISIT,      'done')
    }

    loadAll(activeKeys)

    // Restore-from-server hydration: if this domain/device has no local
    // subscriptions but the user is logged in, pull the server's copy before
    // the sync effect below gets a chance to run (it would otherwise push an
    // empty array and wipe the server's data — e.g. after switching domains).
    const localSubs = JSON.parse(localStorage.getItem(activeKeys.SUBSCRIPTIONS) || '[]')
    const token = localStorage.getItem('subguard_token')
    if (localSubs.length === 0 && token) {
      fetch(`${API_URL}/api/subscriptions`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(serverSubs => {
          if (Array.isArray(serverSubs) && serverSubs.length) {
            const restored = serverSubs.map(s => ({
              id: uuidv4(),
              name: s.name,
              category: s.category || 'Other',
              amount: s.amount,
              currency: s.currency || 'USD',
              billingCycle: s.billingCycle || 'Monthly',
              nextBillingDate: s.nextBillingDate ? s.nextBillingDate.slice(0, 10) : '',
              autoRenewal: true,
              paymentMethod: '',
              notes: s.notes || '',
              status: 'Active',
              createdAt: s.createdAt || new Date().toISOString(),
              updatedAt: s.updatedAt || new Date().toISOString(),
            }))
            localStorage.setItem(activeKeys.SUBSCRIPTIONS, JSON.stringify(restored))
            setSubscriptions(restored)
          }
          setHydrated(true)
        })
        .catch(() => {
          // Leave hydrated=false — sync effect stays disabled this session
          // rather than risk overwriting server data with an empty array.
        })
    } else {
      setHydrated(true)
    }

    registerServiceWorker().then(() => {
      // Re-register this device for background push whenever permission is
      // already granted — keeps the server's copy fresh (e.g. after key rotation)
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        subscribeToPush()
      }
    })
    if (!localStorage.getItem(activeKeys.ONBOARDING)) setShowOnboarding(true)

    // Handle Stripe success redirect
    const params = new URLSearchParams(window.location.search)
    if (params.get('upgraded') === 'true') {
      refreshUser()
      window.history.replaceState({}, '', window.location.pathname)
    }

    const handleSWMessage = (event) => {
      if (event.data?.type === 'DISMISS_NOTIF_CYCLE') {
        const { subId, renewalDate } = event.data
        if (subId && renewalDate) dismissNotifStage1(subId, renewalDate)
      }
    }
    navigator.serviceWorker?.addEventListener('message', handleSWMessage)

    const dismissKey = params.get('dismiss')
    if (dismissKey) {
      const [subId, ...rest] = dismissKey.split('_')
      const renewalDate = rest.join('_')
      if (subId && renewalDate) dismissNotifStage1(subId, renewalDate)
      window.history.replaceState({}, '', window.location.pathname)
    }

    return () => navigator.serviceWorker?.removeEventListener('message', handleSWMessage)
  }, [activeKeys]) // Re-runs when user changes (login/logout)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode)
    document.title = getNotificationTitle()
    localStorage.setItem(activeKeys.SETTINGS, JSON.stringify(settings))
  }, [settings, subscriptions, activeKeys])

  useEffect(() => {
    if (subscriptions.length) checkAndSendNotifications(subscriptions, settings)
  }, [subscriptions])

  // Mirror subscriptions to the server (debounced) so background push
  // reminders work even when the app is closed. Fire-and-forget.
  useEffect(() => {
    if (!userId || !hydrated) return
    const token = localStorage.getItem('subguard_token')
    if (!token) return
    const t = setTimeout(() => {
      fetch(`${API_URL}/api/subscriptions/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subscriptions }),
      }).catch(() => {})
    }, 2000)
    return () => clearTimeout(t)
  }, [subscriptions, userId, hydrated])

  function getNotificationTitle() {
    const urgent = subscriptions.filter(s => {
      if (s.status !== 'Active') return false
      const d = (new Date(s.nextBillingDate) - new Date()) / 86400000
      return d >= 0 && d <= 3
    }).length
    return urgent > 0 ? `RenewBell (${urgent})` : 'RenewBell'
  }

  function handleOnboardingClose() {
    localStorage.setItem(activeKeys.ONBOARDING, '1')
    setShowOnboarding(false)
  }

  function loadAll(keys) {
    // Advance stale billing dates: an auto-renewing sub whose nextBillingDate
    // already passed has really renewed — roll it forward to the next real
    // charge. Keeps every view honest AND keeps server push reminders alive
    // (the daily cron matches dates exactly 7/2/1 days ahead).
    const rawSubs = JSON.parse(localStorage.getItem(keys.SUBSCRIPTIONS) || '[]')
    let advancedAny = false
    const subs = rawSubs.map(s => {
      if (s.status !== 'Active' || s.autoRenewal === false || !s.nextBillingDate) return s
      const next = format(getNextChargeDate(s), 'yyyy-MM-dd')
      if (next === String(s.nextBillingDate).slice(0, 10)) return s
      advancedAny = true
      return { ...s, nextBillingDate: next }
    })
    if (advancedAny) localStorage.setItem(keys.SUBSCRIPTIONS, JSON.stringify(subs))
    setSubscriptions(subs)
    setReminders(JSON.parse(localStorage.getItem(keys.REMINDERS) || '[]'))
    setHousehold(JSON.parse(localStorage.getItem(keys.HOUSEHOLD) || '[]'))
    setScanHistory(JSON.parse(localStorage.getItem(keys.SCAN_HISTORY) || '[]'))
    setDismissedAlerts(JSON.parse(localStorage.getItem(keys.ALERTS_DISMISSED) || '[]'))
    setCancellations(JSON.parse(localStorage.getItem(keys.CANCELLATIONS) || '[]'))
    const storedSettings = JSON.parse(localStorage.getItem(keys.SETTINGS) || 'null')
    if (storedSettings) setSettings(s => ({
      ...defaultSettings(), ...storedSettings,
      notifications: { ...defaultSettings().notifications, ...storedSettings.notifications },
      display: { ...defaultSettings().display, ...storedSettings.display },
    }))
  }

  const save = useCallback((key, data, setter) => {
    localStorage.setItem(key, JSON.stringify(data))
    setter(data)
  }, [])

  function updateSettings(updates) {
    setSettings(s => {
      const next = { ...s, ...updates }
      localStorage.setItem(activeKeys.SETTINGS, JSON.stringify(next))
      return next
    })
  }

  const addSubscription    = useCallback((sub) => save(activeKeys.SUBSCRIPTIONS, [...subscriptions, sub], setSubscriptions), [subscriptions, save, activeKeys])
  const updateSubscription = useCallback((id, u) => save(activeKeys.SUBSCRIPTIONS, subscriptions.map(s => s.id === id ? { ...s, ...u, updatedAt: new Date().toISOString() } : s), setSubscriptions), [subscriptions, save, activeKeys])
  const deleteSubscription = useCallback((id)    => save(activeKeys.SUBSCRIPTIONS, subscriptions.filter(s => s.id !== id), setSubscriptions), [subscriptions, save, activeKeys])

  const addReminder    = useCallback((r)    => save(activeKeys.REMINDERS, [...reminders, r], setReminders), [reminders, save, activeKeys])
  const deleteReminder = useCallback((id)   => save(activeKeys.REMINDERS, reminders.filter(r => r.id !== id), setReminders), [reminders, save, activeKeys])

  const addMember    = useCallback((m)    => save(activeKeys.HOUSEHOLD, [...household, m], setHousehold), [household, save, activeKeys])
  const updateMember = useCallback((id, u) => save(activeKeys.HOUSEHOLD, household.map(m => m.id === id ? { ...m, ...u } : m), setHousehold), [household, save, activeKeys])
  const deleteMember = useCallback((id)   => save(activeKeys.HOUSEHOLD, household.filter(m => m.id !== id), setHousehold), [household, save, activeKeys])

  const addScanHistory = useCallback((entry) => save(activeKeys.SCAN_HISTORY, [entry, ...scanHistory].slice(0, 50), setScanHistory), [scanHistory, save, activeKeys])

  const dismissAlert = useCallback((alertId) => save(activeKeys.ALERTS_DISMISSED, [...dismissedAlerts, alertId], setDismissedAlerts), [dismissedAlerts, save, activeKeys])

  const addCancellation    = useCallback((c)    => save(activeKeys.CANCELLATIONS, [...cancellations, c], setCancellations), [cancellations, save, activeKeys])
  const updateCancellation = useCallback((id, u) => save(activeKeys.CANCELLATIONS, cancellations.map(c => c.id === id ? { ...c, ...u } : c), setCancellations), [cancellations, save, activeKeys])

  const ctx = {
    settings, updateSettings,
    subscriptions, addSubscription, updateSubscription, deleteSubscription,
    reminders, addReminder, deleteReminder,
    household, addMember, updateMember, deleteMember,
    scanHistory, addScanHistory,
    dismissedAlerts, dismissAlert,
    cancellations, addCancellation, updateCancellation,
    reloadData: () => loadAll(activeKeys),
    darkMode: settings.darkMode,
    setDarkMode: (v) => updateSettings({ darkMode: v }),
    activeKeys,  // exposed for Settings export/import/clear
    isPremium,   // exposed for plan gating
  }

  return (
    <AppContext.Provider value={ctx}>
      <div className={`min-h-screen transition-colors duration-300 ${settings.darkMode ? 'dark bg-slate-950' : 'bg-slate-100'}`}>
        <AnimatedRoutes />
        {showOnboarding && <OnboardingModal onClose={handleOnboardingClose} />}
      </div>
    </AppContext.Provider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AuthProvider>
  )
}
