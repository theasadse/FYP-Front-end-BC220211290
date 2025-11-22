import React from "react";
import {
  Card,
  Row,
  Col,
  List,
  Avatar,
  Tag,
  Spin,
  Typography,
  Statistic,
  Badge,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { ME } from "../graphql/operations/auth";
import { GET_ACTIVITIES } from "../graphql/operations/activities";

const { Title, Text } = Typography;

/**
 * User Dashboard page component.
 * Displays a personalized dashboard for the logged-in user.
 *
 * Capabilities:
 * - Shows a welcome banner with user details.
 * - Displays statistics on completed and pending activities.
 * - Lists the user's recent activities.
 *
 * @returns {JSX.Element} The rendered User Dashboard.
 */
export default function UserDashboard() {
  const { data: userData, loading: userLoading } = useQuery(ME);
  const { data: activitiesData, loading: activitiesLoading } = useQuery(
    GET_ACTIVITIES,
    {
      variables: { userId: userData?.me?.id, limit: 10 },
      skip: !userData?.me?.id,
    }
  );

  const user = userData?.me;
  const activities = activitiesData?.getActivities || [];

  if (userLoading || activitiesLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" tip="Loading your dashboard..." />
      </div>
    );
  }

  const completedCount = activities.filter(
    (a: any) => a.status === "completed"
  ).length;
  const pendingCount = activities.filter(
    (a: any) => a.status === "pending"
  ).length;

  return (
    <div>
       <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ marginBottom: "8px" }}>User Dashboard</Title>
        <Text type="secondary">
          Track your progress and manage your daily tasks.
        </Text>
      </div>

      <Card
        style={{
          marginBottom: "24px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <Row align="middle" gutter={24}>
          <Col>
            <Avatar
              size={80}
              icon={<UserOutlined />}
              style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", border: "2px solid rgba(255,255,255,0.4)" }}
            />
          </Col>
          <Col flex="auto">
            <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 600 }}>
              Welcome back, {user?.name || "User"}!
            </Title>
            <div style={{ marginTop: 8 }}>
              <Tag color="rgba(0,0,0,0.2)" style={{ color: "white", border: "none" }}>{user?.role?.name?.toUpperCase() || "USER"}</Tag>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", marginLeft: 8 }}>
                {user?.email}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card
            hoverable
            style={{ borderRadius: "8px", height: "100%" }}
            bodyStyle={{ padding: "24px" }}
          >
            <Statistic
              title="Total Tasks"
              value={activities.length}
              prefix={<BarChartOutlined style={{ color: "#1890ff", backgroundColor: "#e6f7ff", padding: 8, borderRadius: "50%" }} />}
              valueStyle={{ fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            hoverable
            style={{ borderRadius: "8px", height: "100%" }}
            bodyStyle={{ padding: "24px" }}
          >
            <Statistic
              title="Completed"
              value={completedCount}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a", backgroundColor: "#f6ffed", padding: 8, borderRadius: "50%" }} />}
              valueStyle={{ fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            hoverable
            style={{ borderRadius: "8px", height: "100%" }}
            bodyStyle={{ padding: "24px" }}
          >
            <Statistic
              title="Pending"
              value={pendingCount}
              prefix={<ClockCircleOutlined style={{ color: "#faad14", backgroundColor: "#fffbe6", padding: 8, borderRadius: "50%" }} />}
              valueStyle={{ fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Your Recent Activities"
        style={{ borderRadius: "8px" }}
        headStyle={{ borderBottom: "1px solid #f0f0f0" }}
      >
        {activities.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <Text type="secondary">No activities found. Start by logging your first task!</Text>
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={activities}
            renderItem={(item: any) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<UserOutlined />}
                      style={{ backgroundColor: "#f0f2f5", color: "#1890ff" }}
                    />
                  }
                  title={
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Text strong>{item.type}</Text>
                      <Tag
                        color={
                          item.status === "completed"
                            ? "success"
                            : item.status === "pending"
                            ? "warning"
                            : "default"
                        }
                        bordered={false}
                      >
                        {item.status}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <Text type="secondary">
                        {new Date(item.timestamp).toLocaleString()}
                      </Text>
                      {item.metadata && (
                        <div style={{ marginTop: "4px" }}>
                          <Text style={{ fontSize: "12px", color: "#8c8c8c" }}>
                             Note: {typeof item.metadata === 'string' ? JSON.parse(item.metadata).note : item.metadata.note}
                          </Text>
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
  );
}
