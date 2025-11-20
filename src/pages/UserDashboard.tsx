import React from 'react'
import { Card, Row, Col, List, Avatar, Tag, Spin, Typography, Statistic } from 'antd'
import { UserOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/client'
import { ME } from '../graphql/operations/auth'
import { GET_ACTIVITIES } from '../graphql/operations/activities'

const { Title, Text } = Typography

export default function UserDashboard() {
  const { data: userData, loading: userLoading } = useQuery(ME)
  const { data: activitiesData, loading: activitiesLoading } = useQuery(GET_ACTIVITIES, {
    variables: { userId: userData?.me?.id, limit: 10 },
    skip: !userData?.me?.id
  })

  const user = userData?.me
  const activities = activitiesData?.getActivities || []

  if (userLoading || activitiesLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Loading your dashboard..." />
      </div>
    )
  }

  const completedCount = activities.filter((a: any) => a.status === 'completed').length
  const pendingCount = activities.filter((a: any) => a.status === 'pending').length

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        style={{ marginBottom: '24px', borderRadius: '8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        bodyStyle={{ padding: '32px' }}
      >
        <Row align="middle" gutter={16}>
          <Col>
            <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#fff', color: '#667eea' }} />
          </Col>
          <Col flex="auto">
            <Title level={3} style={{ color: '#fff', margin: 0 }}>
              Welcome back, {user?.name || 'User'}!
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px' }}>
              {user?.email} • {user?.role?.name || 'User'}
            </Text>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12}>
          <Card 
            hoverable
            style={{ borderRadius: '8px' }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic 
              title="Completed Activities" 
              value={completedCount}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card 
            hoverable
            style={{ borderRadius: '8px' }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic 
              title="Pending Activities" 
              value={pendingCount}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="Your Recent Activities" 
        style={{ borderRadius: '8px' }}
        headStyle={{ backgroundColor: '#fafafa', fontWeight: 600 }}
      >
        {activities.length === 0 ? (
          <Text type="secondary">No activities found</Text>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={activities}
            renderItem={(item: any) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                  title={
                    <div>
                      {item.type}
                      <Tag 
                        color={item.status === 'completed' ? 'success' : item.status === 'pending' ? 'warning' : 'default'}
                        style={{ marginLeft: '8px' }}
                      >
                        {item.status}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <Text type="secondary">{new Date(item.timestamp).toLocaleString()}</Text>
                      {item.metadata && (
                        <div style={{ marginTop: '4px' }}>
                          <Text style={{ fontSize: '12px' }}>{item.metadata}</Text>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}
