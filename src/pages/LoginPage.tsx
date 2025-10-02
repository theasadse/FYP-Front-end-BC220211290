import React from 'react'
import { Card, Button, Space, Typography } from 'antd'
import { useAuth } from '../contexts/auth'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const onLogin = async (role: 'admin' | 'user' | 'viewer') => {
    await login(role)
    navigate(`/${role}`)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ width: 360, textAlign: 'center' }}>
        <Title level={4}>FYP Admin Panel — Login</Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button type="primary" onClick={() => onLogin('admin')}>Login as Admin</Button>
          <Button onClick={() => onLogin('user')}>Login as User</Button>
          <Button onClick={() => onLogin('viewer')}>Login as Viewer</Button>
        </Space>
      </Card>
    </div>
  )
}
