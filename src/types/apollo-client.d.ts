declare module '@apollo/client' {
  import * as React from 'react'
  export const ApolloProvider: React.FC<{ client: any; children?: React.ReactNode }>
  export class ApolloClient<TCache = any> { constructor(opts: any); }
  export class InMemoryCache { constructor(opts?: any); }
  export function createHttpLink(opts: any): any
  export function gql(literals: any, ...placeholders: any[]): any
  export function useQuery(query: any, opts?: any): any
  export function useMutation(query: any, opts?: any): any
  export type NormalizedCacheObject = any
  export default ApolloClient
}

declare module '@apollo/client/link/context' {
  export function setContext(fn: any): any
}
