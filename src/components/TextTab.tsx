import React, { useState } from 'react'
import type { ParsedExpense } from '../types'
import { saveExpense } from "../../lib/expenses"
import { predictCategory } from "../utils/predictCategory"

const QUICK_TAGS = ['🛒 Groceries', '🍕 Food', '🚕 Transport', '💊 Health', '🎬 Entertainment']

const extractAmount = (text: string) => {
  const m = text.match(/[₹$]?\s?(\d[\d,.]+)/)
  return m ? `₹ ${parseFloat(m[1].replace(/,/g, '')).toFixed(2)}` : '—'
}

export default function TextTab(): React.ReactElement {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ParsedExpense | null>(null)
  const [parsing, setParsing] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)

  const submit = async () => {
    if (!input.trim()) return

    setParsing(true)
    setResult(null)
    setSaveStatus('idle')

    try {
      // 🧠 Get ML category prediction
      const mlCategory = await predictCategory(input)
      console.log("ML Category:", mlCategory)

      const parsedAmount = extractAmount(input).replace(/[^\d.]/g, "")
      const amountNum = parseFloat(parsedAmount) || 0

      const parsed = {
        merchant: 'Manual Entry',
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        amount: extractAmount(input),
        category: mlCategory,   // ← use ML result
        raw: input.slice(0, 60) + (input.length > 60 ? '…' : ''),
        amountNum, // Store the numeric value for display
      }

      setResult(parsed)
      console.log('[TextTab] Parsed expense (awaiting confirmation):', parsed)

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Prediction error'
      console.error("[TextTab] Prediction error:", err)
      setSaveStatus('error')
      setSaveError(errorMsg)
    }

    setParsing(false)
  }

  const confirmSave = async () => {
    if (!result) return

    try {
      setSaveStatus('saving')
      setSaveError(null)
      
      const amountNum = parseFloat(result.amount.replace(/[₹$\s]/g, "")) || 0

      console.log('[TextTab] Saving expense:', {
        merchant: result.merchant,
        amount: amountNum,
        category: result.category,
      })

      await saveExpense({
        merchant: result.merchant,
        amount: amountNum,
        category: result.category,
        date: new Date(),
        month: new Date().toISOString().slice(0, 7),
      })
      
      setSaveStatus('success')
      console.log('[TextTab] ✅ Expense saved successfully!')
      
      // Reset form after success
      setTimeout(() => {
        setInput('')
        setResult(null)
        setSaveStatus('idle')
      }, 2000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save expense'
      setSaveStatus('error')
      setSaveError(errorMsg)
      console.error('[TextTab] Error saving expense:', errorMsg)
    }
  }

  const cancelSave = () => {
    setResult(null)
    setSaveStatus('idle')
    setSaveError(null)
  }

  return (
    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 16, background: 'var(--bg-card)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
          Describe your expense
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. ₹850 for monthly gym membership today, or Uber ride to airport for ₹320 on 15th Feb..."
          style={{
            width: '100%', background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)',
            borderRadius: 10, padding: '1rem 1.2rem', color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: 1.6,
            resize: 'none', height: 120, outline: 'none', transition: 'border-color 0.2s',
          }}
          onFocus={e  => (e.currentTarget.style.borderColor = 'rgba(0,245,255,0.3)')}
          onBlur={e   => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Quick tags</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {QUICK_TAGS.map(tag => (
              <button
                key={tag}
                className="format-tag"
                onClick={() => setInput(p => p ? `${p} ${tag}` : tag)}
                style={{ cursor: 'pointer', background: 'rgba(0,245,255,0.06)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,245,255,0.14)'; e.currentTarget.style.borderColor = 'var(--neon-cyan)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,245,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(0,245,255,0.2)' }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <button className="btn-primary" onClick={submit} disabled={parsing || !input.trim()} style={{ whiteSpace: 'nowrap', opacity: parsing || !input.trim() ? 0.6 : 1 }}>
          {parsing ? 'Parsing…' : 'Parse with AI →'}
        </button>
      </div>

      {result && (
        <div className="result-preview visible">
          <div className="result-header">📋 Review Your Expense</div>
          {[
            { key: 'Input',    val: result.raw ?? '—', cls: '' },
            { key: 'Amount',   val: (result as any).amount,     cls: 'amount' },
            { key: 'Category', val: result.category,   cls: 'cat' },
            { key: 'Date',     val: result.date,       cls: '' },
          ].map(({ key, val, cls }) => (
            <div className="result-row" key={key}>
              <span className="result-key">{key}</span>
              <span className={`result-val${cls ? ` ${cls}` : ''}`}>{val}</span>
            </div>
          ))}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1.5rem',
            borderTop: '1px solid rgba(0, 245, 255, 0.1)',
            paddingTop: '1rem',
          }}>
            <button
              onClick={confirmSave}
              disabled={saveStatus === 'saving'}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: saveStatus === 'saving' ? 'rgba(0, 245, 255, 0.3)' : 'linear-gradient(135deg, #00f5ff, #0099ff)',
                color: '#000',
                fontWeight: 600,
                cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
                opacity: saveStatus === 'saving' ? 0.7 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (saveStatus !== 'saving') {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 245, 255, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {saveStatus === 'saving' ? 'Saving...' : '✅ Save to Database'}
            </button>
            <button
              onClick={cancelSave}
              disabled={saveStatus === 'saving'}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 59, 48, 0.5)',
                background: 'transparent',
                color: '#ff3b30',
                fontWeight: 600,
                cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
                opacity: saveStatus === 'saving' ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (saveStatus !== 'saving') {
                  e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)'
                  e.currentTarget.style.borderColor = 'rgba(255, 59, 48, 0.8)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(255, 59, 48, 0.5)'
              }}
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}

      {/* Save Status Messages */}
      {saveStatus === 'saving' && (
        <div style={{
          padding: '1rem',
          borderRadius: '0.5rem',
          background: 'rgba(0, 245, 255, 0.1)',
          border: '1px solid rgba(0, 245, 255, 0.3)',
          color: 'var(--neon-cyan)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(0, 245, 255, 0.3)',
            borderTop: '2px solid var(--neon-cyan)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          Saving your expense...
        </div>
      )}

      {saveStatus === 'success' && (
        <div style={{
          padding: '1rem',
          borderRadius: '0.5rem',
          background: 'rgba(52, 211, 153, 0.1)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          color: '#34d399',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          ✅ Expense saved successfully!
        </div>
      )}

      {saveStatus === 'error' && saveError && (
        <div style={{
          padding: '1rem',
          borderRadius: '0.5rem',
          background: 'rgba(255, 59, 48, 0.1)',
          border: '1px solid rgba(255, 59, 48, 0.3)',
          color: '#ff3b30',
          fontSize: '0.9rem',
        }}>
          ❌ Error: {saveError}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
