import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, message } from 'antd'
import { useQuery, useMutation } from '@apollo/client'
import { ACTIVITIES, LOG_ACTIVITY } from '../graphql/operations/activities'

export default function ActivitiesPage() {
  const [data, setData] = useState<any[]>([])
  const { data: activitiesData, loading } = useQuery(ACTIVITIES)
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => { if (activitiesData) setData(activitiesData) }, [activitiesData])

  const [logActivityMut] = useMutation(LOG_ACTIVITY)
  async function onOk() {
    const vals = await form.validateFields()
    await logActivityMut({ input: { userId: Number(vals.instructor_id), type: vals.activity, metadata: { note: vals['metadata.note'] } } })
    message.success('Activity logged')
    setVisible(false)
    window.location.reload()
  }

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Instructor ID', dataIndex: 'instructor_id' },
    { title: 'Activity', dataIndex: 'activity' },
    { title: 'Timestamp', dataIndex: 'timestamp' }
  ]

  return (
    <div>
      <h2>Activity Logs</h2>
      <Button type="primary" style={{ marginBottom: 12 }} onClick={() => setVisible(true)}>
        Log Activity
      </Button>
      <Table rowKey="id" dataSource={data} columns={columns} loading={loading} />

      <Modal title="Log Activity" open={visible} onOk={onOk} onCancel={() => setVisible(false)}>
        <Form form={form} layout="vertical" initialValues={{ activity: 'MDB Reply' }}>
          <Form.Item name="instructor_id" label="Instructor ID" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="activity" label="Activity" rules={[{ required: true }]}>
            <Select options={[{ label: 'MDB Reply', value: 'MDB Reply' }, { label: 'Assignment Upload', value: 'Assignment Upload' }, { label: 'Ticket Response', value: 'Ticket Response' }]} />
          </Form.Item>
          <Form.Item name="metadata.note" label="Note">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
