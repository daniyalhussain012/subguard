import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { format, addDays } from 'date-fns'
import {
  Mail, Upload, Zap, ArrowRight, X, RotateCcw, Clock,
  CheckCircle, Info, Camera, ExternalLink, AlertCircle, RefreshCw,
  Plus, Trash2,
} from 'lucide-react'
import { useApp } from '../App'
import { CATEGORIES, getMonthlyAmount, formatCurrency } from '../utils/storage'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Scanner endpoints are per-user — every call carries the app JWT
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('subguard_token') || ''}` })

const KNOWN_SERVICES = [
  'Netflix', 'Spotify', 'Hulu', 'Disney+', 'HBO Max', 'Peacock', 'Paramount+', 'ESPN+',
  'YouTube Premium', 'Amazon Prime', 'Apple TV+', 'Apple Music', 'Apple One', 'Tidal',
  'Adobe Creative Cloud', 'Adobe', 'Microsoft 365', 'Office 365', 'Microsoft',
  'ChatGPT Plus', 'ChatGPT', 'OpenAI', 'Midjourney', 'Canva', 'Figma',
  'Dropbox', 'iCloud', 'iCloud+', 'Google One', 'OneDrive',
  'Grammarly', 'Notion', 'Slack', 'Zoom', 'LinkedIn Premium', 'LinkedIn',
  'Xbox Game Pass', 'PlayStation Plus', 'Nintendo Switch Online',
  'Peloton', 'Planet Fitness', 'ClassPass', 'MyFitnessPal',
  'HelloFresh', 'Blue Apron', 'DoorDash', 'Instacart',
  'New York Times', 'Washington Post', 'Wall Street Journal', 'Audible',
  'Kindle Unlimited', 'Patreon', 'NordVPN', 'ExpressVPN',
]

function smartParse(text) {
  const result = {}
  const t = text
  const amtPatterns = [
    /(?:charged?|billed?|payment of|amount[:\s]+|total[:\s]+|price[:\s]+|cost[:\s]+)\$?\s*(\d+(?:[.,]\d{1,2})?)/i,
    /\$\s*(\d+(?:[.,]\d{1,2})?)(?:\s*(?:USD|per month|\/mo|\/month|monthly))?/i,
    /(\d+(?:[.,]\d{2}))\s*(?:USD|dollars?)/i,
  ]
  for (const pat of amtPatterns) {
    const m = t.match(pat)
    if (m) {
      const val = parseFloat(m[1].replace(',', '.'))
      if (val > 0 && val < 10000) { result.amount = val.toFixed(2); break }
    }
  }
  const datePatterns = [
    /(?:renew(?:s|al|ed)?|next charge|next billing|billed on|expires?|due|valid until|until)\s+(?:on\s+)?([A-Z][a-z]+ \d{1,2},?\s*\d{4})/i,
    /(?:renew(?:s|al)?|next|billing|charge|expires?)\s+(?:on\s+)?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /([A-Z][a-z]+ \d{1,2},?\s*\d{4})/,
    /(\d{4}-\d{2}-\d{2})/,
  ]
  for (const pat of datePatterns) {
    const m = t.match(pat)
    if (m) {
      try {
        const d = new Date(m[1])
        if (!isNaN(d.getTime()) && d > new Date()) { result.nextBillingDate = format(d, 'yyyy-MM-dd'); break }
      } catch {}
    }
  }
  if (/\b(annual|yearly|per year|\/year|year(?:ly)?)\b/i.test(t)) result.billingCycle = 'Yearly'
  else if (/\b(quarter|3[\s-]?month|every 3 month)\b/i.test(t)) result.billingCycle = 'Quarterly'
  else if (/\b(week(?:ly)?|7[\s-]?day)\b/i.test(t)) result.billingCycle = 'Weekly'
  else result.billingCycle = 'Monthly'
  for (const svc of KNOWN_SERVICES) {
    if (new RegExp(`\\b${svc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(t)) { result.name = svc; break }
  }
  if (!result.name) {
    const namePatterns = [
      /(?:thank you for (?:your )?|your |payment (?:to|for) |receipt from |subscription (?:to|with) |from\s+)([A-Z][A-Za-z0-9+\s]{1,30}?)(?:\s+(?:subscription|membership|plan|account|invoice|receipt|\.))/i,
      /^([A-Z][A-Za-z0-9+ ]{1,25})(?:\s+Invoice|\s+Receipt|\s+Billing)/m,
    ]
    for (const pat of namePatterns) {
      const m = t.match(pat)
      if (m && m[1].trim().length > 1) { result.name = m[1].trim(); break }
    }
  }
  const pmMatch = t.match(/(?:card|visa|mastercard|amex|credit card)\s+(?:ending|#|no\.?)?\s*(?:in\s+)?(\d{4})/i)
  if (pmMatch) result.paymentMethod = `Card ending ${pmMatch[1]}`
  if (/\b(free trial|trial end|trial expires?|trial period)\b/i.test(t)) result.isTrial = true
  if (/\b(price (?:increase|change)|new (?:rate|price)|updated? (?:price|rate))\b/i.test(t)) result.isPriceIncrease = true
  const lower = t.toLowerCase()
  if (/netflix|hulu|disney|hbo|peacock|paramount|espn|streaming|apple tv/i.test(lower)) result.category = 'Streaming'
  else if (/spotify|apple music|tidal|pandora|music|deezer/i.test(lower)) result.category = 'Music'
  else if (/adobe|microsoft|office|slack|notion|zoom|github|figma|grammarly|canva|chatgpt|openai/i.test(lower)) result.category = 'Software'
  else if (/playstation|xbox|steam|nintendo|gaming|game pass/i.test(lower)) result.category = 'Gaming'
  else if (/icloud|dropbox|google one|onedrive|cloud storage/i.test(lower)) result.category = 'Cloud Storage'
  else if (/gym|fitness|peloton|planet fitness|classpass|workout/i.test(lower)) result.category = 'Fitness'
  else if (/new york times|washington post|wsj|news|magazine|nyt|audible|kindle/i.test(lower)) result.category = 'News/Magazine'
  else if (/amazon prime|instacart|doordash|ubereats|grubhub|hellofresh|blue apron/i.test(lower)) result.category = 'Food Delivery'
  else if (/amazon|shopping|prime(?! video)/i.test(lower)) result.category = 'Shopping'
  return result
}

const SAMPLE_EMAILS = [
  { label: 'Netflix renewal', text: `Your Netflix subscription will renew on May 15, 2026 for $15.49. Your credit card ending in 4242 will be charged. Standard plan. Manage at netflix.com/account.` },
  { label: 'Adobe price increase', text: `Starting June 1, 2026, your Adobe Creative Cloud All Apps subscription price will change to $59.99/month (previously $54.99/month). Annual subscription renews June 15, 2026.` },
  { label: 'Trial ending', text: `Your free trial of Grammarly Premium ends on April 28, 2026. After your trial, you'll be charged $12.00/month. Your Visa ending in 5678 will be billed.` },
]

// ── Email Connect Card ────────────────────────────────────────────────────────

function EmailConnectCard({ provider, status, onConnect, onDisconnect, onScan, scanning }) {
  const isGmail = provider === 'gmail'
  const label = isGmail ? 'Gmail' : 'Outlook / Hotmail'
  const icon = isGmail ? '📧' : '📨'
  // Browser navigation can't send an Authorization header, so the JWT rides
  // along as a query param; the server swaps it for a short-lived OAuth state
  const connectUrl = `${API}/auth/${isGmail ? 'google' : 'microsoft'}?token=${encodeURIComponent(localStorage.getItem('subguard_token') || '')}`
  const [showSetup, setShowSetup] = useState(false)

  if (!status.configured) {
    return (
      <div className="card border-slate-700/40 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="font-semibold text-slate-300">{label}</h3>
        </div>
        <div className="card bg-amber-500/10 border-amber-500/25 p-3 space-y-2">
          <p className="text-xs text-amber-300 font-semibold">Setup Required</p>
          <p className="text-xs text-amber-400/80">
            {label} scanning requires adding API credentials to the server (one-time, free).
          </p>
          <button
            onClick={() => setShowSetup(v => !v)}
            className="flex items-center gap-1 text-xs text-amber-300 underline"
          >
            <Info size={11} /> {showSetup ? 'Hide' : 'Show'} setup instructions
          </button>
          {showSetup && (
            <div className="text-xs text-slate-400 space-y-2 pt-1 border-t border-amber-500/20">
              {isGmail ? (
                <>
                  <p className="font-semibold text-slate-300">Gmail Setup (~10 min)</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Go to <span className="text-cyan-400">console.cloud.google.com</span></li>
                    <li>Create a project → Enable <strong>Gmail API</strong></li>
                    <li>OAuth consent screen → add your Google account as a test user</li>
                    <li>Create OAuth 2.0 credentials (Web application)</li>
                    <li>Add redirect URI: <code className="bg-slate-800 px-1 rounded">YOUR_SERVER_URL/auth/google/callback</code></li>
                    <li>Copy Client ID &amp; Secret → add to Render env vars:<br />
                      <code className="bg-slate-800 px-1 rounded block mt-1">GOOGLE_CLIENT_ID=...<br />GOOGLE_CLIENT_SECRET=...<br />GMAIL_REDIRECT_URI=YOUR_SERVER_URL/auth/google/callback</code>
                    </li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-300">Outlook Setup (~15 min)</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Go to <span className="text-cyan-400">portal.azure.com</span> → App registrations</li>
                    <li>New registration → Supported account types: <strong>Personal Microsoft accounts only</strong></li>
                    <li>Add redirect URI (Web): <code className="bg-slate-800 px-1 rounded">YOUR_SERVER_URL/auth/microsoft/callback</code></li>
                    <li>Certificates &amp; secrets → New client secret → copy the value</li>
                    <li>API permissions → Add: <strong>Mail.Read</strong> (delegated)</li>
                    <li>Add to Render env vars:<br />
                      <code className="bg-slate-800 px-1 rounded block mt-1">MICROSOFT_CLIENT_ID=...<br />MICROSOFT_CLIENT_SECRET=...<br />OUTLOOK_REDIRECT_URI=YOUR_SERVER_URL/auth/microsoft/callback</code>
                    </li>
                  </ol>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (status.connected) {
    return (
      <div className="card border-emerald-500/25 bg-emerald-500/5 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <div>
              <div className="font-semibold text-emerald-300 text-sm">Connected ✅</div>
              <div className="text-xs text-slate-500">{status.email}</div>
            </div>
          </div>
          <button onClick={onDisconnect} className="text-xs text-slate-600 hover:text-red-400 transition-colors">Disconnect</button>
        </div>
        <button
          onClick={onScan}
          disabled={scanning}
          className="btn-primary w-full justify-center"
        >
          {scanning ? <><RotateCcw size={14} className="animate-spin" /> Scanning inbox...</> : <><RefreshCw size={14} /> Scan {label}</>}
        </button>
        <p className="text-xs text-slate-600 text-center">Read-only · Only detected subscription details are stored, never your emails · Disconnect anytime</p>
      </div>
    )
  }

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <h3 className="font-semibold text-slate-300">{label}</h3>
      </div>
      <p className="text-sm text-slate-400">
        Automatically detect subscriptions from your {label} inbox. Read-only access — we save only the subscription details we detect (service, price, renewal date), never your emails.
      </p>
      <a href={connectUrl} className="btn-primary w-full justify-center">
        <ExternalLink size={14} /> Connect {label}
      </a>
      {isGmail && (
        <div className="card bg-slate-800/50 border-slate-700/40 p-3 text-xs text-slate-500 space-y-1">
          <p className="text-slate-400 font-semibold flex items-center gap-1"><Info size={11} /> "App not verified" warning?</p>
          <p>This is normal for apps pending Google review. Click <strong className="text-slate-300">Advanced</strong> → <strong className="text-slate-300">"Go to app (unsafe)"</strong> to continue. Your emails are never stored.</p>
        </div>
      )}
      <p className="text-xs text-slate-600 text-center">Read-only · Only detected subscription details are stored, never your emails · Disconnect anytime</p>
    </div>
  )
}

// ── Scan Result Card ──────────────────────────────────────────────────────────

function ScanResultCard({ result, existing, onAdd, onIgnore }) {
  const [editing, setEditing] = useState(false)
  const [edited, setEdited] = useState({ ...result })

  const isDuplicate = existing.some(s =>
    s.name?.toLowerCase() === result.name?.toLowerCase()
  )
  const priceChanged = existing.find(s =>
    s.name?.toLowerCase() === result.name?.toLowerCase() &&
    result.amount && Math.abs(getMonthlyAmount(s) - parseFloat(result.amount)) > 0.5
  )

  const confidenceColor = { High: 'text-emerald-400', Medium: 'text-amber-400', Low: 'text-orange-400' }

  if (isDuplicate && !priceChanged) {
    return (
      <div className="card p-3 flex items-center gap-3 opacity-60">
        <CheckCircle size={16} className="text-emerald-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-300 truncate">{result.name || 'Unknown'}</div>
          <div className="text-xs text-slate-500">Already tracked ✓</div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-100">{result.name || 'Unknown service'}</span>
            {result.confidence && (
              <span className={`text-xs font-semibold ${confidenceColor[result.confidence]}`}>
                {result.confidence} confidence
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {result.amount ? `$${result.amount}/` : ''}{result.billingCycle?.toLowerCase() || 'monthly'}
            {result.emailDate ? ` · Email: ${new Date(result.emailDate).toLocaleDateString()}` : ''}
          </div>
          {result.from && <div className="text-xs text-slate-700 truncate">From: {result.from}</div>}
        </div>
        <button onClick={onIgnore} className="btn-icon p-1"><X size={14} /></button>
      </div>

      {priceChanged && (
        <div className="text-xs text-amber-400 p-2 bg-amber-500/10 border border-amber-500/25 rounded-lg">
          ⚠️ Currently tracking at {formatCurrency(getMonthlyAmount(priceChanged))}/mo but email shows ${result.amount} — Update?
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => onAdd(result)} className="btn-primary text-xs py-1.5 flex-1 justify-center">
          <Plus size={12} /> Add
        </button>
        <button onClick={() => navigate('/add')} className="btn-secondary text-xs py-1.5">
          ✏️ Edit & Add
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SmartScanner() {
  const { darkMode, addScanHistory, scanHistory, subscriptions, addSubscription } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [tab, setTab] = useState('paste')
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileRef = useRef(null)

  // Email state
  const [backendAvailable, setBackendAvailable] = useState(false)
  const [gmailStatus, setGmailStatus] = useState({ configured: false, connected: false })
  const [outlookStatus, setOutlookStatus] = useState({ configured: false, connected: false })
  const [scanning, setScanning] = useState(null)
  // Scan results survive navigating away to add/edit a subscription — losing
  // the whole list after adding one item forced users to re-scan every time
  const scanCache = (() => { try { return JSON.parse(sessionStorage.getItem('subguard_scan_cache') || '{}') } catch { return {} } })()
  const [scanResults, setScanResults] = useState(scanCache.results || [])
  const [ignoredIds, setIgnoredIds] = useState(scanCache.ignored || [])
  const [scanSince, setScanSince] = useState(scanCache.since || null)

  useEffect(() => {
    sessionStorage.setItem('subguard_scan_cache', JSON.stringify({ results: scanResults, ignored: ignoredIds, since: scanSince }))
  }, [scanResults, ignoredIds, scanSince])

  useEffect(() => {
    checkBackend()
    const connected = searchParams.get('connected')
    if (connected === 'gmail') { setTab('gmail'); checkBackend() }
    if (connected === 'outlook') { setTab('outlook'); checkBackend() }
  }, [])

  async function checkBackend() {
    try {
      const res = await fetch(`${API}/api/status`, { headers: authHeaders(), signal: AbortSignal.timeout(2000) })
      if (res.ok) {
        const data = await res.json()
        setBackendAvailable(true)
        setGmailStatus(data.gmail || { configured: false, connected: false })
        setOutlookStatus(data.outlook || { configured: false, connected: false })
      }
    } catch {
      setBackendAvailable(false)
    }
  }

  async function handleScan(provider) {
    setScanning(provider)
    setScanResults([])
    try {
      const endpoint = provider === 'gmail' ? '/api/scan-gmail' : '/api/scan-outlook'
      const res = await fetch(`${API}${endpoint}`, { method: 'POST', headers: authHeaders() })
      const data = await res.json()
      if (data.ok) {
        setScanResults(data.results || [])
        setScanSince(data.since || null)
        setIgnoredIds([])
      }
    } catch (err) {
      console.error('Scan error:', err)
    }
    setScanning(null)
  }

  async function handleDisconnect(provider) {
    try {
      await fetch(`${API}/api/disconnect-${provider}`, { method: 'POST', headers: authHeaders() })
      checkBackend()
      setScanResults([])
    } catch {}
  }

  function handleAddResult(result) {
    const prefill = {
      ...result,
      amount: result.amount ? parseFloat(result.amount) : '',
      nextBillingDate: result.nextBillingDate || format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    }
    sessionStorage.setItem('subguard_prefill', JSON.stringify(prefill))
    navigate('/add')
  }

  const handleParse = useCallback(() => {
    if (!text.trim()) return
    setParsing(true)
    setParsed(null)
    setTimeout(() => {
      const result = smartParse(text)
      setParsed(result)
      setParsing(false)
    }, 600)
  }, [text])

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setText('')
    setParsed(null)

    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

    if (isPDF) {
      setImagePreview(null)
      setOcrProgress('Reading PDF...')
      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdfjsLib = await import('pdfjs-dist')
        // Serve the worker from our own origin (Vite bundles it) — no
        // third-party CDN dependency at runtime
        const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
        pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ''
        for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          fullText += content.items.map(item => item.str).join(' ') + '\n'
        }
        setText(fullText)
        setOcrProgress(null)
        setParsed(smartParse(fullText))
      } catch {
        setOcrProgress('Could not read PDF. Try a different file or paste the text instead.')
      }
      return
    }

    setImagePreview(URL.createObjectURL(file))
    setOcrProgress('Loading OCR engine...')
    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') setOcrProgress(`Scanning... ${Math.round(m.progress * 100)}%`)
        }
      })
      const { data: { text: extracted } } = await worker.recognize(file)
      await worker.terminate()
      setText(extracted)
      setOcrProgress(null)
      setParsed(smartParse(extracted))
    } catch {
      setOcrProgress('Couldn\'t read image. Try a clearer photo or paste text instead.')
    }
  }

  function handleUseData() {
    const prefill = { ...parsed, nextBillingDate: parsed.nextBillingDate || format(addDays(new Date(), 30), 'yyyy-MM-dd') }
    addScanHistory({ id: uuidv4(), scannedAt: format(new Date(), 'MMM d, yyyy'), parsed: prefill, added: true, rawText: text.slice(0, 200) })
    sessionStorage.setItem('subguard_prefill', JSON.stringify(prefill))
    navigate('/add')
  }

  const TABS = [
    { id: 'gmail', label: '📧 Gmail' },
    { id: 'outlook', label: '📨 Outlook' },
    { id: 'paste', label: '📋 Paste Text' },
    { id: 'image', label: '📷 Upload' },
  ]

  const visibleResults = scanResults.filter((_, i) => !ignoredIds.includes(i))

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Mail size={19} className="text-purple-400" />
          <h1 className="page-header mb-0">Smart Scanner</h1>
        </div>
        <p className="page-sub mb-0">Auto-detect subscriptions from receipts, emails, and screenshots</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-slate-700/50 overflow-hidden">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); if (t.id === 'gmail' || t.id === 'outlook') checkBackend() }}
            className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
              tab === t.id
                ? 'bg-purple-500/20 text-purple-300 border-b-2 border-purple-400'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/30'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Gmail Tab */}
      {tab === 'gmail' && (
        <div className="space-y-4">
          {!backendAvailable ? (
            <div className="card border-slate-700/40 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-400" />
                <span className="font-semibold text-slate-300 text-sm">Email server not running</span>
              </div>
              <p className="text-xs text-slate-500">
                Run <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400">npm run dev:all</code> to start both the app and email backend, then refresh.
              </p>
              <p className="text-xs text-slate-600">Expand the Setup Required section on each provider card for step-by-step instructions.</p>
            </div>
          ) : (
            <EmailConnectCard
              provider="gmail"
              status={gmailStatus}
              onScan={() => handleScan('gmail')}
              onDisconnect={() => handleDisconnect('gmail')}
              scanning={scanning === 'gmail'}
            />
          )}
          {visibleResults.length > 0 && tab === 'gmail' && (
            <ScanResultList results={visibleResults} subscriptions={subscriptions} since={scanSince} onIgnore={i => setIgnoredIds(ids => [...ids, i])} onAdd={handleAddResult} />
          )}
        </div>
      )}

      {/* Outlook Tab */}
      {tab === 'outlook' && (
        <div className="space-y-4">
          {!backendAvailable ? (
            <div className="card border-slate-700/40 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-400" />
                <span className="font-semibold text-slate-300 text-sm">Email server not running</span>
              </div>
              <p className="text-xs text-slate-500">
                Run <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400">npm run dev:all</code> to start both the app and email backend, then refresh.
              </p>
            </div>
          ) : (
            <EmailConnectCard
              provider="outlook"
              status={outlookStatus}
              onScan={() => handleScan('outlook')}
              onDisconnect={() => handleDisconnect('outlook')}
              scanning={scanning === 'outlook'}
            />
          )}
          {visibleResults.length > 0 && tab === 'outlook' && (
            <ScanResultList results={visibleResults} subscriptions={subscriptions} since={scanSince} onIgnore={i => setIgnoredIds(ids => [...ids, i])} onAdd={handleAddResult} />
          )}
        </div>
      )}

      {/* Paste Tab */}
      {tab === 'paste' && (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-500 mb-2">Try a sample:</p>
            <div className="flex gap-2 flex-wrap">
              {SAMPLE_EMAILS.map((s, i) => (
                <button key={i} onClick={() => { setText(s.text); setParsed(null) }} className="btn-secondary text-xs py-1.5 px-3">{s.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Paste receipt or billing email text</label>
            <div className="relative">
              <textarea
                className="input min-h-[160px] resize-none font-mono text-xs leading-relaxed"
                placeholder="Paste the full text of a billing email, renewal notice, or receipt..."
                value={text}
                onChange={e => { setText(e.target.value); setParsed(null) }}
              />
              {text && <button onClick={() => { setText(''); setParsed(null) }} className="absolute top-2 right-2 btn-icon p-1"><X size={13} /></button>}
            </div>
          </div>
          <button onClick={handleParse} disabled={!text.trim() || parsing} className={`btn-primary w-full justify-center ${!text.trim() ? 'opacity-40 cursor-not-allowed' : ''}`}>
            {parsing ? <><RotateCcw size={15} className="animate-spin" /> Scanning...</> : <><Zap size={15} /> Scan Receipt</>}
          </button>
        </div>
      )}

      {/* Image Tab */}
      {tab === 'image' && (
        <div className="space-y-4">
          <div onClick={() => fileRef.current?.click()} className="card border-dashed border-2 border-slate-600 hover:border-cyan-500/50 p-10 text-center cursor-pointer transition-colors">
            <Upload size={32} className="mx-auto mb-3 text-slate-500" />
            <div className="font-semibold text-slate-300 mb-1">Upload Receipt or Invoice</div>
            <div className="text-xs text-slate-500">JPG, PNG, WebP, PDF — processed entirely in your browser</div>
            <input ref={fileRef} type="file" accept="image/*,.pdf,application/pdf" className="hidden" onChange={handleImageUpload} />
          </div>
          {imagePreview && <div className="card p-3"><img src={imagePreview} alt="Receipt" className="max-h-48 object-contain mx-auto rounded-lg" /></div>}
          {ocrProgress && (
            <div className="card p-4 flex items-center gap-3">
              <RotateCcw size={16} className="text-cyan-400 animate-spin" />
              <span className="text-sm text-slate-300">{ocrProgress}</span>
            </div>
          )}
        </div>
      )}

      {/* Parsed Result */}
      <AnimatePresence>
        {parsed && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card p-5 space-y-4 border-emerald-500/25">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100">Detected Information</h3>
              <span className="badge badge-active">{Object.keys(parsed).filter(k => parsed[k]).length} fields found</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Service Name', key: 'name' },
                { label: 'Amount', key: 'amount', format: v => `$${v}` },
                { label: 'Billing Cycle', key: 'billingCycle' },
                { label: 'Category', key: 'category' },
                { label: 'Next Billing Date', key: 'nextBillingDate' },
                { label: 'Payment Method', key: 'paymentMethod' },
              ].map(({ label, key, format: fmt }) => (
                <div key={key} className={key === 'name' ? 'col-span-2' : ''}>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">{label}</div>
                  <div className={`text-sm font-semibold ${parsed[key] ? 'text-slate-100' : 'text-slate-700 italic'}`}>
                    {parsed[key] ? (fmt ? fmt(parsed[key]) : parsed[key]) : 'Not detected'}
                  </div>
                </div>
              ))}
            </div>
            {parsed.isTrial && <div className="text-xs font-semibold text-pink-400 p-2 bg-pink-500/10 border border-pink-500/25 rounded-lg">⏰ Trial detected — you'll be charged after trial ends</div>}
            {parsed.isPriceIncrease && <div className="text-xs font-semibold text-orange-400 p-2 bg-orange-500/10 border border-orange-500/25 rounded-lg">📈 Price increase detected — check the new amount carefully</div>}
            <div className="flex gap-3">
              <button onClick={handleUseData} className="btn-primary flex-1 justify-center">Add to RenewBell <ArrowRight size={14} /></button>
              <button onClick={() => navigate('/add')} className="btn-ghost text-xs">Manual</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-slate-500" />
            <span className="section-title mb-0">Scan History</span>
          </div>
          <div className="space-y-2">
            {scanHistory.slice(0, 5).map(entry => (
              <div key={entry.id} className="card p-3 flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${entry.added ? 'bg-emerald-500/15' : 'bg-slate-700/40'}`}>
                  {entry.added ? <CheckCircle size={15} className="text-emerald-400" /> : <Mail size={15} className="text-slate-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-200 truncate">{entry.parsed?.name || 'Unknown service'}</div>
                  <div className="text-xs text-slate-500">{entry.scannedAt} · {entry.added ? 'Added to RenewBell' : 'Scanned only'}</div>
                  {entry.parsed?.amount && <div className="text-xs text-slate-400">${entry.parsed.amount} · {entry.parsed.billingCycle || 'Monthly'}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ScanResultList({ results, subscriptions, onIgnore, onAdd, since }) {
  const navigate = useNavigate()
  const sinceLabel = since ? new Date(since).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : null
  if (results.length === 0) return (
    <div className="card p-8 text-center">
      <div className="text-4xl mb-2">📭</div>
      <p className="text-slate-400 text-sm">
        {sinceLabel
          ? `No new invoice-like emails since your last scan (${sinceLabel}).`
          : 'No invoice-like emails found in the last 6 months.'}
      </p>
    </div>
  )
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-slate-300">
        Found {results.length} invoice-like email{results.length !== 1 ? 's' : ''}
        {sinceLabel && <span className="text-slate-500 font-normal"> · new since {sinceLabel}</span>}
      </div>
      {results.map((r, i) => {
        const isDuplicate = subscriptions.some(s => s.name?.toLowerCase() === r.name?.toLowerCase())
        const confidenceColor = { High: 'text-emerald-400', Medium: 'text-amber-400', Low: 'text-orange-400' }
        return (
          <div key={i} className="card p-4 space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-100">{r.name || 'Unknown'}</span>
                  {r.confidence && <span className={`text-xs font-semibold ${confidenceColor[r.confidence] || 'text-slate-500'}`}>{r.confidence}</span>}
                  {isDuplicate && <span className="text-xs text-emerald-400">Already tracked ✓</span>}
                </div>
                <div className="text-xs text-slate-500">
                  {r.amount ? `$${r.amount}` : ''}
                  {r.billingCycle ? `/${r.billingCycle.toLowerCase()}` : ''}
                  {r.emailDate ? ` · ${new Date(r.emailDate).toLocaleDateString()}` : ''}
                </div>
              </div>
              <button onClick={() => onIgnore(i)} className="btn-icon p-1"><X size={13} /></button>
            </div>
            {!isDuplicate && (
              <div className="flex gap-2">
                <button onClick={() => onAdd(r)} className="btn-primary text-xs py-1.5 flex-1 justify-center"><Plus size={12} /> Add</button>
                <button onClick={() => { sessionStorage.setItem('subguard_prefill', JSON.stringify(r)); navigate('/add') }} className="btn-secondary text-xs py-1.5">✏️ Edit & Add</button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
