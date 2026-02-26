import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * Represents a role in the system.
 */
type Role = {
  /** The unique identifier for the role. */
  id?: string;
  /** The name of the role (e.g., 'ADMIN', 'INSTRUCTOR'). */
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
  /** The user's role as a Role object returned by the API. */
  role: Role;
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
   * Function to set user and token directly (for GraphQL login/register).
   * @param user - The user object returned by login/register.
   * @param token - The JWT token.
   */
  setAuthData: (user: User, token: string) => void;
  /** Function to log out the current user. */
  logout: () => void;
  /** Indicates if an authentication operation is in progress. */
  isLoading: boolean;
  /** True while the initial localStorage read is still in progress — routes should not redirect yet. */
  isInitialising: boolean;
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
  const [isInitialising, setIsInitialising] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.user) {
          setUser(parsed.user);
          setToken(parsed.token);
        }
      }
    } catch (e) {
      console.error("Error loading auth from localStorage:", e);
    } finally {
      // Always mark initialisation complete so routes can render
      setIsInitialising(false);
    }
  }, []);

  /**
   * Clears the user session and removes data from localStorage.
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  /**
   * Sets user and token directly in state and localStorage.
   * Used for GraphQL-based login to immediately update context.
   *
   * @param {User} userData - The user object.
   * @param {string} tokenData - The authentication token.
   */
  const setAuthData = (userData: User, tokenData: string) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: userData, token: tokenData }),
    );
  };

  return (
    <AuthContext.Provider
      value={{ user, token, logout, setAuthData, isLoading, isInitialising, error }}
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
