import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { CATEGORY_ICONS } from '../utils/storage'
import { searchKnownServices } from '../data/knownServices'

export default function ServiceAutocomplete({ value, onChange, onSelect, error }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const [autofillNote, setAutofillNote] = useState(false)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleChange(e) {
    const v = e.target.value
    onChange(v)
    setAutofillNote(false)
    if (v.length >= 2) {
      const results = searchKnownServices(v)
      setSuggestions(results)
      setOpen(results.length > 0)
      setHighlighted(0)
    } else {
      setSuggestions([])
      setOpen(false)
    }
  }

  function handleSelect(service) {
    onSelect(service)
    setOpen(false)
    setSuggestions([])
    setAutofillNote(service.defaultAmount > 0)
  }

  function handleKeyDown(e) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(h => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && suggestions[highlighted]) {
      e.preventDefault()
      handleSelect(suggestions[highlighted])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          ref={inputRef}
          className={`input pl-8 ${error ? 'border-red-500/60' : ''}`}
          placeholder="e.g. Netflix, Spotify, Adobe..."
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && suggestions.length > 0 && setOpen(true)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>

      {autofillNote && (
        <p className="text-xs text-cyan-400/80 mt-1">
          💡 Price auto-filled based on common plan. Adjust if needed.
        </p>
      )}

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={s.name}
              type="button"
              onMouseDown={e => { e.preventDefault(); handleSelect(s) }}
              onMouseEnter={() => setHighlighted(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                i === highlighted ? 'bg-cyan-500/15' : 'hover:bg-slate-800/60'
              }`}
            >
              <span className="text-base shrink-0">{CATEGORY_ICONS[s.category] || '📦'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-200 truncate">{s.name}</div>
                <div className="text-xs text-slate-500">{s.category}{s.defaultAmount > 0 ? ` · from $${s.defaultAmount.toFixed(2)}/mo` : ''}</div>
              </div>
              <ChevronRight size={13} className="text-slate-600 shrink-0" />
            </button>
          ))}
          <div className="px-3 py-2 border-t border-slate-800/60">
            <span className="text-xs text-slate-600">Not listed? Just type the name freely.</span>
          </div>
        </div>
      )}
    </div>
  )
}
