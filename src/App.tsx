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
