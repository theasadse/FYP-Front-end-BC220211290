import { gql } from '@apollo/client'

// Query 9/11: Users
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
`

// Query 10/11: User (single)
export const USER = gql`
  query User($userId: ID!) {
    user(id: $userId) {
      id
      name
      email
      role {
        id
        name
      }
    }
  }
`

// Mutation 3/14: CreateUser
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
`

// Mutation 4/14: UpdateUser
export const UPDATE_USER = gql`
  mutation UpdateUser($updateUserId: ID!, $input: UpdateUserInput!) {
    updateUser(id: $updateUserId, input: $input) {
      id
      name
      email
      role {
        name
        id
      }
    }
  }
`

// Mutation 5/14: DeleteUser
export const DELETE_USER = gql`
  mutation DeleteUser($deleteUserId: ID!) {
    deleteUser(id: $deleteUserId)
  }
`
