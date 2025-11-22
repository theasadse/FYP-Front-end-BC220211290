import React, { createContext, useContext, useEffect, useState } from "react";
import { authenticate } from "../services/mockApi";

/**
 * Represents a role in the system.
 */
type Role = {
  /** The unique identifier for the role. */
  id?: string;
  /** The name of the role (e.g., 'admin', 'user'). */
  name: string;
};

/**
 * Represents an authenticated user.
 */
type User = {
  /** The unique identifier for the user. */
  id: string;
  /** The full name of the user. */
  name: string;
  /** The email address of the user. */
  email?: string;
  /** The user's role, either as a string or a Role object. */
  role: Role | string;
  /** The username used for login. */
  username?: string;
};

/**
 * The shape of the AuthContext.
 */
type AuthContextType = {
  /** The currently authenticated user, or null if not logged in. */
  user: User | null;
  /** The authentication token, or null if not logged in. */
  token: string | null;
  /**
   * Function to log in a user.
   * @param username - The username to log in with.
   * @param password - The password to log in with.
   * @returns A promise resolving to an object indicating success or failure.
   */
  login: (
    username: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string; user?: User }>;
  /** Function to log out the current user. */
  logout: () => void;
  /** Indicates if an authentication operation is in progress. */
  isLoading: boolean;
  /** Error message if the last authentication operation failed. */
  error: string | null;
};

/**
 * Context for holding authentication state.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Key used to store authentication data in localStorage.
 */
const STORAGE_KEY = "fyp_auth";

/**
 * Provider component for the AuthContext.
 * Manages user state, login, and logout functionality.
 * Persists authentication state to localStorage.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child components that need access to the auth context.
 * @returns {JSX.Element} The provider component.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Handle both GraphQL response and mock API response
        if (parsed.user) {
          setUser(parsed.user);
          setToken(parsed.token);
        }
      }
    } catch (e) {
      console.error("Error loading auth from localStorage:", e);
    }
  }, []);

  /**
   * Authenticates a user against the mock API.
   * Updates state and localStorage upon success.
   *
   * @param {string} username - The username.
   * @param {string} password - The password.
   * @returns {Promise<{ ok: boolean; error?: string; user?: User }>} Result of the login attempt.
   */
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authenticate(username, password);
      if (!res.ok) {
        setError("Invalid credentials");
        setIsLoading(false);
        return { ok: false, error: "Invalid credentials" };
      }
      setUser(res.user);
      setToken(res.token ?? null);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: res.user, token: res.token ?? null })
      );
      setIsLoading(false);
      return { ok: true, user: res.user };
    } catch (e) {
      setError("Login failed");
      setIsLoading(false);
      return { ok: false, error: "Login failed" };
    }
  };

  /**
   * Clears the user session and removes data from localStorage.
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isLoading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to consume the AuthContext.
 *
 * @returns {AuthContextType} The authentication context value.
 * @throws {Error} If used outside of an AuthProvider.
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
