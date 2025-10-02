import React from 'react'
import { Card, Button, Form, Input, Typography, Alert } from 'antd'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/auth'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography

export default function LoginPage() {
  const { login, isLoading, error } = useAuth()
  const navigate = useNavigate()

  const onFinish = async (values: { username: string; password: string }) => {
    const res = await login(values.username, values.password)
    if (res.ok && res.user) {
      navigate(`/${res.user.role}`)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ width: 360 }}>
        <Title level={4} style={{ textAlign: 'center' }}>
          FYP Admin Panel — Login
        </Title>
        {error && <Alert type="error" message={error} style={{ marginBottom: 12 }} />}
  <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input your username' }]}
          >
            <Input placeholder="admin | user | viewer" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password' }]}
          >
            <Input.Password placeholder="password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              Sign in
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Link to="/signup">Create an account</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}
