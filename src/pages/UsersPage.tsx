import React, { useEffect, useState } from 'react'
import { listUsers, createUser, updateUser, deleteUser, listRoles } from '../graphql/mockSchema'
import { Table, Button, Modal, Form, Input, Select, Popconfirm, message } from 'antd'

export default function UsersPage() {
  const [data, setData] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form] = Form.useForm()

  async function load() {
    setLoading(true)
    const [u, r] = await Promise.all([listUsers(), listRoles()])
    setData(u)
    setRoles(r)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function onAdd() {
    setEditing(null)
    form.resetFields()
    setVisible(true)
  }

  function onEdit(record: any) {
    setEditing(record)
    form.setFieldsValue(record)
    setVisible(true)
  }

  async function onDelete(id: string) {
    await deleteUser(id)
    message.success('User deleted')
    load()
  }

  async function onOk() {
    const vals = await form.validateFields()
    if (editing) {
      await updateUser(editing.id, vals)
      message.success('User updated')
    } else {
      await createUser(vals)
      message.success('User created')
    }
    setVisible(false)
    load()
  }

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Username', dataIndex: 'username' },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Role', dataIndex: 'role' },
    {
      title: 'Actions',
      render: (_: any, record: any) => (
        <>
          <Button type="link" onClick={() => onEdit(record)}>
            Edit
          </Button>
          <Popconfirm title="Delete user?" onConfirm={() => onDelete(record.id)}>
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </>
      )
    }
  ]

  return (
    <div>
      <h2>Manage Users</h2>
      <Button type="primary" style={{ marginBottom: 12 }} onClick={onAdd}>
        New User
      </Button>
      <Table rowKey="id" dataSource={data} columns={columns} loading={loading} />

      <Modal title={editing ? 'Edit User' : 'New User'} open={visible} onOk={onOk} onCancel={() => setVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select options={roles.map((r) => ({ label: r.name, value: r.name }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
