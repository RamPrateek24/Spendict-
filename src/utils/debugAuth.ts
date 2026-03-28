import { auth, googleProvider } from '../../lib/firebase'

/**
 * Debug function to verify Firebase auth setup
 * Run this in browser console to check if everything is configured correctly
 */
export async function debugAuthSetup() {
  console.log('=== FIREBASE AUTH DEBUG ===')
  
  // Check if auth is initialized
  console.log('Auth object:', auth)
  console.log('Auth app:', auth.app)
  
  // Check if Google provider is configured
  console.log('Google provider:', googleProvider)
  
  // Check current auth state
  const currentUser = auth.currentUser
  console.log('Current user:', currentUser)
  
  // Try to get token
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken()
      console.log('Current user token:', token)
    } catch (error) {
      console.error('Error getting token:', error)
    }
  }
  
  return {
    authInitialized: !!auth,
    providerConfigured: !!googleProvider,
    userLoggedIn: !!currentUser,
  }
}

/**
 * Write this in the browser console after opening your app:
 * import { debugAuthSetup } from './src/utils/debugAuth'
 * debugAuthSetup()
 */
