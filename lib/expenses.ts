import { addDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "./firebase"
import { auth } from "./firebase"

export interface Expense {
  merchant: string
  amount: number
  category: string
  date: Date | string
  month: string
  userId?: string
  [key: string]: unknown
}

export const saveExpense = async (expense: Expense) => {
  try {
    const currentUser = auth.currentUser
    
    if (!currentUser) {
      throw new Error('User not authenticated. Please sign in to save expenses.')
    }

    console.log('[Expenses] Saving expense for user:', currentUser.uid)
    
    // Add user ID to expense
    const expenseWithUser = {
      ...expense,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const docRef = await addDoc(collection(db, "expenses"), expenseWithUser)
    
    console.log('[Expenses] ✅ Expense saved successfully!')
    console.log('[Expenses] Document ID:', docRef.id)
    console.log('[Expenses] Data:', expenseWithUser)
    
    return docRef.id
  } catch (error) {
    console.error('[Expenses] ❌ Error saving expense:', error)
    throw error
  }
}

/**
 * Get all expenses for the current user
 */
export const getUserExpenses = async () => {
  try {
    const currentUser = auth.currentUser
    
    if (!currentUser) {
      throw new Error('User not authenticated')
    }

    console.log('[Expenses] Fetching expenses for user:', currentUser.uid)
    
    const q = query(
      collection(db, "expenses"),
      where("userId", "==", currentUser.uid)
    )
    
    const querySnapshot = await getDocs(q)
    const expenses: (Expense & { id: string })[] = []
    
    querySnapshot.forEach((doc) => {
      expenses.push({
        id: doc.id,
        ...doc.data() as Expense,
      })
    })

    console.log('[Expenses] ✅ Fetched', expenses.length, 'expenses')
    return expenses
  } catch (error) {
    console.error('[Expenses] ❌ Error fetching expenses:', error)
    throw error
  }
}

/**
 * Debug function - Check all user data in Firebase
 */
export const debugUserData = async () => {
  try {
    const currentUser = auth.currentUser
    
    if (!currentUser) {
      console.log('[Debug] No user logged in')
      return
    }

    console.log('=== USER DATA DEBUG ===')
    console.log('User UID:', currentUser.uid)
    console.log('User Email:', currentUser.email)
    console.log('User Display Name:', currentUser.displayName)
    
    const expenses = await getUserExpenses()
    console.log('Expenses in Firebase:', expenses)
    
    return {
      user: {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
      },
      expenses,
    }
  } catch (error) {
    console.error('[Debug] Error:', error)
  }
}
