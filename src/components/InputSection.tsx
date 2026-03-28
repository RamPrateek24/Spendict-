import React, { useState } from 'react'
import type { InputMode } from '../types'
import ImageUploadTab from './ImageUploadTab'
import VoiceTab from './VoiceTab'
import TextTab from './TextTab'

interface Tab { id: InputMode; label: string; icon: React.ReactElement }

const TABS: Tab[] = [
  {
    id: 'image', label: 'Bill Image',
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width={15} height={15}><rect x={3} y={3} width={18} height={18} rx={2}/><circle cx={8.5} cy={8.5} r={1.5}/><polyline points="21 15 16 10 5 21"/></svg>,
  },
  {
    id: 'voice', label: 'Voice Note',
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width={15} height={15}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4"/></svg>,
  },
  {
    id: 'text', label: 'Manual Text',
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width={15} height={15}><line x1={17} y1={10} x2={3} y2={10}/><line x1={21} y1={6} x2={3} y2={6}/><line x1={21} y1={14} x2={3} y2={14}/><line x1={17} y1={18} x2={3} y2={18}/></svg>,
  },
]

export default function InputSection(): React.ReactElement {
  const [active, setActive] = useState<InputMode>('image')

  return (
    <section id="upload-anchor" style={{ padding: '5rem 2rem', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      <div className="section-label">Smart Data Entry</div>
      <h2 className="section-title">Log Expenses<br />Your Way</h2>
      <p className="section-desc">Upload a bill photo, record a voice note, or type it manually — our AI extracts, categorizes and logs it instantly.</p>

      {/* Tab buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', margin: '3rem 0 2rem', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn${active === tab.id ? ' active' : ''}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {active === 'image' && <ImageUploadTab />}
      {active === 'voice' && <VoiceTab />}
      {active === 'text'  && <TextTab />}
    </section>
  )
}
