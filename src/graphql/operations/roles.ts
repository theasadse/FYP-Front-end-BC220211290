import { gql } from "@apollo/client";

/**
 * GraphQL queries and mutations for managing Roles.
 * @module RoleOperations
 */

/**
 * Query to fetch all available roles.
 *
 * @returns {object} A list of roles with their IDs and names.
 */
export const ROLES = gql`
  query Roles {
    roles {
      id
      name
    }
  }
`;

/**
 * Mutation to create a new role.
 *
 * @param {string} name - The name of the new role.
 * @returns {object} The created role object.
 */
export const CREATE_ROLE = gql`
  mutation CreateRole($name: String!) {
    createRole(name: $name) {
      id
      name
    }
  }
`;

/**
 * Mutation to update an existing role.
 *
 * @param {ID} updateRoleId - The ID of the role to update.
 * @param {string} name - The new name for the role.
 * @returns {object} The updated role object.
 */
export const UPDATE_ROLE = gql`
  mutation UpdateRole($id: ID!, $name: String!) {
    updateRole(id: $id, name: $name) {
      id
      name
    }
  }
`;

/**
 * Mutation to delete a role.
 *
 * @param {ID} id - The ID of the role to delete.
 * @returns {boolean} True if the deletion was successful.
 */
export const DELETE_ROLE = gql`
  mutation DeleteRole($id: ID!) {
    deleteRole(id: $id)
  }
`;
