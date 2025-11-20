import { gql } from "@apollo/client";

// Query 5/11: Me (current user)
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

// Mutation 1/14: Register
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

// Mutation 2/14: Login
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
