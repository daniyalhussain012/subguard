import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, ExternalLink, Search } from 'lucide-react'

export default function AlternativeModal({ sub, onClose, onSave }) {
  const [notes, setNotes] = useState(sub.alternativeNotes || '')
  const searchName = encodeURIComponent(sub.name)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Find Cheaper Alternative</h2>
            <p className="text-xs text-slate-500 mt-0.5">for {sub.name}</p>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={17} /></button>
        </div>
        <div className="space-y-4">
          <div className="card p-4 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Search online</p>
            <a
              href={`https://www.google.com/search?q=cheaper+alternative+to+${searchName}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/25 rounded-lg text-blue-300 text-sm font-medium transition-colors"
            >
              <Search size={14} /> Google: "cheaper alternative to {sub.name}"
              <ExternalLink size={12} className="ml-auto" />
            </a>
            <a
              href={`https://alternativeto.net/software/${sub.name.toLowerCase().replace(/\s+/g, '-')}/`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/25 rounded-lg text-violet-300 text-sm font-medium transition-colors"
            >
              <ExternalLink size={14} /> Browse AlternativeTo.net
              <ExternalLink size={12} className="ml-auto" />
            </a>
          </div>
          <div>
            <label className="label">Notes on alternatives found</label>
            <textarea className="input min-h-[90px] resize-none" placeholder={`e.g. "Found Plex for free, Tubi has free streaming..."`} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => onSave(notes)} className="btn-primary flex-1 justify-center">Save Notes</button>
            <button onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
