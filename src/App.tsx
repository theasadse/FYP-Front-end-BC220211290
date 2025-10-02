import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import ViewerDashboard from './pages/ViewerDashboard'
import MainLayout from './components/MainLayout'
import { AuthProvider, useAuth } from './contexts/auth'

function PrivateRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
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
  )
}
