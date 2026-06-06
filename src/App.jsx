import React, { useState, useEffect, createContext, useContext, useCallback, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from './components/Layout'
import OnboardingModal from './components/OnboardingModal'
import { initData, KEYS, defaultSettings } from './utils/storage'
import { checkAndSendNotifications, registerServiceWorker, dismissNotifStage1 } from './utils/notifications'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
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
export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)
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
function AuthCallback() {
  const { handleAuthCallback } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    if (token) { handleAuthCallback(token); navigate('/', { replace: true }) }
    else navigate('/login?error=no_token', { replace: true })
  }, [])
  return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>
}
function AuthGate({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/" element={<AuthGate><Layout /></AuthGate>}>
              <Route index element={<Dashboard />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="add" element={<AddEditSubscription />} />
              <Route path="edit/:id" element={<AddEditSubscription />} />
              <Route path="calendar" element={<CalendarView />} />
              <Route path="radar" element={<RenewalRadar />} />
              <Route path="scanner" element={<SmartScanner />} />
              <Route path="household" element={<HouseholdHub />} />
              <Route path="leaks" element={<MoneyLeaksDetective />} />
              <Route path="cancellation" element={<CancellationCenter />} />
              <Route path="price-compare" element={<PriceCompare />} />
              <Route path="victory" element={<SavingsVictoryBoard />} />
              <Route path="settings" element={<Settings />} />
              <Route path="report" element={<Navigate to="/leaks" replace />} />
              <Route path="smart-add" element={<Navigate to="/scanner" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}
export default function App() {
  const [settings, setSettings] = useState(defaultSettings())
  const [subscriptions, setSubscriptions] = useState([])
  const [reminders, setReminders] = useState([])
  const [household, setHousehold] = useState([])
  const [scanHistory, setScanHistory] = useState([])
  const [dismissedAlerts, setDismissedAlerts] = useState([])
  const [cancellations, setCancellations] = useState([])
  const [showOnboarding, setShowOnboarding] = useState(false)
  useEffect(() => {
    initData()
    loadAll()
    registerServiceWorker()
    if (!localStorage.getItem('subguard_onboarding_done')) setShowOnboarding(true)
    const handleSWMessage = (event) => {
      if (event.data?.type === 'DISMISS_NOTIF_CYCLE') {
        const { subId, renewalDate } = event.data
        if (subId && renewalDate) dismissNotifStage1(subId, renewalDate)
      }
    }
    navigator.serviceWorker?.addEventListener('message', handleSWMessage)
    const params = new URLSearchParams(window.location.search)
    const dismissKey = params.get('dismiss')
    if (dismissKey) {
      const [subId, ...rest] = dismissKey.split('_')
      const renewalDate = rest.join('_')
      if (subId && renewalDate) dismissNotifStage1(subId, renewalDate)
      window.history.replaceState({}, '', window.location.pathname)
    }
    return () => navigator.serviceWorker?.removeEventListener('message', handleSWMessage)
  }, [])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode)
    document.title = getNotificationTitle()
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings))
  }, [settings, subscriptions])
  useEffect(() => {
    if (subscriptions.length) checkAndSendNotifications(subscriptions, settings)
  }, [subscriptions])
  function getNotificationTitle() {
    const urgent = subscriptions.filter(s => {
      if (s.status !== 'Active') return false
      const d = (new Date(s.nextBillingDate) - new Date()) / 86400000
      return d >= 0 && d <= 3
    }).length
    return urgent > 0 ? `SubGuard (${urgent})` : 'SubGuard'
  }
  function handleOnboardingClose() {
    localStorage.setItem('subguard_onboarding_done', '1')
    setShowOnboarding(false)
  }
  function loadAll() {
    setSubscriptions(JSON.parse(localStorage.getItem(KEYS.SUBSCRIPTIONS) || '[]'))
    setReminders(JSON.parse(localStorage.getItem(KEYS.REMINDERS) || '[]'))
    setHousehold(JSON.parse(localStorage.getItem(KEYS.HOUSEHOLD) || '[]'))
    setScanHistory(JSON.parse(localStorage.getItem(KEYS.SCAN_HISTORY) || '[]'))
    setDismissedAlerts(JSON.parse(localStorage.getItem(KEYS.ALERTS_DISMISSED) || '[]'))
    setCancellations(JSON.parse(localStorage.getItem(KEYS.CANCELLATIONS) || '[]'))
    const storedSettings = JSON.parse(localStorage.getItem(KEYS.SETTINGS) || 'null')
    if (storedSettings) setSettings(s => ({ ...defaultSettings(), ...storedSettings, notifications: { ...defaultSettings().notifications, ...storedSettings.notifications }, display: { ...defaultSettings().display, ...storedSettings.display } }))
  }
  const save = useCallback((key, data, setter) => {
    localStorage.setItem(key, JSON.stringify(data))
    setter(data)
  }, [])
  function updateSettings(updates) {
    setSettings(s => {
      const next = { ...s, ...updates }
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(next))
      return next
    })
  }
  const addSubscription = useCallback((sub) => { const next = [...subscriptions, sub]; save(KEYS.SUBSCRIPTIONS, next, setSubscriptions) }, [subscriptions, save])
  const updateSubscription = useCallback((id, updates) => { const next = subscriptions.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s); save(KEYS.SUBSCRIPTIONS, next, setSubscriptions) }, [subscriptions, save])
  const deleteSubscription = useCallback((id) => { save(KEYS.SUBSCRIPTIONS, subscriptions.filter(s => s.id !== id), setSubscriptions) }, [subscriptions, save])
  const addReminder = useCallback((r) => save(KEYS.REMINDERS, [...reminders, r], setReminders), [reminders, save])
  const deleteReminder = useCallback((id) => save(KEYS.REMINDERS, reminders.filter(r => r.id !== id), setReminders), [reminders, save])
  const addMember = useCallback((m) => save(KEYS.HOUSEHOLD, [...household, m], setHousehold), [household, save])
  const updateMember = useCallback((id, u) => save(KEYS.HOUSEHOLD, household.map(m => m.id === id ? { ...m, ...u } : m), setHousehold), [household, save])
  const deleteMember = useCallback((id) => save(KEYS.HOUSEHOLD, household.filter(m => m.id !== id), setHousehold), [household, save])
  const addScanHistory = useCallback((entry) => { const next = [entry, ...scanHistory].slice(0, 50); save(KEYS.SCAN_HISTORY, next, setScanHistory) }, [scanHistory, save])
  const dismissAlert = useCallback((alertId) => { const next = [...dismissedAlerts, alertId]; save(KEYS.ALERTS_DISMISSED, next, setDismissedAlerts) }, [dismissedAlerts, save])
  const addCancellation = useCallback((c) => save(KEYS.CANCELLATIONS, [...cancellations, c], setCancellations), [cancellations, save])
  const updateCancellation = useCallback((id, u) => save(KEYS.CANCELLATIONS, cancellations.map(c => c.id === id ? { ...c, ...u } : c), setCancellations), [cancellations, save])
  const ctx = {
    settings, updateSettings,
    subscriptions, addSubscription, updateSubscription, deleteSubscription,
    reminders, addReminder, deleteReminder,
    household, addMember, updateMember, deleteMember,
    scanHistory, addScanHistory,
    dismissedAlerts, dismissAlert,
    cancellations, addCancellation, updateCancellation,
    reloadData: loadAll,
    darkMode: settings.darkMode,
    setDarkMode: (v) => updateSettings({ darkMode: v }),
  }
  return (
    <AuthProvider>
      <AppContext.Provider value={ctx}>
        <BrowserRouter>
          <div className={`min-h-screen transition-colors duration-300 ${settings.darkMode ? 'dark bg-slate-950' : 'bg-slate-100'}`}>
            <AnimatedRoutes />
            {showOnboarding && <OnboardingModal onClose={handleOnboardingClose} />}
          </div>
        </BrowserRouter>
      </AppContext.Provider>
    </AuthProvider>
  )
}
