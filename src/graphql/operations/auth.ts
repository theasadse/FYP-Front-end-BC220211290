import { gql } from "@apollo/client";

/**
 * GraphQL queries and mutations for Authentication.
 * @module AuthOperations
 */

/**
 * Query to fetch the current authenticated user.
 *
 * @returns {object} The current user's details (id, name, email, role).
 */
export const ME = gql`
  query Me {
    me {
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
 * Mutation to register a new user.
 *
 * @param {RegisterInput} input - The registration data (name, email, password, etc.).
 * @returns {object} The authentication token and user details.
 */
export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

/**
 * Mutation to log in a user.
 *
 * @param {LoginInput} input - The login credentials (email/username, password).
 * @returns {object} The authentication token and user details including role.
 */
export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        name
        email
        role {
          name
        }
      }
    }
  }
`;
