import { gql } from '@apollo/client'

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user { id name email role { id name } createdAt }
    }
  }
`

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user { id name email role { id name } createdAt }
    }
  }
`
