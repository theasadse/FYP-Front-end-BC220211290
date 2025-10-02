import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Popconfirm, message } from 'antd'
import { useQuery, useMutation } from '@apollo/client'
import { ROLES, CREATE_ROLE, DELETE_ROLE } from '../graphql/operations/roles'

export default function RolesPage() {
  const [data, setData] = useState<any[]>([])
  const { data: rolesData, loading } = useQuery(ROLES)
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => { if (rolesData) setData(rolesData) }, [rolesData])

  const [createRoleMut] = useMutation(CREATE_ROLE)
  const [deleteRoleMut] = useMutation(DELETE_ROLE)
  async function onDelete(id: string) {
    await deleteRoleMut({ id })
    message.success('Role deleted')
    window.location.reload()
  }

  async function onOk() {
    const vals = await form.validateFields()
    await createRoleMut({ input: { name: vals.name } })
    message.success('Role created')
    setVisible(false)
    window.location.reload()
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
