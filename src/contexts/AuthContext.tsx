import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth, googleProvider } from '../../lib/firebase'
import type { User, AuthContextType } from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Listen to auth state changes
  useEffect(() => {
    console.log('[AuthContext] Setting up auth state listener')
    
    // Check for existing session immediately
    const currentUser = auth.currentUser
    if (currentUser) {
      console.log('[AuthContext] Found existing session:', currentUser.email)
      setUser({
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
      })
    }
    
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        console.log('[AuthContext] Auth state changed:', firebaseUser?.email || 'No user')
        if (firebaseUser) {
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          }
          console.log('[AuthContext] Setting user:', userData)
          setUser(userData)
        } else {
          console.log('[AuthContext] User logged out')
          setUser(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('[AuthContext] Auth state listener error:', error)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    try {
      console.log('[AuthContext] Starting Google sign-in...')
      setLoading(true)
      const result = await signInWithPopup(auth, googleProvider)
      const firebaseUser = result.user
      console.log('[AuthContext] Sign-in successful:', firebaseUser.email)
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      }
      setUser(userData)
      console.log('[AuthContext] User state updated')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('[AuthContext] Error signing in with Google:', errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await firebaseSignOut(auth)
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}