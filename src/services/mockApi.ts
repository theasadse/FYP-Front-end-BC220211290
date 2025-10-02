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

// Activities: in-memory store so frontend can log and read LMS-like activity records
type Activity = { id: string; instructor_id: string; activity: string; timestamp: string; metadata?: Record<string, any> }

let activitiesStore: Activity[] = Array.from({ length: 8 }).map((_, i) => ({
  id: String(i + 1),
  instructor_id: String(1000 + i),
  activity: ['MDB Reply', 'Assignment Upload', 'Ticket Response'][i % 3],
  timestamp: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
  metadata: { note: `sample ${i}` }
}))

export async function listActivities() {
  await new Promise((r) => setTimeout(r, 150))
  // return newest first
  return activitiesStore.slice().sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
}

export async function createActivity(input: { instructor_id: string; activity: string; metadata?: Record<string, any> }) {
  await new Promise((r) => setTimeout(r, 150))
  const a: Activity = { id: String(Date.now()), timestamp: new Date().toISOString(), ...input }
  activitiesStore.push(a)
  return a
}

export async function exportActivitiesJSON() {
  await new Promise((r) => setTimeout(r, 50))
  return JSON.stringify(activitiesStore, null, 2)
}
