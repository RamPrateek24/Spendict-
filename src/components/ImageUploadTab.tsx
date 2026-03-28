import React, { useRef, useState } from 'react'
import type { ParsedExpense } from '../types'
import Tesseract from 'tesseract.js'
import { saveExpense } from "../../lib/expenses"
import { predictCategory } from "../utils/predictCategory"

export default function ImageUploadTab(): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState(0)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ParsedExpense | null>(null)
  const [confirmingSave, setConfirmingSave] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [saveError, setSaveError] = useState('')

  const processFile = (f: File) => {
  setFile(f)
  setResult(null)
  setProgress(0)
}


  const simulateOCR = async () => {
  if (!file || scanning) return

  setScanning(true)
  setResult(null)
  setProgress(0)

  try {
    const { data } = await Tesseract.recognize(
      file,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.floor(m.progress * 100))
          }
        },
      }
    )

    const text = data.text
    console.log("OCR TEXT:\n", text)

    // Normalize common OCR mistakes
    let cleanedText = text
      .replace(/Re/g, 'Rp')
      .replace(/Rs/g, 'Rp')
      .replace(/O/g, '0')

    // Extract lines
    const lines = cleanedText.split('\n').map(l => l.trim()).filter(Boolean)

    let amount = ''

    // 🔥 First priority: look for "Total" line
    for (let line of lines) {
      if (/total/i.test(line)) {
        const match = line.match(/\d+\.\d+/g)
        if (match) {
          amount = match[0]
          break
        }
      }
    }

    // 🔥 Fallback: check Subtotal
    if (!amount) {
      for (let line of lines) {
        if (/subtotal/i.test(line)) {
          const match = line.match(/\d+\.\d+/g)
          if (match) {
            amount = match[0]
            break
          }
        }
      }
    }

    // Final formatting
    amount = amount ? `₹ ${amount}` : '₹ 0.00'

    // ✅ Better Date Extraction - support multiple formats with better fallbacks
    let dateMatch: string | null = null
    
    const datePatterns = [
      // Format: 17 Feb 2024, 17-Feb-2024, 17/Feb/2024, 17 Feb 24
      /\d{1,2}\s*[-\/]?\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*[-\/]?\s*\d{2,4}/i,
      // Format: 17/02/2024, 17-02-2024, 17.02.2024
      /\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4}/,
      // Format: 2024-02-17, 2024/02/17
      /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/,
      // Format: 02 17 2024, 02 17 24 (with spaces)
      /\d{1,2}\s+\d{1,2}\s+\d{2,4}/,
      // Format: 17th Feb 2024, 17 February 2024
      /\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{2,4}/i,
      // Format: Today, Tomorrow, Yesterday or Month Year (Mar 2024, February 2024)
      /(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i,
    ]
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern)
      if (match) {
        dateMatch = match[0].trim()
        break
      }
    }

    // If no date found, try extracting just the year and month
    if (!dateMatch) {
      const yearMatch = text.match(/\d{4}/)
      if (yearMatch) {
        const year = yearMatch[0]
        const monthMatch = text.match(/(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i)
        if (monthMatch) {
          dateMatch = `${monthMatch[0]} ${year}`
        }
      }
    }

    const cleanedForML = lines.slice(0,5).join(" ")
    const mlCategory = await predictCategory(cleanedForML)

    // ✅ Better Merchant Extraction
    // Usually the merchant name is in the first few lines and is capitalized
    let merchant = "Unknown Merchant"
    
    // First, try to find merchant in first 5 lines (where shop name usually is)
    const topLines = lines.slice(0, 5)
    
    for (let line of topLines) {
      // Skip lines that are clearly not merchant names
      if (
        line.length > 2 && 
        line.length < 50 &&  // Merchant names are usually not too long
        !/^(invoice|bill|receipt|bill no|date|time|thank|www|http|gst|cin|fssai|phone|rupee|total|subtotal|qty|price|amount|tax|discount|payment|card|cash|upi|method|mode|id|ref|item|description|gs?t|vat|bill\s*to|sold\s*by|address|tel|email)[\s:]/i.test(line) &&
        !/^\d+[\s.\/]/.test(line) &&  // Skip lines that start with numbers (usually prices/qty)
        !/^[₹\$]/.test(line)  // Skip lines starting with currency
      ) {
        // Found a good candidate
        merchant = line.trim()
        break
      }
    }

    // If still not found, try searching for common merchant keywords
    if (merchant === "Unknown Merchant") {
      const merchantLine = lines.find(line =>
        /shop|store|restaurant|cafe|mart|super|hotel|market|retail|pharmacy|petrol|fuel|gas|dairy|bakery|pizza|burger|food|kitchen|cloud|flipkart|amazon|snapdeal|paytm|mall|outlet/i.test(line)
      )
      if (merchantLine) {
        merchant = merchantLine.trim()
      }
    }

    // If still not found, take first non-numeric line from top 3 lines
    if (merchant === "Unknown Merchant") {
      for (let line of topLines.slice(0, 3)) {
        if (line.length > 2 && !/^\d+[\s.]/.test(line) && !/^[₹\$]/.test(line)) {
          merchant = line.trim()
          break
        }
      }
    }

    const parsed: ParsedExpense = {
      merchant: merchant,
      date: dateMatch || 'Unknown Date',
      amount: amount,
      category: mlCategory,
      tax: '',
    }

    setResult(parsed)

    // Show review screen instead of auto-saving
    setConfirmingSave(true)
    setSaveStatus('idle')
    setSaveError('')
  } catch (err) {
    console.error(err)
  } finally {
    setScanning(false)
  }
}

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFile(null); setResult(null); setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  const confirmSave = async () => {
    if (!result) return
    try {
      setSaveStatus('saving')
      await saveExpense({
        merchant: result.merchant,
        amount: Number(result.amount.replace(/[^\d.]/g, "")),
        category: result.category,
        date: new Date(),
        month: new Date().toISOString().slice(0, 7),
      })
      setSaveStatus('success')
      setTimeout(() => {
        setConfirmingSave(false)
        setFile(null)
        setResult(null)
        setSaveStatus('idle')
      }, 1500)
    } catch (err) {
      setSaveStatus('error')
      setSaveError((err as any).message)
      console.error('[ImageUploadTab] Save error:', err)
    }
  }

  const cancelSave = () => {
    setConfirmingSave(false)
    setSaveStatus('idle')
    setSaveError('')
    setFile(null)
    setResult(null)
    setProgress(0)
  }

  const RESULT_ROWS = file && result
    ? [
        { key: 'Merchant', val: result.merchant, cls: '' },
        { key: 'Date',     val: result.date,     cls: '' },
        { key: 'Amount',   val: result.amount,   cls: 'amount' },
        { key: 'Category', val: result.category, cls: 'cat' },
        ...(result.tax ? [{ key: 'Tax', val: result.tax, cls: '' }] : []),
      ]
    : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input ref={inputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }} />

      {/* Drop Zone */}
      <div
        className={`upload-zone${dragOver ? ' drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f) }}
      >
        {!file ? (
          <>
            <div className="upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} width={64} height={64}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="upload-label">Drop your bill or receipt here</p>
            <p className="upload-hint">or click to browse from your device</p>
            <div className="upload-formats">
              {['JPG', 'PNG', 'HEIC', 'PDF', 'WEBP'].map(f => <span key={f} className="format-tag">{f}</span>)}
            </div>
          </>
        ) : (
          <div className="upload-preview visible" onClick={e => e.stopPropagation()}>
            <div className="preview-icon">📄</div>
            <div className="preview-info">
              <div className="preview-name">{file.name}</div>
              <div className="preview-size">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            <button className="preview-remove" onClick={removeFile}>✕</button>
          </div>
        )}
      </div>

      {/* OCR Progress */}
      {scanning && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--neon-cyan)' }}>
          <span>OCR scanning</span>
          <div style={{ flex: 1, height: 2, background: 'rgba(0,245,255,0.08)', borderRadius: 1, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-green))', transition: 'width 0.18s ease' }} />
          </div>
          <span>{progress}%</span>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="result-preview visible">
          <div className="result-header">Extracted Data</div>
          {RESULT_ROWS.map(({ key, val, cls }) => (
            <div className="result-row" key={key}>
              <span className="result-key">{key}</span>
              <span className={`result-val${cls ? ` ${cls}` : ''}`}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Review Screen - Save/Cancel Buttons */}
      {confirmingSave && result && (
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.8rem' }}>
          <button
            onClick={confirmSave}
            disabled={saveStatus === 'saving'}
            style={{
              flex: 1,
              padding: '0.7rem 1rem',
              background: 'linear-gradient(135deg, #00f5ff, #00d4ff)',
              color: '#000',
              border: 'none',
              borderRadius: '0.4rem',
              fontWeight: 600,
              cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
              opacity: saveStatus === 'saving' ? 0.7 : 1,
              transition: 'all 0.2s',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
            }}
          >
            {saveStatus === 'saving' ? '💾 Saving...' : '✅ Save to Database'}
          </button>
          <button
            onClick={cancelSave}
            disabled={saveStatus === 'saving'}
            style={{
              flex: 1,
              padding: '0.7rem 1rem',
              background: 'transparent',
              color: '#ff3b30',
              border: '2px solid #ff3b30',
              borderRadius: '0.4rem',
              fontWeight: 600,
              cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
              opacity: saveStatus === 'saving' ? 0.7 : 1,
              transition: 'all 0.2s',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
            }}
          >
            ❌ Cancel
          </button>
        </div>
      )}

      {/* Save Status Messages */}
      {saveStatus === 'success' && (
        <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(0, 245, 95, 0.1)', border: '1px solid rgba(0, 245, 95, 0.3)', borderRadius: '0.4rem', color: '#00f55f', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', textAlign: 'center' }}>
          ✅ Expense saved successfully!
        </div>
      )}
      {saveStatus === 'error' && (
        <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.3)', borderRadius: '0.4rem', color: '#ff3b30', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', textAlign: 'center' }}>
          ❌ Error: {saveError || 'Failed to save'}
        </div>
      )}

      <button className="btn-primary" onClick={simulateOCR} disabled={scanning} style={{ width: '100%', opacity: scanning ? 0.7 : 1 }}>
        ⚡ {scanning ? 'Scanning…' : 'Scan & Extract with OCR'}
      </button>
    </div>
  )
}
