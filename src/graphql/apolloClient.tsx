import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

/**
 * HTTP link for GraphQL operations.
 * Points to the backend GraphQL endpoint.
 */
const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
});

/**
 * WebSocket link for GraphQL subscriptions.
 * Points to the backend GraphQL subscription endpoint.
 * Uses graphql-ws protocol.
 */
const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000/graphql",
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
  }),
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
  },
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
  authLink.concat(httpLink),
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
