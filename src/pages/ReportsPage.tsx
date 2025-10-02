import React, { useEffect, useState } from 'react'
import { Button, Card, List } from 'antd'
import { useQuery, useMutation } from '@apollo/client'
import { ACTIVITIES } from '../graphql/operations/activities'
import { REPORTS } from '../graphql/operations/reports'

export default function ReportsPage() {
  const [activities, setActivities] = useState<any[]>([])
  const { data: activitiesData } = useQuery(ACTIVITIES)
  const [exportMut] = useMutation('exportActivities')

  useEffect(() => { if (activitiesData) setActivities(activitiesData) }, [activitiesData])

  async function onExport() {
    const raw = await exportMut()
    const payload = typeof raw === 'string' ? raw : JSON.stringify(raw.data ?? raw)
    const blob = new Blob([payload], { type: 'application/json' })
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
