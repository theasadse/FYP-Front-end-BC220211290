import { gql } from '@apollo/client'

export const ROLES = gql`query Roles { roles { id name } }`
export const CREATE_ROLE = gql`mutation CreateRole($input: RoleInput!) { createRole(input: $input) { id name } }`
export const DELETE_ROLE = gql`mutation DeleteRole($id: Int!) { deleteRole(id: $id) { id } }`
