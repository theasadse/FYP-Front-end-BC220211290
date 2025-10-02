import React from 'react'
import { Card, Row, Col, Statistic } from 'antd'
import { getMockStats } from '../services/mockApi'

export default function AdminDashboard() {
  const stats = getMockStats()
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Activities" value={stats.totalActivities} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Pending Tickets" value={stats.pendingTickets} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Reports Generated" value={stats.reports} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
