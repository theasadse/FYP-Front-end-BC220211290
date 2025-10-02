import React, { createContext, useContext, useEffect, useState } from 'react'
import { authenticate } from '../services/mockApi'

type User = { id: string; name: string; role: 'admin' | 'user' | 'viewer'; username?: string }

type AuthContextType = {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string; user?: User }>
  logout: () => void
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'fyp_auth'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setUser(parsed.user)
        setToken(parsed.token)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await authenticate(username, password)
      if (!res.ok) {
        setError('Invalid credentials')
        setIsLoading(false)
        return { ok: false, error: 'Invalid credentials' }
      }
  setUser(res.user)
  setToken(res.token ?? null)
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: res.user, token: res.token ?? null }))
  setIsLoading(false)
  return { ok: true, user: res.user }
    } catch (e) {
      setError('Login failed')
      setIsLoading(false)
      return { ok: false, error: 'Login failed' }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
