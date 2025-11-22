import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "antd";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import ViewerDashboard from "./pages/ViewerDashboard";
import MainLayout from "./components/MainLayout";
import { AuthProvider, useAuth } from "./contexts/auth";
import UsersPage from "./pages/UsersPage";
import RolesPage from "./pages/RolesPage";
import SignupPage from "./pages/SignupPage";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "./graphql/apolloClient";
import ActivitiesPage from "./pages/ActivitiesPage";
import ReportsPage from "./pages/ReportsPage";

/**
 * A wrapper component that enforces role-based access control for routes.
 * It checks if the user is authenticated and if they have the required role.
 * If not authenticated or authorized, it redirects to the login page.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render if access is granted.
 * @param {string} [props.role] - The required role to access the route (e.g., 'admin', 'user', 'viewer').
 * @returns {React.ReactNode} The rendered children or a Navigate component for redirection.
 */
function PrivateRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: string;
}) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  // Handle both role as string and role as object
  const userRole = typeof user.role === "string" ? user.role : user.role?.name;

  if (role && userRole !== role) {
    console.log("Role mismatch:", { required: role, actual: userRole });
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * The main application component.
 * It sets up the global providers (ApolloProvider, AuthProvider) and the routing structure.
 *
 * The routing includes:
 * - Public routes: Login, Signup.
 * - Private routes: Admin, User, and Viewer areas, protected by the PrivateRoute component.
 * - Default redirect to login.
 *
 * @returns {JSX.Element} The root application element.
 */
export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <Layout style={{ minHeight: "100vh" }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route
              path="/admin/*"
              element={
                <PrivateRoute role="admin">
                  <MainLayout>
                    <AdminDashboard />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <PrivateRoute role="admin">
                  <MainLayout>
                    <UsersPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/activities"
              element={
                <PrivateRoute role="admin">
                  <MainLayout>
                    <ActivitiesPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/reports"
              element={
                <PrivateRoute role="admin">
                  <MainLayout>
                    <ReportsPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/roles"
              element={
                <PrivateRoute role="admin">
                  <MainLayout>
                    <RolesPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/user/*"
              element={
                <PrivateRoute role="user">
                  <MainLayout>
                    <UserDashboard />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/viewer/*"
              element={
                <PrivateRoute role="viewer">
                  <MainLayout>
                    <ViewerDashboard />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </ApolloProvider>
  );
}
