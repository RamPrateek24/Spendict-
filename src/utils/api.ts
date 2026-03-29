import { auth } from '../../lib/firebase'

/**
 * Makes an authenticated API call to the backend with the user's Firebase token
 * @param endpoint - The API endpoint (e.g., '/predict')
 * @param method - HTTP method (default: 'POST')
 * @param data - Request body data
 * @returns - Response from the backend
 */
export async function authenticatedFetch(
  endpoint: string,
  method: string = 'POST',
  data?: Record<string, unknown>
): Promise<Response> {
  try {
    // Get current user's ID token
    const token = await auth.currentUser?.getIdToken()
    
    if (!token) {
      throw new Error('User not authenticated')
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const response = await fetch(`${apiUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    return response
  } catch (error) {
    console.error('Authenticated fetch error:', error)
    throw error
  }
}

/**
 * Helper function to parse authenticated API response
 */
export async function parseAuthenticatedResponse<T>(response: Response): Promise<T> {
  return response.json()
}