import { gql } from "@apollo/client";

// Query 8/11: Roles
export const ROLES = gql`
  query Roles {
    roles {
      id
      name
    }
  }
`;

// Mutation 6/14: CreateRole
export const CREATE_ROLE = gql`
  mutation CreateRole($name: String!) {
    createRole(name: $name) {
      id
      name
    }
  }
`;

// Mutation 7/14: UpdateRole
export const UPDATE_ROLE = gql`
  mutation UpdateRole($updateRoleId: ID!, $name: String!) {
    updateRole(id: $updateRoleId, name: $name) {
      id
      name
    }
  }
`;

// Mutation 8/14: DeleteRole
export const DELETE_ROLE = gql`
  mutation DeleteRole($deleteRoleId: ID!) {
    deleteRole(id: $deleteRoleId)
  }
`;
