const API_BASE = import.meta.env.VITE_API_URL?.replace('/auth', '') ?? ''

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

export const postService = {
  getAll () {
    return request('/posts', { method: 'GET' })
  },

  getById (id) {
    return request(`/posts/${id}`, { method: 'GET' })
  },

  create (title, content, excerpt, tag, accessToken) {
    return request('/posts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ title, content, excerpt, tag })
    })
  },

  update (id, data, accessToken) {
    return request(`/posts/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(data)
    })
  },

  delete (id, accessToken) {
    return request(`/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    })
  }
}
