import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { NavLink } from '../types'

const NAV_LINKS: NavLink[] = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how' },
  { label: 'Tech', href: '#tech' },
]

export default function Navbar(): React.ReactElement {
  const [scrolled, setScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isDashboard = location.pathname === '/dashboard'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
      setShowUserMenu(false)
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '1.2rem 3rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      background: scrolled ? 'rgba(2,4,8,0.88)' : 'rgba(2,4,8,0.6)',
      borderBottom: '1px solid rgba(0,245,255,0.12)',
      transition: 'background 0.3s ease',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className="logo-dot" />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
          Spendict!
        </span>
      </div>

      {/* Links */}
      <ul style={{ display: 'flex', gap: '2.5rem', listStyle: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.83rem', letterSpacing: '0.05em', alignItems: 'center' }}>
        
        {/* Home Link */}
        <li>
          <button
            onClick={() => navigate('/')}
            style={{ 
              background: isHome ? 'rgba(0, 245, 255, 0.2)' : 'none', 
              border: isHome ? '1px solid rgba(0, 245, 255, 0.5)' : 'none',
              padding: '0.4rem 0.75rem',
              borderRadius: '0.3rem',
              color: isHome ? 'var(--neon-cyan)' : 'var(--text-muted)', 
              cursor: 'pointer', 
              fontFamily: 'inherit', 
              fontSize: 'inherit', 
              letterSpacing: 'inherit', 
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              height: '100%',
            }}
            onMouseEnter={e => {
              if (!isHome) {
                e.currentTarget.style.color = 'var(--neon-cyan)'
              }
            }}
            onMouseLeave={e => {
              if (!isHome) {
                e.currentTarget.style.color = 'var(--text-muted)'
              }
            }}
          >
            Home
          </button>
        </li>

        {NAV_LINKS.map(link => (
          <li key={link.href}>
            <button
              onClick={() => {
                if (isHome) {
                  document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--text-muted)', 
                cursor: 'pointer', 
                fontFamily: 'inherit', 
                fontSize: 'inherit', 
                letterSpacing: 'inherit', 
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                padding: '0.4rem 0.75rem',
              }}
              onMouseEnter={e => {
                if (isHome) {
                  e.currentTarget.style.color = 'var(--neon-cyan)'
                }
              }}
              onMouseLeave={e => {
                if (isHome) {
                  e.currentTarget.style.color = 'var(--text-muted)'
                }
              }}
            >
              {link.label}
            </button>
          </li>
        ))}

        {/* Dashboard Link */}
        <li>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ 
              background: isDashboard ? 'rgba(0, 245, 255, 0.2)' : 'none', 
              border: isDashboard ? '1px solid rgba(0, 245, 255, 0.5)' : 'none',
              padding: '0.4rem 0.75rem',
              borderRadius: '0.3rem',
              color: isDashboard ? 'var(--neon-cyan)' : 'var(--text-muted)', 
              cursor: 'pointer', 
              fontFamily: 'inherit', 
              fontSize: 'inherit', 
              letterSpacing: 'inherit', 
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              height: '100%',
            }}
            onMouseEnter={e => {
              if (!isDashboard) {
                e.currentTarget.style.color = 'var(--neon-cyan)'
              }
            }}
            onMouseLeave={e => {
              if (!isDashboard) {
                e.currentTarget.style.color = 'var(--text-muted)'
              }
            }}
          >
            Dashboard
          </button>
        </li>
      </ul>
      

      {/* User Profile or CTA */}
      <div style={{ position: 'relative' }}>
        {user ? (
          <div>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(0, 245, 255, 0.3)',
                background: 'rgba(0, 245, 255, 0.05)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.83rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 245, 255, 0.6)'
                e.currentTarget.style.background = 'rgba(0, 245, 255, 0.1)'
                e.currentTarget.style.color = 'var(--neon-cyan)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 245, 255, 0.3)'
                e.currentTarget.style.background = 'rgba(0, 245, 255, 0.05)'
                e.currentTarget.style.color = 'var(--text-muted)'
              }}
            >
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                  }}
                />
              )}
              <span>{user.displayName?.split(' ')[0] || 'User'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(0, 245, 255, 0.3)',
                  background: 'rgba(2, 4, 8, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  minWidth: '200px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid rgba(0, 245, 255, 0.1)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>
                    {user.displayName}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {user.email}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    color: '#ff3b30',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </nav>
  )
}
