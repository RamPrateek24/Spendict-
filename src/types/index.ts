export type InputMode = 'image' | 'voice' | 'text'

export interface ParsedExpense {
  merchant: string
  date: string
  amount: string
  category: string
  tax?: string
  raw?: string
}

export interface UploadedFile {
  name: string
  size: string
  type: string
}

export interface Feature {
  icon: string
  name: string
  desc: string
  accent: string
}

export interface Step {
  num: string
  title: string
  desc: string
}

export interface NavLink {
  label: string
  href: string
}

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}
