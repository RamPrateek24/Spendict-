import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { getUserExpenses } from '../../lib/expenses'
import type { Expense } from '../../lib/expenses'

// Color palette for pie chart
const CHART_COLORS = [
  '#00f5ff',  // neon-cyan
  '#00f55f',  // neon-green
  '#bf5fff',  // neon-violet
  '#ffd700',  // gold
  '#ff3b30',  // red
  '#ff9500',  // orange
  '#34c759',  // green
  '#00b4d8',  // light blue
  '#ff006e',  // pink
  '#8338ec',  // purple
]

export default function ExpenseDashboard(): React.ReactElement {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<(Expense & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load expenses on mount or when user changes
  useEffect(() => {
    if (!user) return

    const loadExpenses = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('[ExpenseDashboard] Loading expenses for user:', user.uid)
        const data = await getUserExpenses()
        console.log('[ExpenseDashboard] Raw data:', data)
        
        // Validate and convert amounts to numbers
        const validatedData = data.map(exp => ({
          ...exp,
          amount: typeof exp.amount === 'string' ? parseFloat(exp.amount) : (exp.amount || 0),
        }))
        
        console.log('[ExpenseDashboard] Validated data:', validatedData)
        setExpenses(validatedData)
        console.log('[ExpenseDashboard] Loaded', validatedData.length, 'expenses')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load expenses'
        setError(message)
        console.error('[ExpenseDashboard] Error:', message)
      } finally {
        setLoading(false)
      }
    }

    loadExpenses()
  }, [user])

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Please sign in to view your expenses
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading expenses...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        padding: '2rem',
        borderRadius: '0.5rem',
        background: 'rgba(255, 59, 48, 0.1)',
        border: '1px solid rgba(255, 59, 48, 0.3)',
        color: '#ff3b30',
      }}>
        Error loading expenses: {error}
      </div>
    )
  }

  // Get current month in YYYY-MM format
  const currentMonth = new Date().toISOString().slice(0, 7)
  console.log('[ExpenseDashboard] Current month:', currentMonth)

  // Separate current month and all expenses
  const currentMonthExpenses = expenses.filter(exp => {
    const expMonth = exp.month || new Date(exp.date).toISOString().slice(0, 7)
    return expMonth === currentMonth
  })

  // Calculate totals with proper number conversion
  const totalAmount = expenses.reduce((sum, exp) => {
    const amount = typeof exp.amount === 'string' ? parseFloat(exp.amount) : (exp.amount || 0)
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)

  const currentMonthTotal = currentMonthExpenses.reduce((sum, exp) => {
    const amount = typeof exp.amount === 'string' ? parseFloat(exp.amount) : (exp.amount || 0)
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)

  const categoryTotals = expenses.reduce((acc, exp) => {
    const amount = typeof exp.amount === 'string' ? parseFloat(exp.amount) : (exp.amount || 0)
    const validAmount = isNaN(amount) ? 0 : amount
    acc[exp.category] = (acc[exp.category] || 0) + validAmount
    return acc
  }, {} as Record<string, number>)

  console.log('[ExpenseDashboard] Calculated totals:', { totalAmount, currentMonthTotal, categoryTotals })

  return (
    <div style={{
      padding: '2rem',
      borderRadius: '1rem',
      border: '1px solid rgba(0, 245, 255, 0.2)',
      background: 'rgba(2, 4, 8, 0.3)',
    }}>
      {/* Main Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--neon-cyan)', fontSize: '1.8rem' }}>
          📊 Your Expense Dashboard
        </h2>
      </div>

      {/* Current Month Card - HIGHLIGHTED */}
      <div style={{
        padding: '1.5rem',
        borderRadius: '1rem',
        border: '2px solid var(--neon-cyan)',
        background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.1), rgba(0, 153, 255, 0.05))',
        marginBottom: '2rem',
      }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          📅 {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </div>
        <div style={{ color: 'var(--neon-cyan)', fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          ₹ {currentMonthTotal.toFixed(2)}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {currentMonthExpenses.length} expense{currentMonthExpenses.length !== 1 ? 's' : ''} this month
        </div>
      </div>

      {/* All Time Stats */}
      <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(0, 245, 255, 0.1)' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1rem' }}>
          📈 All-Time Stats
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div style={{
            padding: '1rem',
            borderRadius: '0.5rem',
            background: 'rgba(0, 245, 255, 0.05)',
            border: '1px solid rgba(0, 245, 255, 0.15)',
          }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Total Spent
            </div>
            <div style={{ color: 'var(--neon-cyan)', fontWeight: 600, fontSize: '1.5rem' }}>
              ₹ {totalAmount.toFixed(2)}
            </div>
          </div>
          <div style={{
            padding: '1rem',
            borderRadius: '0.5rem',
            background: 'rgba(0, 245, 255, 0.05)',
            border: '1px solid rgba(0, 245, 255, 0.15)',
          }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Total Entries
            </div>
            <div style={{ color: 'var(--neon-cyan)', fontWeight: 600, fontSize: '1.5rem' }}>
              {expenses.length}
            </div>
          </div>
        </div>
      </div>

      {/* Category Summary */}
      {Object.keys(categoryTotals).length > 0 && (
        <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(0, 245, 255, 0.1)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1rem' }}>
            📂 By Category
          </h3>

          {/* Pie Chart */}
          <div style={{ 
            marginBottom: '2rem', 
            display: 'flex', 
            justifyContent: 'center',
            padding: '1rem',
            borderRadius: '0.8rem',
            background: 'rgba(0, 245, 255, 0.03)',
            border: '1px solid rgba(0, 245, 255, 0.1)',
          }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(categoryTotals).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => {
                    const percentage = percent ? (percent * 100).toFixed(1) : '0'
                    return `${name} ₹${value?.toFixed?.(0) || '0'} (${percentage}%)`
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(categoryTotals).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => {
                    const numValue = typeof value === 'number' ? value : parseFloat(value) || 0
                    return `₹ ${numValue.toFixed(2)}`
                  }}
                  contentStyle={{ 
                    background: 'rgba(2, 4, 8, 0.95)', 
                    border: '1px solid rgba(0, 245, 255, 0.3)',
                    borderRadius: '0.4rem',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([category, amount]) => (
              <div
                key={category}
                style={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(0, 245, 255, 0.05)',
                  border: '1px solid rgba(0, 245, 255, 0.15)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: 'var(--text-primary)' }}>{category}</span>
                <span style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>
                  ₹ {amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Expenses */}
      {expenses.length > 0 ? (
        <div>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1rem' }}>
            ⏱️ Recent Expenses
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {expenses.slice().reverse().map((expense) => {
              const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : (expense.amount || 0)
              return (
                <div
                  key={expense.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(0, 245, 255, 0.03)',
                    border: '1px solid rgba(0, 245, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {expense.category}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {expense.merchant} • {
                        typeof expense.date === 'string' 
                          ? expense.date 
                          : new Date(expense.date).toLocaleDateString('en-IN')
                      }
                    </div>
                  </div>
                  <div style={{ color: 'var(--neon-cyan)', fontWeight: 600, fontSize: '1.1rem' }}>
                    ₹ {amount.toFixed(2)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          🎯 No expenses yet. Start logging your expenses to see them here!
        </div>
      )}
    </div>
  )
}
