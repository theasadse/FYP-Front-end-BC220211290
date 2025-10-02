export function getMockStats() {
  return {
    totalActivities: 124,
    pendingTickets: 7,
    reports: 12
  }
}

export function getMockActivities() {
  return Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    instructor_id: String(1000 + i),
    activity: 'MDB Reply',
    timestamp: new Date().toISOString()
  }))
}

// Simple mock users store for credential-based login
export const mockUsers = [
  { id: '1', username: 'admin', password: 'admin123', name: 'Admin User', role: 'admin' },
  { id: '2', username: 'user', password: 'user123', name: 'Regular User', role: 'user' },
  { id: '3', username: 'viewer', password: 'viewer123', name: 'Viewer User', role: 'viewer' }
]

export async function authenticate(username: string, password: string) {
  // simulate network delay
  await new Promise((r) => setTimeout(r, 300))
  const u = mockUsers.find((m) => m.username === username && m.password === password)
  if (!u) return { ok: false, status: 401 }
  // return a fake token and user info (omit password)
  const { password: _p, ...user } = u as any
  return { ok: true, token: btoa(`${u.id}:${Date.now()}`), user }
}
