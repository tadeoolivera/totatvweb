import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from './AuthContext.js'
import { authService } from '../services/auth.js'

const STORAGE_KEY = 'totatv_auth'

function loadFromStorage () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveToStorage (data) {
  if (data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function AuthProvider ({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(() => {
    const stored = loadFromStorage()
    return stored?.accessToken || null
  })
  const [loading, setLoading] = useState(() => !!loadFromStorage()?.accessToken)

  useEffect(() => {
    if (!accessToken) return

    authService.me(accessToken)
      .then(({ user }) => setUser(user))
      .catch(() => {
        setAccessToken(null)
        saveToStorage(null)
      })
      .finally(() => setLoading(false))
  }, [accessToken])

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    setUser(data.user)
    setAccessToken(data.accessToken)
    saveToStorage({ accessToken: data.accessToken, refreshToken: data.refreshToken })
    return data
  }, [])

  const register = useCallback(async (username, email, password) => {
    const data = await authService.register(username, email, password)
    setUser(data.user)
    setAccessToken(data.accessToken)
    saveToStorage({ accessToken: data.accessToken, refreshToken: data.refreshToken })
    return data
  }, [])

  const logout = useCallback(async () => {
    const stored = loadFromStorage()
    if (stored?.refreshToken) {
      try { await authService.logout(stored.refreshToken) } catch { /* ignore */ }
    }
    setUser(null)
    setAccessToken(null)
    saveToStorage(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
