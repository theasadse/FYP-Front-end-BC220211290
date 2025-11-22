/**
 * Apollo Client configuration.
 *
 * This file sets up the Apollo Client for making GraphQL requests.
 * It includes:
 * 1. An HTTP link pointing to the GraphQL server.
 * 2. An authentication link that adds the Bearer token from localStorage to the headers.
 * 3. An in-memory cache for caching GraphQL results.
 *
 * @module ApolloClient
 */

import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

/**
 * HTTP link for GraphQL operations.
 * Points to the backend GraphQL endpoint.
 */
const httpLink = createHttpLink({
  uri: "https://monkfish-app-me2i3.ondigitalocean.app/graphql",
  credentials: "include",
});

/**
 * Authentication middleware link.
 * Intercepts requests to inject the Authorization header if a token exists in localStorage.
 */
const authLink = setContext(
  (_: any, { headers }: { headers?: Record<string, string> } = {}) => {
    try {
      const raw = localStorage.getItem("fyp_auth");
      if (!raw) return { headers };
      const parsed = JSON.parse(raw);
      const token = parsed?.token;
      return {
        headers: { ...headers, Authorization: token ? `Bearer ${token}` : "" },
      };
    } catch (e) {
      return { headers };
    }
  }
);

/**
 * The configured Apollo Client instance.
 * Uses the combined auth and http links, and an in-memory cache.
 */
const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default apolloClient;
