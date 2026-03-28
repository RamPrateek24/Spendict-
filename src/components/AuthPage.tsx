import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import BackgroundEffects from './BackgroundEffects'

export default function AuthPage(): React.ReactElement {
  const { signInWithGoogle, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    try {
      setError(null)
      console.log('[AuthPage] Starting sign-in process')
      await signInWithGoogle()
      console.log('[AuthPage] Sign-in completed, should navigate away')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error('[AuthPage] Sign-in error:', errorMessage)
      
      // Provide helpful error messages
      if (errorMessage.includes('popup-blocked')) {
        setError('Pop-up was blocked. Please allow pop-ups for this site.')
      } else if (errorMessage.includes('cancelled')) {
        setError('Sign-in was cancelled.')
      } else if (errorMessage.includes('auth-disabled')) {
        setError('Authentication is not properly configured. Check Firebase setup.')
      } else {
        setError(`Sign-in failed: ${errorMessage}`)
      }
    }
  }

  return (
    <>
      <BackgroundEffects />
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
          fontFamily: 'var(--font-base)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
            maxWidth: '400px',
            padding: '3rem',
            borderRadius: '1rem',
            border: '1px solid rgba(0, 245, 255, 0.2)',
            background: 'rgba(2, 4, 8, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Logo and Title */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="logo-dot" />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.8rem',
                  letterSpacing: '-0.02em',
                  color: 'var(--neon-cyan)',
                }}
              >
                Spendict!
              </span>
            </div>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
                margin: 0,
              }}
            >
              Smart expense tracking with AI-powered categorization
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: '1rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 59, 48, 0.1)',
                border: '1px solid rgba(255, 59, 48, 0.3)',
                color: '#ff3b30',
                fontSize: '0.9rem',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'linear-gradient(135deg, #00f5ff, #0099ff)',
              color: '#000',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 245, 255, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {/* Google Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="currentColor"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="currentColor"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="currentColor"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="currentColor"
              />
            </svg>
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          {/* Terms and Privacy */}
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
              margin: 0,
            }}
          >
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </>
  )
}