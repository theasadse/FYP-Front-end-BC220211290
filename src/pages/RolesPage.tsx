import React, { useEffect, useState } from 'react'
import { listRoles, createRole, deleteRole } from '../graphql/mockSchema'
import { Table, Button, Modal, Form, Input, Popconfirm, message } from 'antd'

export default function RolesPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()

  async function load() {
    setLoading(true)
    const r = await listRoles()
    setData(r)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function onDelete(id: string) {
    await deleteRole(id)
    message.success('Role deleted')
    load()
  }

  async function onOk() {
    const vals = await form.validateFields()
    await createRole(vals.name)
    message.success('Role created')
    setVisible(false)
    load()
  }

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Name', dataIndex: 'name' },
    {
      title: 'Actions',
      render: (_: any, record: any) => (
        <Popconfirm title="Delete role?" onConfirm={() => onDelete(record.id)}>
          <Button type="link" danger>
            Delete
          </Button>
        </Popconfirm>
      )
    }
  ]

  return (
    <div>
      <h2>Manage Roles</h2>
      <Button type="primary" style={{ marginBottom: 12 }} onClick={() => setVisible(true)}>
        New Role
      </Button>
      <Table rowKey="id" dataSource={data} columns={columns} loading={loading} />

      <Modal title="New Role" open={visible} onOk={onOk} onCancel={() => setVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Role Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
