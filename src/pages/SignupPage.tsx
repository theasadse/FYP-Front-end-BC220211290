import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Select, message } from 'antd'
import { useMutation, useQuery } from '@apollo/client'
import { REGISTER } from '../graphql/operations/auth'
import { useNavigate } from 'react-router-dom'

export default function SignupPage() {
  const [roles, setRoles] = useState<any[]>([])
  const navigate = useNavigate()

  const { data: rolesData } = useQuery('roles')
  useEffect(() => { if (rolesData) setRoles(rolesData) }, [rolesData])

  const [register, { loading }] = useMutation(REGISTER)
  const onFinish = async (vals: any) => {
    const res = await register({ input: vals })
    if (res.data) {
      message.success('Account created. Please sign in.')
      navigate('/login')
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 420 }}>
        <h2>Create Account</h2>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Full name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select options={roles.map((r) => ({ label: r.name, value: r.name }))} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Create account</Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
