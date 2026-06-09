import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, LayoutDashboard, Radar, Mail, Users2, TrendingDown,
  XCircle, Trophy, Settings, Plus, Sun, Moon, X, Bell,
  CreditCard, Calendar, DollarSign, MoreHorizontal, Home,
  LogOut, Zap, Crown
} from 'lucide-react'
import { useApp } from '../App'
import { useAuth } from '../contexts/AuthContext'
import { getNotificationBadgeCount } from '../utils/notifications'

const PRIMARY_NAV = [
  { to: '/', label: 'Command Center', icon: LayoutDashboard, end: true },
  { to: '/radar', label: 'Renewal Radar', icon: Radar },
  { to: '/scanner', label: 'Smart Scanner', icon: Mail },
  { to: '/household', label: 'Household Hub', icon: Users2 },
  { to: '/leaks', label: 'Money Leaks', icon: TrendingDown },
  { to: '/cancellation', label: 'Cancellation Center', icon: XCircle },
]

const SECONDARY_NAV = [
  { to: '/price-compare', label: 'Price Compare', icon: DollarSign },
  { to: '/victory', label: 'Savings Victory', icon: Trophy },
  { to: '/subscriptions', label: 'All Subscriptions', icon: CreditCard },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const MORE_ITEMS = [
  { to: '/subscriptions', label: 'All Subscriptions', icon: CreditCard },
  { to: '/household', label: 'Household Hub', icon: Users2 },
  { to: '/leaks', label: 'Money Leaks', icon: TrendingDown },
  { to: '/cancellation', label: 'Cancellation Center', icon: XCircle },
  { to: '/price-compare', label: 'Price Compare', icon: DollarSign },
  { to: '/victory', label: 'Savings Victory', icon: Trophy },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const FREE_SUB_LIMIT = 5

function NavItemEl({ to, label, icon: Icon, end, onClick, badge }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''} relative`}
    >
      <Icon size={17} />
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="w-5 h-5 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">{badge}</span>
      )}
    </NavLink>
  )
}

export default function Layout() {
  const { darkMode, setDarkMode, subscriptions, reminders, settings } = useApp()
  const { user, logout, isPremium } = useAuth()
  const [moreOpen, setMoreOpen] = useState(false)
  const navigate = useNavigate()

  const badgeCount = getNotificationBadgeCount(subscriptions, reminders)
  const activeSubs = subscriptions.filter(s => s.status === 'Active').length
  const atLimit = !isPremium && activeSubs >= FREE_SUB_LIMIT

  const displayName = user?.name || settings?.profile?.name || ''
  const displayAvatar = user?.avatar
    ? <img src={user.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
    : <span className="text-base">{settings?.profile?.avatar || '\u{1F464}'}</span>

  function handleAddSub() {
    if (atLimit) { navigate('/upgrade') } else { navigate('/add') }
  }

  const SidebarContent = ({ onClose }) => (
    <>
      <div className={`p-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ShieldCheck size={17} className="text-white" />
          </div>
          <div>
            <div className={`font-bold text-sm leading-none ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>SubGuard</div>
            <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Stop getting charged for things<br/>you forgot about.</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2 mt-1">Main</div>
        {PRIMARY_NAV.map(item => (
          <NavItemEl key={item.to} {...item} onClick={onClose} badge={item.to === '/' ? badgeCount : 0} />
        ))}
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2 mt-4">More</div>
        {SECONDARY_NAV.map(item => (
          <NavItemEl key={item.to} {...item} onClick={onClose} />
        ))}
        {!isPremium && (
          <NavLink to="/upgrade" onClick={onClose}
            className={({ isActive }) => `nav-item mt-1 ${isActive ? 'nav-item-active' : 'text-amber-400 hover:bg-amber-500/10'}`}
          >
            <Zap size={17} className="text-amber-400" />
            <span className="flex-1 font-semibold">Upgrade to Pro</span>
            {atLimit && <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">FULL</span>}
          </NavLink>
        )}
      </nav>

      <div className={`p-3 border-t space-y-1.5 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className={`flex items-center gap-2 px-2 py-1.5 mb-1 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
          {displayAvatar}
          <div className="flex-1 min-w-0">
            <div className={`text-xs font-semibold truncate ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{displayName || 'My Account'}</div>
            <div className="text-[10px] text-slate-500">{user?.email || 'Household admin'}</div>
          </div>
          {isPremium ? (
            <span className="flex items-center gap-0.5 text-[9px] font-bold bg-gradient-to-r from-amber-500 to-amber-400 text-white px-1.5 py-0.5 rounded-full shrink-0">
              <Crown size={8} /> PRO
            </span>
          ) : (
            <span className="text-[9px] font-bold bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full shrink-0">FREE</span>
          )}
        </div>

        <button onClick={() => { handleAddSub(); onClose?.() }}
          className={`btn-primary w-full justify-center text-xs py-2 ${atLimit ? 'opacity-80' : ''}`}>
          {atLimit ? <><Zap size={14} /> Upgrade to Add More</> : <><Plus size={14} /> Add Subscription</>}
        </button>

        <button onClick={() => setDarkMode(!darkMode)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${darkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>

        <button onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </>
  )

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <aside className={`hidden lg:flex flex-col w-56 shrink-0 border-r ${darkMode ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200'}`}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className={`lg:hidden flex items-center justify-between px-4 py-3 border-b shrink-0 ${darkMode ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <ShieldCheck size={14} className="text-white" />
            </div>
            <span className={`font-bold text-base ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>SubGuard</span>
          </div>
          <div className="flex items-center gap-3">
            {badgeCount > 0 && (
              <div className="relative">
                <Bell size={20} className="text-slate-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">{badgeCount}</span>
              </div>
            )}
            <button onClick={() => setDarkMode(!darkMode)} className="btn-icon" style={{ minWidth: 44, minHeight: 44 }}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 lg:px-6 py-5 pb-28 lg:pb-6">
            <Outlet />
          </div>
        </main>

        <nav className={`lg:hidden fixed bottom-0 left-0 right-0 border-t z-30 ${darkMode ? 'bg-[#0F172A]/95 border-slate-800' : 'bg-white/95 border-slate-200'} backdrop-blur-md`}
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="flex items-center justify-around px-2">
            <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl text-[10px] font-semibold transition-colors min-w-[44px] min-h-[44px] ${isActive ? 'text-cyan-400' : darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              <Home size={20} /><span>Home</span>
            </NavLink>
            <NavLink to="/radar" className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl text-[10px] font-semibold transition-colors min-w-[44px] min-h-[44px] ${isActive ? 'text-cyan-400' : darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              <Radar size={20} /><span>Radar</span>
            </NavLink>
            <button onClick={handleAddSub} className="flex flex-col items-center justify-center -mt-5 relative" style={{ minWidth: 56, minHeight: 56 }}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform ${atLimit ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/40' : 'bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-cyan-500/40'}`}>
                {atLimit ? <Zap size={24} className="text-white" strokeWidth={2.5} /> : <Plus size={26} className="text-white" strokeWidth={2.5} />}
              </div>
            </button>
            <NavLink to="/scanner" className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl text-[10px] font-semibold transition-colors min-w-[44px] min-h-[44px] ${isActive ? 'text-cyan-400' : darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              <Mail size={20} /><span>Scan</span>
            </NavLink>
            <button onClick={() => setMoreOpen(true)} className={`flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl text-[10px] font-semibold transition-colors min-w-[44px] min-h-[44px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              <MoreHorizontal size={20} /><span>More</span>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {moreOpen && (
            <>
              <motion.div className="lg:hidden fixed inset-0 bg-black/60 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMoreOpen(false)} />
              <motion.div
                className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
              >
                <div className="flex justify-center pt-3 pb-1">
                  <div className={`w-10 h-1 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className={`font-bold text-sm ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>More</span>
                  <button onClick={() => setMoreOpen(false)} className="btn-icon"><X size={18} /></button>
                </div>
                <div className="grid grid-cols-2 gap-2 px-4 pb-3">
                  {MORE_ITEMS.map(({ to, label, icon: Icon }) => (
                    <NavLink key={to} to={to} onClick={() => setMoreOpen(false)}
                      className={({ isActive }) => `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-cyan-500/15 text-cyan-400' : darkMode ? 'bg-slate-800 text-slate-300 active:bg-slate-700' : 'bg-slate-100 text-slate-700 active:bg-slate-200'}`}
                    >
                      <Icon size={18} /><span>{label}</span>
                    </NavLink>
                  ))}
                  {!isPremium && (
                    <NavLink to="/upgrade" onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold bg-amber-500/10 text-amber-400 col-span-2"
                    >
                      <Zap size={18} /><span>Upgrade to Pro — $5 one-time</span>
                    </NavLink>
                  )}
                </div>

                <div className={`mx-4 mb-4 p-3 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {user?.avatar
                        ? <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                        : <span className="text-xl">{settings?.profile?.avatar || '\u{1F464}'}</span>
                      }
                      <div>
                        <div className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{displayName || 'My Account'}</div>
                        <div className="flex items-center gap-1.5">
                          <div className="text-xs text-slate-500">{isPremium ? 'Pro Plan' : 'Free Plan'}</div>
                          {isPremium
                            ? <span className="text-[9px] font-bold bg-gradient-to-r from-amber-500 to-amber-400 text-white px-1.5 py-0.5 rounded-full">PRO</span>
                            : <span className="text-[9px] font-bold bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full">FREE</span>
                          }
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setDarkMode(!darkMode)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-600'}`}>
                      {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                      {darkMode ? 'Light' : 'Dark'}
                    </button>
                  </div>
                  <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
  }
