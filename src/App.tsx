import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
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
 * Guards private routes — redirects to /login when not authenticated.
 * Preserves the intended destination so after login the user can be
 * sent back to where they were trying to go (future enhancement).
 */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitialising } = useAuth();

  // While localStorage is still being read, render nothing to avoid a
  // premature redirect to /login on hard refresh.
  if (isInitialising) return null;

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

/**
 * Guards public-only routes (Login, Signup).
 * Authenticated users are sent to /admin instead of seeing these pages.
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitialising } = useAuth();

  if (isInitialising) return null;

  if (user) return <Navigate to="/admin" replace />;

  return <>{children}</>;
}

/**
 * Wraps all /admin/* routes in a single parent so that exact sub-routes
 * (users, roles, activities, reports) are matched correctly and the
 * AdminDashboard only renders on the exact /admin path.
 */
function AdminRoutes() {
  return (
    <PrivateRoute>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </PrivateRoute>
  );
}

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <Layout style={{ minHeight: "100vh" }}>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              }
            />

            {/* Protected admin routes — nested so sub-paths match exactly */}
            <Route path="/admin" element={<AdminRoutes />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="activities" element={<ActivitiesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="roles" element={<RolesPage />} />
            </Route>

            {/* Other role dashboards */}
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

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch-all — send unknown paths to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </ApolloProvider>
  );
}

