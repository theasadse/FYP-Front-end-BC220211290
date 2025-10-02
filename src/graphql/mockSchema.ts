// Very small in-memory data layer that mimics GraphQL CRUD operations.
// The frontend will call these functions instead of real GraphQL for now.

type User = { id: string; username: string; name: string; role: string }
type Role = { id: string; name: string }

let users: User[] = [
  { id: '1', username: 'admin', name: 'Admin User', role: 'admin' },
  { id: '2', username: 'user', name: 'Regular User', role: 'user' },
  { id: '3', username: 'viewer', name: 'Viewer User', role: 'viewer' }
]

let roles: Role[] = [
  { id: 'r1', name: 'admin' },
  { id: 'r2', name: 'user' },
  { id: 'r3', name: 'viewer' }
]

export async function listUsers() {
  await new Promise((r) => setTimeout(r, 200))
  return users.slice()
}

export async function getUser(id: string) {
  await new Promise((r) => setTimeout(r, 150))
  return users.find((u) => u.id === id) ?? null
}

export async function createUser(input: { username: string; name: string; role: string }) {
  await new Promise((r) => setTimeout(r, 200))
  const id = String(Date.now())
  const u = { id, ...input }
  users.push(u)
  return u
}

export async function updateUser(id: string, input: Partial<{ username: string; name: string; role: string }>) {
  await new Promise((r) => setTimeout(r, 200))
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) return null
  users[idx] = { ...users[idx], ...input }
  return users[idx]
}

export async function deleteUser(id: string) {
  await new Promise((r) => setTimeout(r, 150))
  users = users.filter((u) => u.id !== id)
  return true
}

export async function listRoles() {
  await new Promise((r) => setTimeout(r, 100))
  return roles.slice()
}

export async function createRole(name: string) {
  await new Promise((r) => setTimeout(r, 150))
  const r = { id: String(Date.now()), name }
  roles.push(r)
  return r
}

export async function deleteRole(id: string) {
  await new Promise((r) => setTimeout(r, 150))
  roles = roles.filter((x) => x.id !== id)
  return true
}
