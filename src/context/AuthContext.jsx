import { createContext, useState, useEffect, useCallback, useContext as reactUseContext } from 'react'
import { onAuthStateChange, signOut as authSignOut } from '../lib/auth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const subscription = onAuthStateChange((authUser) => {
      setUser(authUser)
      setLoading(false)
    })
    return () => subscription?.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      await authSignOut()
      setUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = reactUseContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
