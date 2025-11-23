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
 * A wrapper component that enforces authentication-based access control for routes.
 * It checks if the user is authenticated only.
 * Role-based module visibility will be implemented at the component level.
 * If not authenticated, it redirects to the login page.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render if access is granted.
 * @returns {React.ReactNode} The rendered children or a Navigate component for redirection.
 */
function PrivateRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

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
                <PrivateRoute>
                  <MainLayout>
                    <AdminDashboard />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <UsersPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/activities"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <ActivitiesPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/reports"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <ReportsPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/roles"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <RolesPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/user/*"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <UserDashboard />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/viewer/*"
              element={
                <PrivateRoute>
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
