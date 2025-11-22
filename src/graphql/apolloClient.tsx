/**
 * Apollo Client configuration.
 *
 * This file sets up the Apollo Client for making GraphQL requests and subscriptions.
 * It includes:
 * 1. An HTTP link pointing to the GraphQL server.
 * 2. A WebSocket link for subscriptions.
 * 3. An authentication link that adds the Bearer token from localStorage to the headers.
 * 4. A split link to route traffic to HTTP or WebSocket based on the operation type.
 * 5. An in-memory cache for caching GraphQL results.
 *
 * @module ApolloClient
 */

import { ApolloClient, InMemoryCache, createHttpLink, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

/**
 * HTTP link for GraphQL operations.
 * Points to the backend GraphQL endpoint.
 */
const httpLink = createHttpLink({
  uri: "https://monkfish-app-me2i3.ondigitalocean.app/graphql",
  credentials: "include",
});

/**
 * WebSocket link for GraphQL subscriptions.
 * Points to the backend GraphQL subscription endpoint.
 * Uses graphql-ws protocol.
 */
const wsLink = new GraphQLWsLink(
  createClient({
    url: "wss://monkfish-app-me2i3.ondigitalocean.app/graphql",
    connectionParams: () => {
      try {
        const raw = localStorage.getItem("fyp_auth");
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return {
          Authorization: parsed?.token ? `Bearer ${parsed.token}` : "",
        };
      } catch (e) {
        return {};
      }
    },
  })
);

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
 * Split link that routes to the WebSocket link for subscriptions
 * and the HTTP link (with auth) for queries and mutations.
 */
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

/**
 * The configured Apollo Client instance.
 * Uses the split link and an in-memory cache.
 */
const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default apolloClient;
