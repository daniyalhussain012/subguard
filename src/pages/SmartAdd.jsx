import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Clipboard, ArrowRight, RefreshCw, Info } from 'lucide-react'
import { useApp } from '../App'
import { format, addDays } from 'date-fns'
import { CATEGORIES } from '../utils/storage'

// Try to parse subscription info from pasted text
function parseReceiptText(text) {
  const result = {}

  // Amount: look for $ patterns
  const amountMatch = text.match(/\$\s*(\d+(?:\.\d{1,2})?)/i)
  if (amountMatch) result.amount = amountMatch[1]

  // Date patterns
  const datePatterns = [
    /(?:next\s+(?:billing|charge|renewal|payment)\s+(?:date|on))?\s*:?\s*(\w+ \d{1,2},?\s*\d{4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(?:due|expires?|renews?|billed)\s+(?:on\s+)?(\w+ \d{1,2},?\s*\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
  ]
  for (const pat of datePatterns) {
    const m = text.match(pat)
    if (m) {
      try {
        const d = new Date(m[1])
        if (!isNaN(d.getTime())) {
          result.nextBillingDate = format(d, 'yyyy-MM-dd')
          break
        }
      } catch {}
    }
  }

  // Billing cycle
  if (/\b(annual|yearly|per year|\/year)\b/i.test(text)) result.billingCycle = 'Yearly'
  else if (/\b(quarter|3.month|every 3 month)\b/i.test(text)) result.billingCycle = 'Quarterly'
  else if (/\b(week|7.day)\b/i.test(text)) result.billingCycle = 'Weekly'
  else result.billingCycle = 'Monthly'

  // Service name — look for common patterns
  const namePatterns = [
    /(?:thank you for|your|payment for|receipt for|subscription to)\s+([A-Z][A-Za-z0-9\s]+?)(?:\s+(?:subscription|membership|plan|account))/i,
    /^([A-Z][A-Za-z0-9]+(?:\s[A-Z][A-Za-z0-9]+)?)\s*(?:invoice|receipt|billing|statement)/im,
  ]
  for (const pat of namePatterns) {
    const m = text.match(pat)
    if (m && m[1].length < 50) {
      result.name = m[1].trim()
      break
    }
  }

  // Auto-detect category based on keywords
  const lower = text.toLowerCase()
  if (/netflix|hulu|disney|hbo|peacock|paramount|apple tv|streaming/i.test(lower)) result.category = 'Streaming'
  else if (/spotify|apple music|tidal|pandora|youtube music|deezer|music/i.test(lower)) result.category = 'Music'
  else if (/adobe|microsoft|office|slack|notion|zoom|github|software/i.test(lower)) result.category = 'Software'
  else if (/playstation|xbox|steam|nintendo|gaming|game pass/i.test(lower)) result.category = 'Gaming'
  else if (/icloud|dropbox|google one|onedrive|cloud storage/i.test(lower)) result.category = 'Cloud Storage'
  else if (/gym|fitness|planet fitness|peloton|workout/i.test(lower)) result.category = 'Fitness'
  else if (/new york times|washington post|wsj|news|magazine|nyt/i.test(lower)) result.category = 'News/Magazine'
  else if (/amazon prime|instacart|doordash|ubereats|grubhub|delivery/i.test(lower)) result.category = 'Food Delivery'
  else if (/amazon|shopify|shopping|prime/i.test(lower)) result.category = 'Shopping'
  else if (/electric|gas|water|internet|comcast|att|verizon|utility/i.test(lower)) result.category = 'Utilities'
  else if (/insurance|geico|progressive|allstate|state farm/i.test(lower)) result.category = 'Insurance'
  else if (/phone|mobile|t-mobile|sprint|verizon wireless|at&t/i.test(lower)) result.category = 'Phone/Internet'

  return result
}

const SAMPLE_RECEIPTS = [
  `Thank you for your Netflix subscription!
Your plan: Standard with ads
Amount: $6.99
Next billing date: May 15, 2024
Payment method: Visa ending 4242`,

  `Spotify Receipt
You've been charged $9.99 for your Individual Plan.
Billing period: Monthly
Next renewal: April 28, 2024
Thank you for being a Spotify subscriber!`,

  `Adobe Creative Cloud - Invoice
Annual subscription renewed
Amount: $659.88/year ($54.99/month)
Renewal date: 06/01/2024
All Apps plan`,
]

export default function SmartAdd() {
  const { darkMode } = useApp()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState(null)
  const [parsing, setParsing] = useState(false)

  function handleParse() {
    if (!text.trim()) return
    setParsing(true)
    setTimeout(() => {
      const result = parseReceiptText(text)
      setParsed(result)
      setParsing(false)
    }, 600)
  }

  function handleUseData() {
    const prefill = {
      ...parsed,
      nextBillingDate: parsed.nextBillingDate || format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    }
    sessionStorage.setItem('subguard_prefill', JSON.stringify(prefill))
    navigate('/add')
  }

  function loadSample(i) {
    setText(SAMPLE_RECEIPTS[i])
    setParsed(null)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Zap size={20} className="text-teal-400" />
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Smart Add</h1>
        </div>
        <p className="text-sm text-slate-500">Paste a receipt or billing email to auto-detect subscription details</p>
      </div>

      {/* Info Banner */}
      <div className="card border-blue-500/30 bg-blue-500/5 p-4 flex gap-3">
        <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300">
          <strong>Full email scanning coming soon</strong> — for now, paste your receipt emails here and we'll try to auto-detect the details.
        </div>
      </div>

      {/* Sample buttons */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Try a sample receipt:</p>
        <div className="flex gap-2 flex-wrap">
          {['Netflix receipt', 'Spotify receipt', 'Adobe receipt'].map((label, i) => (
            <button
              key={i}
              onClick={() => loadSample(i)}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Text Area */}
      <div>
        <label className="label">Paste your receipt or billing email text</label>
        <div className="relative">
          <textarea
            className="input min-h-[180px] resize-none font-mono text-sm"
            placeholder={`Paste text like:

"Thank you for your Netflix subscription!
Amount: $15.49
Next billing date: May 12, 2024
Visa ending 4242"`}
            value={text}
            onChange={e => { setText(e.target.value); setParsed(null) }}
          />
          {text && (
            <button
              onClick={() => { setText(''); setParsed(null) }}
              className="absolute top-2 right-2 btn-icon text-xs"
              title="Clear"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <button
        onClick={handleParse}
        disabled={!text.trim() || parsing}
        className={`btn-primary w-full justify-center ${!text.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {parsing ? (
          <><RefreshCw size={16} className="animate-spin" /> Parsing...</>
        ) : (
          <><Zap size={16} /> Parse Receipt</>
        )}
      </button>

      {/* Parsed Result */}
      {parsed && (
        <div className="card p-5 space-y-4 animate-slide-up">
          <h2 className="font-semibold text-slate-200">Detected Information</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Name', key: 'name', placeholder: 'Not detected' },
              { label: 'Amount', key: 'amount', prefix: '$', placeholder: 'Not detected' },
              { label: 'Billing Cycle', key: 'billingCycle', placeholder: 'Monthly' },
              { label: 'Category', key: 'category', placeholder: 'Other' },
              { label: 'Next Billing Date', key: 'nextBillingDate', placeholder: 'Not detected' },
            ].map(({ label, key, prefix, placeholder }) => (
              <div key={key} className={key === 'name' ? 'col-span-2' : ''}>
                <div className="text-xs text-slate-500 mb-1">{label}</div>
                <div className={`text-sm font-medium ${parsed[key] ? 'text-slate-100' : 'text-slate-600'}`}>
                  {parsed[key] ? `${prefix || ''}${parsed[key]}` : placeholder}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(parsed).length === 0 ? (
            <div className="text-sm text-amber-400 p-3 bg-amber-500/10 rounded-lg">
              Couldn't detect much from this text. You can still use the form and fill in details manually.
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              ✅ Detected {Object.keys(parsed).length} field{Object.keys(parsed).length !== 1 ? 's' : ''}.
              You can edit any details in the form.
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleUseData}
              className="btn-primary flex-1 justify-center"
            >
              Use This Data <ArrowRight size={15} />
            </button>
            <button
              onClick={() => navigate('/add')}
              className="btn-secondary"
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">💡 Tips for better parsing</h3>
        <ul className="space-y-1.5 text-xs text-slate-500 list-disc list-inside">
          <li>Copy the full text from your receipt email</li>
          <li>Include the amount, billing date, and service name</li>
          <li>Works best with standard billing confirmation emails</li>
          <li>You can always edit any auto-filled fields in the form</li>
        </ul>
      </div>
    </div>
  )
}
  