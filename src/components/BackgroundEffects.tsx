import React from 'react'

export default function BackgroundEffects(): React.ReactElement {
  return (
    <>
      {/* Grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage:
          'linear-gradient(rgba(0,245,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.025) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Cyan orb — top left */}
      <div style={{
        position: 'fixed', borderRadius: '50%', filter: 'blur(120px)',
        pointerEvents: 'none', zIndex: 0,
        width: 600, height: 600, top: -200, left: -100,
        background: 'radial-gradient(circle, rgba(0,245,255,0.07) 0%, transparent 70%)',
        animation: 'orbFloat 14s ease-in-out infinite alternate',
      }} />

      {/* Violet orb — bottom right */}
      <div style={{
        position: 'fixed', borderRadius: '50%', filter: 'blur(120px)',
        pointerEvents: 'none', zIndex: 0,
        width: 500, height: 500, bottom: -150, right: -100,
        background: 'radial-gradient(circle, rgba(191,95,255,0.07) 0%, transparent 70%)',
        animation: 'orbFloat 18s ease-in-out infinite alternate',
      }} />

      {/* Green orb — centre */}
      <div style={{
        position: 'fixed', borderRadius: '50%', filter: 'blur(120px)',
        pointerEvents: 'none', zIndex: 0,
        width: 400, height: 400, top: '40%', left: '40%',
        background: 'radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)',
        animation: 'orbFloat 10s ease-in-out infinite alternate',
      }} />

      {/* Noise overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, opacity: 0.45,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
      }} />
    </>
  )
}
