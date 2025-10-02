import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

// HTTP endpoint for GraphQL server — change to your real server URL when available
const httpLink = createHttpLink({ uri: '/graphql' })

// Attach Authorization header if token present in localStorage
const authLink = setContext((_: any, { headers }: { headers?: Record<string, string> } = {}) => {
  try {
    const raw = localStorage.getItem('fyp_auth')
    if (!raw) return { headers }
    const parsed = JSON.parse(raw)
    const token = parsed?.token
    return { headers: { ...headers, Authorization: token ? `Bearer ${token}` : '' } }
  } catch (e) {
    return { headers }
  }
})

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})

export default apolloClient
