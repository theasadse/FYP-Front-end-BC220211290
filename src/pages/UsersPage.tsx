import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, Popconfirm, message } from 'antd'
import { useQuery, useMutation } from '@apollo/client'
import { USERS, CREATE_USER, UPDATE_USER, DELETE_USER } from '../graphql/operations/users'

export default function UsersPage() {
  const [data, setData] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const { data: usersData, loading } = useQuery(USERS)
  const { data: rolesData } = useQuery('roles')
  const [visible, setVisible] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    if (usersData) setData(usersData)
  }, [usersData])

  useEffect(() => {
    if (rolesData) setRoles(rolesData)
  }, [rolesData])

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

  const [deleteUserMut] = useMutation(DELETE_USER)
  async function onDelete(id: string) {
    await deleteUserMut({ id })
    message.success('User deleted')
    // refresh: rely on query hook to re-run (not implemented) so re-query manually by reloading
    window.location.reload()
  }

  const [createUserMut] = useMutation(CREATE_USER)
  const [updateUserMut] = useMutation(UPDATE_USER)
  async function onOk() {
    const vals = await form.validateFields()
    if (editing) {
      await updateUserMut({ id: editing.id, input: vals })
      message.success('User updated')
    } else {
      await createUserMut({ input: { ...vals, email: vals.username } })
      message.success('User created')
    }
    setVisible(false)
    window.location.reload()
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
