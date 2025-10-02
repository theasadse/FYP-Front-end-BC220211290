import React from 'react'

// Lightweight shim so we don't need to install Apollo during early development.
// Replace this with a real Apollo Client and ApolloProvider when you wire a GraphQL server.

export const apolloClient = { dummy: true }

export const ApolloProvider: React.FC<{ client: any; children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

export default apolloClient
