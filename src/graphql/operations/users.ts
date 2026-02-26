import { gql } from "@apollo/client";

/**
 * GraphQL queries and mutations for managing Users.
 * @module UserOperations
 */

/**
 * Query to fetch all users.
 *
 * @returns {object} A list of users with their details (id, name, email, role).
 */
export const USERS = gql`
  query Users {
    users {
      id
      name
      email
      role {
        name
        id
      }
    }
  }
`;

/**
 * Query to fetch a single user by ID.
 *
 * @param {ID} userId - The ID of the user to retrieve.
 * @returns {object} The user details.
 */
export const USER = gql`
  query User($id: ID!) {
    user(id: $id) {
      id
      name
      email
      role {
        id
        name
      }
    }
  }
`;

/**
 * Mutation to create a new user.
 *
 * @param {CreateUserInput} input - The data for the new user.
 * @returns {object} The created user object.
 */
export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      role {
        id
        name
      }
    }
  }
`;

/**
 * Mutation to update an existing user.
 *
 * @param {ID} updateUserId - The ID of the user to update.
 * @param {UpdateUserInput} input - The new data for the user.
 * @returns {object} The updated user object.
 */
export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      role {
        name
        id
      }
    }
  }
`;

/**
 * Mutation to delete a user.
 *
 * @param {ID} id - The ID of the user to delete.
 * @returns {boolean} True if the deletion was successful.
 */
export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;
