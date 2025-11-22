/**
 * Mock API services for simulating backend interactions.
 * This module provides functions to get mock statistics, activities, and handle authentication.
 *
 * @module MockApi
 */

/**
 * Retrieves mock statistical data for the dashboard.
 *
 * @returns {object} An object containing mock statistics:
 * - totalActivities: Number of total activities.
 * - pendingTickets: Number of pending tickets.
 * - reports: Number of reports.
 */
export function getMockStats() {
  return {
    totalActivities: 124,
    pendingTickets: 7,
    reports: 12,
  };
}

/**
 * Generates and retrieves a list of mock activities.
 *
 * @returns {Array<object>} An array of activity objects, each containing:
 * - id: The activity ID.
 * - instructor_id: The ID of the instructor.
 * - activity: The type/name of the activity.
 * - timestamp: The ISO timestamp of when the activity occurred.
 */
export function getMockActivities() {
  return Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    instructor_id: String(1000 + i),
    activity: "MDB Reply",
    timestamp: new Date().toISOString(),
  }));
}

/**
 * Simple mock users store for credential-based login.
 * Contains predefined users with different roles: 'admin', 'user', and 'viewer'.
 *
 * @type {Array<object>}
 */
export const mockUsers = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "2",
    username: "user",
    password: "user123",
    name: "Regular User",
    role: "user",
  },
  {
    id: "3",
    username: "viewer",
    password: "viewer123",
    name: "Viewer User",
    role: "viewer",
  },
];

/**
 * Simulates user authentication.
 * Checks the provided username and password against the mock users store.
 * Simulates network delay.
 *
 * @param {string} username - The username to authenticate.
 * @param {string} password - The password to authenticate.
 * @returns {Promise<object>} A promise that resolves to an object containing:
 * - ok: Boolean indicating success.
 * - token: A fake token if successful.
 * - user: User details (excluding password) if successful.
 * - status: HTTP status code if failed (e.g., 401).
 */
export async function authenticate(username: string, password: string) {
  // simulate network delay
  await new Promise((r) => setTimeout(r, 300));
  const u = mockUsers.find(
    (m) => m.username === username && m.password === password
  );
  if (!u) return { ok: false, status: 401 };
  // return a fake token and user info (omit password)
  const { password: _p, ...user } = u as any;
  return { ok: true, token: btoa(`${u.id}:${Date.now()}`), user };
}

/**
 * Represents the structure of an Activity record.
 * @typedef {object} Activity
 * @property {string} id - Unique identifier for the activity.
 * @property {string} instructor_id - ID of the instructor who performed the activity.
 * @property {string} activity - Description of the activity (e.g., 'MDB Reply').
 * @property {string} timestamp - ISO timestamp of the activity.
 * @property {Record<string, any>} [metadata] - Optional additional data.
 */
type Activity = {
  id: string;
  instructor_id: string;
  activity: string;
  timestamp: string;
  metadata?: Record<string, any>;
};

/**
 * In-memory store for activities, initialized with some mock data.
 * @type {Activity[]}
 */
let activitiesStore: Activity[] = Array.from({ length: 8 }).map((_, i) => ({
  id: String(i + 1),
  instructor_id: String(1000 + i),
  activity: ["MDB Reply", "Assignment Upload", "Ticket Response"][i % 3],
  timestamp: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
  metadata: { note: `sample ${i}` },
}));

/**
 * Retrieves the list of activities from the in-memory store.
 * Simulates network delay and returns activities sorted by timestamp (newest first).
 *
 * @returns {Promise<Activity[]>} A promise that resolves to an array of Activity objects.
 */
export async function listActivities() {
  await new Promise((r) => setTimeout(r, 150));
  // return newest first
  return activitiesStore
    .slice()
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

/**
 * Creates a new activity and adds it to the in-memory store.
 * Simulates network delay.
 *
 * @param {object} input - The activity details.
 * @param {string} input.instructor_id - The ID of the instructor.
 * @param {string} input.activity - The activity description.
 * @param {Record<string, any>} [input.metadata] - Optional metadata.
 * @returns {Promise<Activity>} A promise that resolves to the created Activity object.
 */
export async function createActivity(input: {
  instructor_id: string;
  activity: string;
  metadata?: Record<string, any>;
}) {
  await new Promise((r) => setTimeout(r, 150));
  const a: Activity = {
    id: String(Date.now()),
    timestamp: new Date().toISOString(),
    ...input,
  };
  activitiesStore.push(a);
  return a;
}

/**
 * Exports the current activities as a JSON string.
 * Simulates network delay.
 *
 * @returns {Promise<string>} A promise that resolves to a JSON string representation of the activities.
 */
export async function exportActivitiesJSON() {
  await new Promise((r) => setTimeout(r, 50));
  return JSON.stringify(activitiesStore, null, 2);
}
