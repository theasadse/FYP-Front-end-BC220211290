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
