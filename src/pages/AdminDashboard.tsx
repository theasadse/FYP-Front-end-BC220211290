import React, { useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Typography,
  Tag,
  message,
  Timeline,
  Progress,
  Skeleton,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  ArrowUpOutlined,
  NotificationOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { useQuery, useSubscription } from "@apollo/client";
import {
  GET_DASHBOARD_STATS,
  ACTIVITIES,
  NEW_ACTIVITY_LOGGED,
} from "../graphql/operations/activities";

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
  const {
    data,
    loading,
    error,
    refetch: refetchStats,
  } = useQuery(GET_DASHBOARD_STATS);
  const {
    data: activitiesData,
    loading: activitiesLoading,
    refetch: refetchActivities,
  } = useQuery(ACTIVITIES, {
    variables: { limit: 5 },
  });

  const [messageApi, contextHolder] = message.useMessage();

  // Real-time subscription for new activities
  const { data: subscriptionData } = useSubscription(NEW_ACTIVITY_LOGGED);

  useEffect(() => {
    if (subscriptionData?.newActivityLogged) {
      const newActivity = subscriptionData.newActivityLogged;
      messageApi.open({
        type: "info",
        content: `New Activity: ${newActivity.type} by ${newActivity.user?.name || "User"}`,
        icon: <NotificationOutlined style={{ color: "#108ee9" }} />,
        duration: 5,
      });
      // Refetch data to update the UI
      refetchStats();
      refetchActivities();
    }
  }, [subscriptionData, refetchStats, refetchActivities, messageApi]);

  const stats = data?.getDashboardStats;
  const recentActivities = activitiesData?.activities || [];
  const isLoading = loading || activitiesLoading;

  if (isLoading) {
    return (
      <div style={{ padding: "24px" }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Skeleton active paragraph={{ rows: 3 }} />
          </Col>
          <Col xs={24} lg={8}>
            <Skeleton active paragraph={{ rows: 3 }} />
          </Col>
          <Col xs={24} lg={8}>
            <Skeleton active paragraph={{ rows: 3 }} />
          </Col>
        </Row>
        <div style={{ marginTop: 24 }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
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

  return (
    <div>
      {contextHolder}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ marginBottom: "8px", margin: 0 }}>
          Admin Dashboard
        </Title>
        <Text type="secondary">
          Overview of system performance and recent events.
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
              prefix={
                <BarChartOutlined
                  style={{
                    color: "#1890ff",
                    backgroundColor: "#e6f7ff",
                    padding: 8,
                    borderRadius: "50%",
                  }}
                />
              }
              valueStyle={{ fontWeight: 600 }}
            />
            <div style={{ marginTop: 12 }}>
              <Text type="success">
                <ArrowUpOutlined /> 12%{" "}
              </Text>
              <Text type="secondary">vs last week</Text>
            </div>
            <Progress
              percent={70}
              showInfo={false}
              strokeColor="#1890ff"
              size="small"
              style={{ marginTop: 12 }}
            />
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
              prefix={
                <CheckCircleOutlined
                  style={{
                    color: "#52c41a",
                    backgroundColor: "#f6ffed",
                    padding: 8,
                    borderRadius: "50%",
                  }}
                />
              }
              valueStyle={{ fontWeight: 600 }}
            />
            <div style={{ marginTop: 12 }}>
              <Text type="success">
                <ArrowUpOutlined /> 5%{" "}
              </Text>
              <Text type="secondary">completion rate</Text>
            </div>
            <Progress
              percent={85}
              showInfo={false}
              strokeColor="#52c41a"
              size="small"
              style={{ marginTop: 12 }}
            />
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
              prefix={
                <ClockCircleOutlined
                  style={{
                    color: "#faad14",
                    backgroundColor: "#fffbe6",
                    padding: 8,
                    borderRadius: "50%",
                  }}
                />
              }
              valueStyle={{ fontWeight: 600 }}
            />
            <div style={{ marginTop: 12 }}>
              <Text type="warning">Requires attention</Text>
            </div>
            <Progress
              percent={30}
              showInfo={false}
              strokeColor="#faad14"
              size="small"
              style={{ marginTop: 12 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
        <Col xs={24} lg={14}>
          <Card
            title="Recent Activity Feed"
            extra={
              <Tag color="processing" icon={<NotificationOutlined />}>
                Live
              </Tag>
            }
            style={{ borderRadius: "8px", height: "100%" }}
          >
            <Timeline
              mode="left"
              items={recentActivities.map((item: any) => ({
                color: item.status === "completed" ? "green" : "blue",
                dot:
                  item.status === "completed" ? (
                    <CheckCircleOutlined />
                  ) : (
                    <ClockCircleOutlined />
                  ),
                children: (
                  <>
                    <Text strong>{item.type}</Text>{" "}
                    <Text type="secondary">by {item.user?.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(item.timestamp).toLocaleString()}
                    </Text>
                  </>
                ),
              }))}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title="Activity Distribution"
            style={{ borderRadius: "8px", height: "100%" }}
          >
            {stats?.perType?.map((item: any) => {
              const total = stats?.totalActivities || 1;
              const percent = (item.count / total) * 100;
              return (
                <div key={item.type} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <Text>{item.type}</Text>
                    <Text strong>{item.count}</Text>
                  </div>
                  <Progress
                    percent={parseFloat(percent.toFixed(1))}
                    size="small"
                  />
                </div>
              );
            })}
            {(!stats?.perType || stats.perType.length === 0) && (
              <div style={{ textAlign: "center", padding: 24 }}>
                <SmileOutlined style={{ fontSize: 24, color: "#ccc" }} />
                <p>No data available</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
