import React, { useEffect, useState } from 'react'
import { listActivities, exportActivitiesJSON } from '../services/mockApi'
import { Button, Card, List } from 'antd'

export default function ReportsPage() {
  const [activities, setActivities] = useState<any[]>([])

  async function load() {
    const a = await listActivities()
    setActivities(a)
  }

  useEffect(() => { load() }, [])

  async function onExport() {
    const blob = new Blob([await exportActivitiesJSON()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'activities.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h2>Reports</h2>
      <Card style={{ marginBottom: 12 }}>
        <Button type="primary" onClick={onExport}>Export Activities (JSON)</Button>
      </Card>

      <List
        bordered
        dataSource={activities}
        renderItem={(item) => (
          <List.Item>
            {item.timestamp} — {item.activity} (Instructor: {item.instructor_id})
          </List.Item>
        )}
      />
    </div>
  )
}
