/**
 * Mock data layer simulating a GraphQL backend.
 * This module provides functions that mimic GraphQL resolvers for Users and Roles.
 * It uses in-memory arrays to store data and simulates network latency.
 *
 * @module MockSchema
 */

/**
 * Represents a User in the mock database.
 */
type User = { id: string; username: string; name: string; role: string };

/**
 * Represents a Role in the mock database.
 */
type Role = { id: string; name: string };

/**
 * In-memory store of users.
 */
let users: User[] = [
  { id: "1", username: "admin", name: "Admin User", role: "admin" },
  { id: "2", username: "user", name: "Regular User", role: "user" },
  { id: "3", username: "viewer", name: "Viewer User", role: "viewer" },
];

/**
 * In-memory store of roles.
 */
let roles: Role[] = [
  { id: "r1", name: "admin" },
  { id: "r2", name: "user" },
  { id: "r3", name: "viewer" },
];

/**
 * Retrieves all users from the mock store.
 *
 * @returns {Promise<User[]>} A promise resolving to an array of users.
 */
export async function listUsers() {
  await new Promise((r) => setTimeout(r, 200));
  return users.slice();
}

/**
 * Retrieves a single user by ID.
 *
 * @param {string} id - The ID of the user to retrieve.
 * @returns {Promise<User | null>} A promise resolving to the user object or null if not found.
 */
export async function getUser(id: string) {
  await new Promise((r) => setTimeout(r, 150));
  return users.find((u) => u.id === id) ?? null;
}

/**
 * Creates a new user in the mock store.
 *
 * @param {object} input - The user data.
 * @param {string} input.username - The username.
 * @param {string} input.name - The full name.
 * @param {string} input.role - The role name.
 * @returns {Promise<User>} A promise resolving to the created user object.
 */
export async function createUser(input: {
  username: string;
  name: string;
  role: string;
}) {
  await new Promise((r) => setTimeout(r, 200));
  const id = String(Date.now());
  const u = { id, ...input };
  users.push(u);
  return u;
}

/**
 * Updates an existing user in the mock store.
 *
 * @param {string} id - The ID of the user to update.
 * @param {Partial<object>} input - The fields to update.
 * @returns {Promise<User | null>} A promise resolving to the updated user object or null if not found.
 */
export async function updateUser(
  id: string,
  input: Partial<{ username: string; name: string; role: string }>
) {
  await new Promise((r) => setTimeout(r, 200));
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...input };
  return users[idx];
}

/**
 * Deletes a user from the mock store.
 *
 * @param {string} id - The ID of the user to delete.
 * @returns {Promise<boolean>} A promise resolving to true.
 */
export async function deleteUser(id: string) {
  await new Promise((r) => setTimeout(r, 150));
  users = users.filter((u) => u.id !== id);
  return true;
}

/**
 * Retrieves all roles from the mock store.
 *
 * @returns {Promise<Role[]>} A promise resolving to an array of roles.
 */
export async function listRoles() {
  await new Promise((r) => setTimeout(r, 100));
  return roles.slice();
}

/**
 * Creates a new role in the mock store.
 *
 * @param {string} name - The name of the new role.
 * @returns {Promise<Role>} A promise resolving to the created role object.
 */
export async function createRole(name: string) {
  await new Promise((r) => setTimeout(r, 150));
  const r = { id: String(Date.now()), name };
  roles.push(r);
  return r;
}

/**
 * Deletes a role from the mock store.
 *
 * @param {string} id - The ID of the role to delete.
 * @returns {Promise<boolean>} A promise resolving to true.
 */
export async function deleteRole(id: string) {
  await new Promise((r) => setTimeout(r, 150));
  roles = roles.filter((x) => x.id !== id);
  return true;
}
