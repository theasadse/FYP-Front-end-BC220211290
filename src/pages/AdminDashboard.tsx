import React, { useEffect } from "react";
import { Card, Row, Col, Statistic, Table, Spin, Typography, List, Tag, Badge, message } from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  ArrowUpOutlined,
  NotificationOutlined
} from "@ant-design/icons";
import { useQuery, useSubscription } from "@apollo/client";
import { GET_DASHBOARD_STATS, ACTIVITIES, ACTIVITY_ADDED } from "../graphql/operations/activities";

const { Title, Text } = Typography;

/**
 * Admin Dashboard page component.
 * Displays an overview of system activities using statistics and charts/tables.
 *
 * It fetches dashboard statistics using the `GET_DASHBOARD_STATS` GraphQL query.
 * It also subscribes to `ACTIVITY_ADDED` to receive real-time updates.
 *
 * @returns {JSX.Element} The rendered Admin Dashboard.
 */
export default function AdminDashboard() {
  const { data, loading, error, refetch: refetchStats } = useQuery(GET_DASHBOARD_STATS);
  const { data: activitiesData, loading: activitiesLoading, refetch: refetchActivities } = useQuery(ACTIVITIES, {
    variables: { limit: 5 },
  });

  const [messageApi, contextHolder] = message.useMessage();

  // Real-time subscription for new activities
  const { data: subscriptionData } = useSubscription(ACTIVITY_ADDED);

  useEffect(() => {
    if (subscriptionData?.activityAdded) {
      const newActivity = subscriptionData.activityAdded;
      messageApi.open({
        type: 'info',
        content: `New Activity: ${newActivity.type} by ${newActivity.user?.name || 'User'}`,
        icon: <NotificationOutlined style={{ color: '#108ee9' }} />,
        duration: 5,
      });
      // Refetch data to update the UI
      refetchStats();
      refetchActivities();
    }
  }, [subscriptionData, refetchStats, refetchActivities, messageApi]);

  const stats = data?.getDashboardStats;
  const recentActivities = activitiesData?.activities || [];

  if (loading || activitiesLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" tip="Loading dashboard statistics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Admin Dashboard</h2>
        <Card>
          <p style={{ color: "#ff4d4f" }}>
            Error loading dashboard: {error.message}
          </p>
        </Card>
      </div>
    );
  }

  const typeColumns = [
    { title: "Activity Type", dataIndex: "type", key: "type" },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
      align: "right" as const,
      render: (count: number) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: "Percentage",
      key: "percentage",
      align: "right" as const,
      render: (_: any, record: any) => {
        const total = stats?.totalActivities || 1;
        const percent = ((record.count / total) * 100).toFixed(1);
        return <Text type="secondary">{percent}%</Text>;
      }
    }
  ];

  return (
    <div>
      {contextHolder}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ marginBottom: "8px" }}>Admin Dashboard</Title>
        <Text type="secondary">
          Welcome back. Here is an overview of the system status.
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            style={{ borderRadius: "8px", height: "100%" }}
            bodyStyle={{ padding: "24px" }}
          >
            <Statistic
              title="Total Activities"
              value={stats?.totalActivities || 0}
              prefix={<BarChartOutlined style={{ color: "#1890ff", backgroundColor: "#e6f7ff", padding: 8, borderRadius: "50%" }} />}
              valueStyle={{ fontWeight: 600 }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="success"><ArrowUpOutlined /> 12% </Text>
              <Text type="secondary">vs last week</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            style={{ borderRadius: "8px", height: "100%" }}
            bodyStyle={{ padding: "24px" }}
          >
            <Statistic
              title="Completed Tasks"
              value={stats?.completedActivities || 0}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a", backgroundColor: "#f6ffed", padding: 8, borderRadius: "50%" }} />}
              valueStyle={{ fontWeight: 600 }}
            />
             <div style={{ marginTop: 8 }}>
              <Text type="success"><ArrowUpOutlined /> 5% </Text>
              <Text type="secondary">completion rate</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            style={{ borderRadius: "8px", height: "100%" }}
            bodyStyle={{ padding: "24px" }}
          >
            <Statistic
              title="Pending Items"
              value={stats?.pendingActivities || 0}
              prefix={<ClockCircleOutlined style={{ color: "#faad14", backgroundColor: "#fffbe6", padding: 8, borderRadius: "50%" }} />}
              valueStyle={{ fontWeight: 600 }}
            />
             <div style={{ marginTop: 8 }}>
              <Text type="warning">Requires attention</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
        <Col xs={24} lg={14}>
          <Card
            title="Recent Activity Feed"
            extra={<Tag color="processing">Live Updates</Tag>}
            style={{ borderRadius: "8px", height: "100%" }}
            headStyle={{ borderBottom: "1px solid #f0f0f0" }}
          >
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<UserOutlined style={{ fontSize: 24, color: "#1890ff", background: "#f0f2f5", padding: 8, borderRadius: "50%" }} />}
                    title={
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Text strong>{item.type}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : "N/A"}
                        </Text>
                      </div>
                    }
                    description={
                      <div>
                         <Text>by {item.user?.name || "Unknown User"}</Text>
                         <div style={{ marginTop: 4 }}>
                           <Badge status={item.status === "completed" ? "success" : "processing"} text={item.status} />
                         </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title="Activities by Type"
            style={{ borderRadius: "8px", height: "100%" }}
            headStyle={{ borderBottom: "1px solid #f0f0f0" }}
          >
            <Table
              dataSource={stats?.perType || []}
              columns={typeColumns}
              rowKey="type"
              pagination={false}
              size="small"
              bordered={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
