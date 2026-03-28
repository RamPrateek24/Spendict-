import { useState, useRef, useEffect } from 'react'
import { saveExpense } from "../../lib/expenses"
import { predictCategory } from "../utils/predictCategory"

const NUM_BARS = 9

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width={26} height={26}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4"/>
  </svg>
)

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width={22} height={22}>
    <rect x={6} y={6} width={12} height={12} rx={2}/>
  </svg>
)

interface VoiceState {
  isRecording: boolean
  seconds: number
  showResult: boolean
  isProcessing: boolean
  confirmingSave: boolean
  saveStatus: 'idle' | 'saving' | 'success' | 'error'
  saveError: string
}

const extractAmount = (text: string) => {
  const match = text.match(/\d+(\.\d+)?/)
  return match ? Number(match[0]) : 0
}


export default function VoiceTab() {
  const [state, setState] = useState<VoiceState>({ isRecording: false, seconds: 0, showResult: false, isProcessing: false, confirmingSave: false, saveStatus: 'idle', saveError: '' })
  const [barHeights, setBarHeights] = useState<number[]>(Array(NUM_BARS).fill(8))
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const animRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const recognitionRef = useRef<any>(null)
  const [transcript, setTranscript] = useState<string>('')
  const [mlCategory, setMlCategory] = useState<string>("")


  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (animRef.current)  clearInterval(animRef.current)
  }, [])

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const start = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      alert("Microphone permission denied")
      return
    }
    setTranscript("")
    setState({ isRecording: true, seconds: 0, showResult: false, isProcessing: false, confirmingSave: false, saveStatus: 'idle', saveError: '' })
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.continuous = false
    recognition.interimResults = false

    // recognition.onresult = (event: any) => {
    //   const speechText = event.results[0][0].transcript
    //   setTranscript(speechText)
    // }

    recognition.onresult = async (event: any) => {

      const last = event.results.length - 1
      const speechText = event.results[last][0].transcript

      console.log("Transcript:", speechText)

      setTranscript(speechText)

      // 🧠 ML category prediction
      const category = await predictCategory(speechText)

      setMlCategory(category)

      // Show review screen instead of auto-saving
      setState(p => ({...p, confirmingSave: true, saveStatus: 'idle', saveError: ''}))
    }


    recognition.onend = () => {
      stop()
    }


    recognitionRef.current = recognition
    recognition.start()

    timerRef.current = setInterval(() => setState(p => ({ ...p, seconds: p.seconds + 1 })), 1000)
    animRef.current  = setInterval(() => setBarHeights(Array.from({ length: NUM_BARS }, () => Math.floor(Math.random() * 44) + 6)), 120)
  }

  const stop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      recognitionRef.current.stop()
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (animRef.current) {
      clearInterval(animRef.current)
      animRef.current = null
    }

    setBarHeights(Array(NUM_BARS).fill(8))

    setState(p => ({
      ...p,
      isRecording: false,
      isProcessing: true,
    }))

    setTimeout(() => {
      setState(p => ({
        ...p,
        isProcessing: false,
        showResult: true,
      }))
    }, 1000)
  }


  const { isRecording, seconds, showResult, isProcessing, confirmingSave, saveStatus } = state
  const amount = extractAmount(transcript)

  const confirmSave = async () => {
    try {
      setState(p => ({...p, saveStatus: 'saving'}))
      await saveExpense({
        merchant: "Voice Entry",
        amount,
        category: mlCategory,
        date: new Date(),
        month: new Date().toISOString().slice(0, 7),
      })
      setState(p => ({...p, saveStatus: 'success', confirmingSave: false}))
      setTranscript('')
      setMlCategory('')
    } catch (err) {
      setState(p => ({...p, saveStatus: 'error', saveError: (err as any).message}))
      console.error('[VoiceTab] Save error:', err)
    }
  }

  const cancelSave = () => {
    setState(p => ({...p, confirmingSave: false, saveStatus: 'idle', saveError: ''}))
    setTranscript('')
    setMlCategory('')
  }

  return (
    <div className="voice-panel">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.3rem' }}>Voice Expense Entry</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Speak naturally — Spendict understands</div>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: isRecording ? 'var(--neon-violet)' : 'var(--text-muted)' }}>
          {fmt(seconds)}
        </div>
      </div>

      {/* Waveform */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, margin: '1.5rem 0' }}>
        {barHeights.map((h, i) => (
          <div key={i} style={{
            width: 3, height: h, borderRadius: 2,
            background: isRecording ? 'var(--neon-violet)' : 'rgba(191,95,255,0.25)',
            transition: isRecording ? 'height 0.12s ease' : 'height 0.3s ease, background 0.3s',
          }} />
        ))}
      </div>

      {/* Button */}
      <button onClick={isRecording ? stop : start} style={{
        width: 64, height: 64, borderRadius: '50%',
        background: isRecording ? 'rgba(191,95,255,0.2)' : 'rgba(191,95,255,0.1)',
        border: `2px solid ${isRecording ? 'var(--neon-violet)' : 'rgba(191,95,255,0.35)'}`,
        color: 'var(--neon-violet)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', margin: '0 auto', transition: 'all 0.2s',
        boxShadow: isRecording ? '0 0 30px rgba(191,95,255,0.4)' : 'none',
        animation: isRecording ? 'voicePulseBtn 1s ease-in-out infinite' : 'none',
      }}>
        {isRecording ? <StopIcon /> : <MicIcon />}
      </button>

      {/* Status */}
      <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', marginTop: '1rem',
        color: isRecording ? 'var(--neon-violet)' : isProcessing ? 'var(--neon-cyan)' : 'var(--text-muted)',
      }}>
        {isRecording ? 'Recording… speak your expense' : isProcessing ? 'Processing with NLP…' : 'Press to start recording'}
      </div>

      {/* Result */}
      {showResult && (
        <div className="result-preview visible" style={{ marginTop: '1.5rem' }}>
          <div className="result-header">Transcribed &amp; Parsed</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-dim)', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)', fontStyle: 'italic' }}>
            "{transcript}"
          </div>
          {[
              { key: 'Merchant', val: 'Voice Entry', cls: '' },
              { key: 'Amount', val: `₹ ${amount}`, cls: 'amount' },
              { key: 'Category', val: mlCategory, cls: 'cat' },
              { key: 'Date', val: new Date().toLocaleDateString('en-IN'), cls: '' },
            ].map(({ key, val, cls }) => (
            <div className="result-row" key={key}>
              <span className="result-key">{key}</span>
              <span className={`result-val${cls ? ` ${cls}` : ''}`}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Review Screen - Save/Cancel Buttons */}
      {confirmingSave && (
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
          ❌ Error: {state.saveError || 'Failed to save'}
        </div>
      )}
    </div>
  )
}
