import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, eachDayOfInterval, isSameMonth,
  isToday, parseISO
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useApp } from '../App'
import { getMonthlyAmount, formatCurrency, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/storage'

export default function CalendarView() {
  const { subscriptions, darkMode } = useApp()
  const navigate = useNavigate()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const active = useMemo(() => subscriptions.filter(s => s.status === 'Active'), [subscriptions])

  const monthlyTotal = useMemo(() => active.reduce((s, sub) => s + getMonthlyAmount(sub), 0), [active])

  const chargeMap = useMemo(() => {
    const map = {}
    active.forEach(sub => {
      const key = sub.nextBillingDate?.slice(0, 10)
      if (!key) return
      if (!map[key]) map[key] = []
      map[key].push(sub)
    })
    return map
  }, [active])

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={19} className="text-blue-400" />
            <h1 className="page-header mb-0">Billing Calendar</h1>
          </div>
          <p className="text-sm text-slate-500">View upcoming charges by date</p>
        </div>
        <div className="card px-4 py-2 flex items-center gap-2">
          <span className="text-sm font-bold text-cyan-400">{formatCurrency(monthlyTotal)}</span>
          <span className="text-xs text-slate-500">/mo active</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="btn-icon"><ChevronLeft size={19} /></button>
          <h2 className="font-bold text-slate-100">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="btn-icon"><ChevronRight size={19} /></button>
        </div>
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map(d => <div key={d} className="text-center text-[11px] font-bold text-slate-600 py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(day => {
            const key = format(day, 'yyyy-MM-dd')
            const daySubs = chargeMap[key] || []
            const inMonth = isSameMonth(day, currentMonth)
            const todayDay = isToday(day)
            return (
              <div key={key} className={`calendar-day ${!inMonth ? 'calendar-day-other' : ''} ${todayDay ? 'calendar-day-today' : ''}`}>
                <div className={`text-[11px] font-bold px-0.5 mb-0.5 ${todayDay ? 'text-cyan-400' : inMonth ? 'text-slate-400' : 'text-slate-700'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {daySubs.slice(0, 2).map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => navigate(`/edit/${sub.id}`)}
                      className="w-full text-left truncate rounded px-0.5 py-0.5 text-[9px] font-semibold leading-tight hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: (CATEGORY_COLORS[sub.category] || '#6b7280') + '30', color: CATEGORY_COLORS[sub.category] || '#6b7280', borderLeft: `2px solid ${CATEGORY_COLORS[sub.category] || '#6b7280'}` }}
                      title={`${sub.name} — ${formatCurrency(sub.amount)}`}
                    >
                      {sub.name}
                    </button>
                  ))}
                  {daySubs.length > 2 && <div className="text-[9px] text-slate-600 px-0.5">+{daySubs.length - 2}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Charges list */}
      <div>
        <h2 className="section-title">All Upcoming Charges</h2>
        {Object.keys(chargeMap).length === 0 ? (
          <div className="card p-8 text-center text-slate-500 text-sm">No charges found. Add subscriptions to see them here.</div>
        ) : (
          <div className="space-y-2">
            {Object.entries(chargeMap)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([dateKey, subs]) => (
                <div key={dateKey} className="card p-4 flex items-start gap-4">
                  <div className="text-center w-10 shrink-0">
                    <div className="text-[10px] text-slate-600 font-bold">{format(parseISO(dateKey), 'MMM').toUpperCase()}</div>
                    <div className="text-2xl font-black text-slate-100 leading-none">{format(parseISO(dateKey), 'd')}</div>
                    <div className="text-[10px] text-slate-600">{format(parseISO(dateKey), 'EEE')}</div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {subs.map(sub => (
                      <div key={sub.id} className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate(`/edit/${sub.id}`)}>
                        <span className="text-base">{CATEGORY_ICONS[sub.category]}</span>
                        <span className="text-sm text-slate-300 group-hover:text-cyan-300 transition-colors flex-1 truncate">{sub.name}</span>
                        <span className="text-sm font-bold text-slate-100 shrink-0">{formatCurrency(sub.amount)}</span>
                        <span className="text-xs text-slate-600 shrink-0 hidden sm:inline">{sub.billingCycle}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-slate-100">{formatCurrency(subs.reduce((s, sub) => s + sub.amount, 0))}</div>
                    <div className="text-xs text-slate-600">{subs.length} charge{subs.length > 1 ? 's' : ''}</div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="card p-4">
        <h3 className="section-title">Category Colors</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs text-slate-500">{CATEGORY_ICONS[cat]} {cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
