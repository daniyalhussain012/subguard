import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { Users2, Plus, X, Edit2, UserPlus, AlertTriangle, DollarSign } from 'lucide-react'
import { useApp } from '../App'
import { AVATAR_OPTIONS, FAMILY_ROLES, getMonthlyAmount, formatCurrency, CATEGORY_ICONS } from '../utils/storage'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

function MemberForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [role, setRole] = useState(initial?.role || 'Me')
  const [avatar, setAvatar] = useState(initial?.avatar || '👤')

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Name</label>
        <input className="input" placeholder="Family member name" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label className="label">Role</label>
        <select className="input" value={role} onChange={e => setRole(e.target.value)}>
          {FAMILY_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Avatar</label>
        <div className="grid grid-cols-6 gap-2">
          {AVATAR_OPTIONS.map(av => (
            <button
              key={av}
              type="button"
              onClick={() => setAvatar(av)}
              className={`text-2xl p-2 rounded-xl transition-all ${avatar === av ? 'bg-cyan-500/20 ring-2 ring-cyan-500/50' : 'hover:bg-slate-700/40'}`}
            >
              {av}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => name.trim() && onSave({ name: name.trim(), role, avatar })}
          className="btn-primary flex-1 justify-center"
        >
          {initial ? 'Save Changes' : 'Add Member'}
        </button>
        <button onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </div>
  )
}

export default function HouseholdHub() {
  const { household, addMember, updateMember, deleteMember, subscriptions, updateSubscription, darkMode } = useApp()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [expandedSub, setExpandedSub] = useState(null)

  const active = useMemo(() => subscriptions.filter(s => s.status === 'Active'), [subscriptions])

  function handleAddMember(data) {
    addMember({ id: uuidv4(), ...data, createdAt: new Date().toISOString() })
    setShowAddForm(false)
  }

  function handleUpdateMember(id, data) {
    updateMember(id, data)
    setEditingId(null)
  }

  function toggleMemberOnSub(subId, memberId) {
    const sub = subscriptions.find(s => s.id === subId)
    if (!sub) return
    const current = sub.usedBy || []
    const next = current.includes(memberId)
      ? current.filter(id => id !== memberId)
      : [...current, memberId]
    updateSubscription(subId, { usedBy: next })
  }

  // Per-member spend
  const memberSpend = useMemo(() => {
    return household.map(m => {
      const mySubs = active.filter(s => (s.usedBy || []).includes(m.id))
      const spend = mySubs.reduce((sum, s) => sum + getMonthlyAmount(s), 0)
      return { ...m, spend, subCount: mySubs.length }
    })
  }, [household, active])

  // Shared vs individual
  const sharedSubs = active.filter(s => (s.usedBy || []).length > 1)
  const individualSubs = active.filter(s => (s.usedBy || []).length === 1)
  const nobodySubs = active.filter(s => (s.usedBy || []).length === 0)

  const sharedSpend = sharedSubs.reduce((sum, s) => sum + getMonthlyAmount(s), 0)
  const totalSpend = active.reduce((sum, s) => sum + getMonthlyAmount(s), 0)

  // Duplicate detection: same name root, multiple subscriptions
  const duplicates = useMemo(() => {
    const nameGroups = {}
    active.forEach(sub => {
      const key = sub.name.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').replace(/\s+/g, ' ').trim()
      if (!nameGroups[key]) nameGroups[key] = []
      nameGroups[key].push(sub)
    })
    return Object.values(nameGroups).filter(g => g.length > 1)
  }, [active])

  // Pie chart data: per member
  const pieData = memberSpend.filter(m => m.spend > 0).map(m => ({
    name: `${m.avatar} ${m.name}`,
    value: parseFloat(m.spend.toFixed(2))
  }))
  const PIE_COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users2 size={19} className="text-emerald-400" />
            <h1 className="page-header mb-0">Household Hub</h1>
          </div>
          <p className="page-sub mb-0">Manage subscriptions across your whole household</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-primary">
          <UserPlus size={15} /> Add Member
        </button>
      </div>

      {/* Add Member Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card p-5">
            <h2 className="font-bold text-slate-100 mb-4">Add Family Member</h2>
            <MemberForm onSave={handleAddMember} onCancel={() => setShowAddForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Member Cards */}
      {household.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-3">👨‍👩‍👧‍👦</div>
          <h3 className="font-bold text-slate-200 mb-2">No family members yet</h3>
          <p className="text-sm text-slate-500 mb-4">Add household members to track who uses what</p>
          <button onClick={() => setShowAddForm(true)} className="btn-primary mx-auto"><UserPlus size={15} /> Add First Member</button>
        </div>
      ) : (
        <div>
          <span className="section-title">Members</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {household.map(member => (
              <div key={member.id}>
                {editingId === member.id ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-4">
                    <MemberForm
                      initial={member}
                      onSave={(data) => handleUpdateMember(member.id, data)}
                      onCancel={() => setEditingId(null)}
                    />
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.01 }} className="card p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{member.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-100">{member.name}</div>
                        <div className="text-xs text-slate-500">{member.role}</div>
                        <div className="text-xs text-cyan-400 mt-0.5">
                          {formatCurrency(memberSpend.find(m => m.id === member.id)?.spend || 0)}/mo
                          · {memberSpend.find(m => m.id === member.id)?.subCount || 0} subs
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => setEditingId(member.id)} className="btn-icon p-1.5"><Edit2 size={13} /></button>
                        <button onClick={() => deleteMember(member.id)} className="btn-icon p-1.5 text-red-400"><X size={13} /></button>
                      </div>
                    </div>
                    {(() => {
                      const memberSubs = active.filter(s => (s.usedBy || []).includes(member.id))
                      if (memberSubs.length === 0) return (
                        <p className="text-xs text-slate-600 pl-1">No subscriptions assigned yet</p>
                      )
                      return (
                        <div className="space-y-1 border-t border-slate-700/40 pt-2">
                          {memberSubs.map(s => (
                            <div key={s.id} className="flex items-center gap-2 text-xs">
                              <span>{CATEGORY_ICONS[s.category]}</span>
                              <span className="text-slate-300 flex-1 truncate">{s.name}</span>
                              <span className="text-slate-500 shrink-0">{formatCurrency(getMonthlyAmount(s))}/mo</span>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Duplicate Detection */}
      {duplicates.length > 0 && (
        <div>
          <span className="section-title text-amber-400">⚠️ Duplicate Detection</span>
          <div className="space-y-2">
            {duplicates.map((group, i) => {
              const total = group.reduce((s, sub) => s + getMonthlyAmount(sub), 0)
              const familyEstimate = total * 0.65
              const savings = total - familyEstimate
              const baseName = group[0].name.replace(/\s*\(.*?\)\s*/g, '').trim()
              const userNames = group.map(sub => {
                const users = household.filter(m => (sub.usedBy || []).includes(m.id))
                return users.length > 0 ? users.map(u => u.name).join(' & ') : sub.name
              }).join(' and ')
              return (
                <div key={i} className="card border-amber-500/25 bg-amber-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-amber-300 text-sm">
                        ⚠️ {userNames} both have {baseName} — consider a Family Plan!
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {group.map(sub => (
                          <span key={sub.id} className="text-xs bg-slate-700/50 px-2 py-1 rounded-full text-slate-300">
                            {sub.name} · {formatCurrency(getMonthlyAmount(sub))}/mo
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-emerald-400 mt-2">
                        Combined: {formatCurrency(total)}/mo → Family Plan ≈ {formatCurrency(familyEstimate)}/mo · Save ~{formatCurrency(savings)}/mo
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Nobody using alert */}
      {nobodySubs.length > 0 && (
        <div>
          <span className="section-title text-red-400">👻 Unused by Anyone</span>
          <div className="space-y-2">
            {nobodySubs.map(sub => (
              <div key={sub.id} className="card border-red-500/25 bg-red-500/5 p-3 flex items-center gap-3">
                <span className="text-xl">{CATEGORY_ICONS[sub.category]}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-100">{sub.name}</div>
                  <div className="text-xs text-red-400">Nobody in your household is tagged as using this</div>
                </div>
                <div className="text-sm font-bold text-slate-100">{formatCurrency(getMonthlyAmount(sub))}/mo</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spend breakdown charts */}
      {household.length > 0 && active.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Per-member spend */}
          <div className="card p-5">
            <span className="section-title">Spend Per Member</span>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" strokeWidth={0}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">Tag subscriptions to members to see breakdown</p>
            )}
          </div>
          {/* Summary stats */}
          <div className="card p-5 space-y-3">
            <span className="section-title">Household Summary</span>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
                <span className="text-sm text-slate-400">Total household spend</span>
                <span className="font-bold text-slate-100">{formatCurrency(totalSpend)}/mo</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
                <span className="text-sm text-slate-400">Shared subscriptions</span>
                <span className="font-semibold text-cyan-400">{formatCurrency(sharedSpend)}/mo</span>
              </div>
              {memberSpend.map(m => (
                <div key={m.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-800/30">
                  <span className="text-sm text-slate-400">{m.avatar} {m.name}</span>
                  <span className="font-semibold text-slate-200">{formatCurrency(m.spend)}/mo · {m.subCount} subs</span>
                </div>
              ))}
            </div>
            <div className="card border-cyan-500/20 p-3 text-center">
              <p className="text-xs text-slate-500">Your household spends</p>
              <p className="text-2xl font-bold text-cyan-400">{formatCurrency(totalSpend * 12)}/year</p>
              <p className="text-xs text-slate-500">on subscriptions</p>
            </div>
          </div>
        </div>
      )}

      {/* Assign Members to Subscriptions */}
      {household.length > 0 && active.length > 0 && (
        <div>
          <span className="section-title">Who Uses What?</span>
          <div className="space-y-2">
            {active.map(sub => (
              <div key={sub.id} className="card p-4">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setExpandedSub(s => s === sub.id ? null : sub.id)}
                >
                  <span className="text-xl">{CATEGORY_ICONS[sub.category]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-100 text-sm">{sub.name}</div>
                    <div className="text-xs text-slate-500">{formatCurrency(getMonthlyAmount(sub))}/mo</div>
                  </div>
                  <div className="flex gap-1">
                    {(sub.usedBy || []).map(mid => {
                      const m = household.find(h => h.id === mid)
                      return m ? <span key={mid} className="text-base">{m.avatar}</span> : null
                    })}
                    {(sub.usedBy || []).length === 0 && <span className="text-xs text-slate-600">No one tagged</span>}
                  </div>
                </div>
                <AnimatePresence>
                  {expandedSub === sub.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pt-3 border-t border-slate-700/40 mt-3">
                        <p className="text-xs text-slate-500 mb-2">Who uses {sub.name}?</p>
                        <div className="flex gap-2 flex-wrap">
                          {household.map(m => (
                            <button
                              key={m.id}
                              onClick={() => toggleMemberOnSub(sub.id, m.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                                (sub.usedBy || []).includes(m.id)
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                  : 'bg-slate-700/30 text-slate-500 border-slate-600/30 hover:border-slate-500'
                              }`}
                            >
                              {m.avatar} {m.name}
                              {(sub.usedBy || []).includes(m.id) && <span>✓</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
