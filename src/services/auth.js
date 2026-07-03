const API_BASE = import.meta.env.VITE_API_URL ?? '/auth'

async function request (url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers }
  })

  const data = await res.json()

  if (!res.ok) {
    const msg = data.message || (Array.isArray(data.error) ? data.error[0]?.message : data.error) || 'Something went wrong'
    throw new Error(msg)
  }

  return data
}

export const authService = {
  register (username, email, password) {
    return request('/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    })
  },

  login (email, password) {
    return request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  },

  refresh (refreshToken) {
    return request('/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    })
  },

  logout (refreshToken) {
    return request('/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    })
  },

  me (accessToken) {
    return request('/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    })
  }
}
