import { authenticatedFetch, parseAuthenticatedResponse } from './api'

export const predictCategory = async (text: string) => {
  try {
    const response = await authenticatedFetch('/predict', 'POST', { text })
    const data = await parseAuthenticatedResponse<{ category: string }>(response)
    return data.category
  } catch (error) {
    console.error('Error predicting category:', error)
    throw error
  }
}