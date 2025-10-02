import React, { createContext, useContext, useState } from 'react'

type User = { id: string; name: string; role: 'admin' | 'user' | 'viewer' }

type AuthContextType = {
  user: User | null
  login: (role: User['role']) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  const login = async (role: User['role']) => {
    // mock login delay
    await new Promise((r) => setTimeout(r, 300))
    setUser({ id: '1', name: 'Demo', role })
  }

  const logout = () => setUser(null)

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
