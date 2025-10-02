import { gql } from '@apollo/client'

export const USERS = gql`query Users { users { id name email role { id name } createdAt } }`
export const USER = gql`query User($id: Int!) { user(id: $id) { id name email role { id name } createdAt } }`

export const CREATE_USER = gql`mutation CreateUser($input: RegisterInput!) { createUser(input: $input) { id name email role { id name } createdAt } }`
export const UPDATE_USER = gql`mutation UpdateUser($id: Int!, $input: UserInput!) { updateUser(id: $id, input: $input) { id name email role { id name } createdAt } }`
export const DELETE_USER = gql`mutation DeleteUser($id: Int!) { deleteUser(id: $id) { id } }`
