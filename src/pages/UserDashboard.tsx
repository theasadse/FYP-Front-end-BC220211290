import React from "react";
import {
  Card,
  Row,
  Col,
  Avatar,
  Tag,
  Typography,
  Statistic,
  Timeline,
  Progress,
  Button,
  Skeleton,
  Empty
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  PlusOutlined,
  ArrowRightOutlined
} from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { ME } from "../graphql/operations/auth";
import { GET_ACTIVITIES } from "../graphql/operations/activities";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

/**
 * User Dashboard page component.
 * Displays a personalized dashboard for the logged-in user.
 *
 * Capabilities:
 * - Shows a welcome banner with user details.
 * - Displays statistics on completed and pending activities.
 * - Lists the user's recent activities using a Timeline.
 * - Shows performance progress.
 *
 * @returns {JSX.Element} The rendered User Dashboard.
 */
export default function UserDashboard() {
  const navigate = useNavigate();
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
  const isLoading = userLoading || activitiesLoading;

  if (isLoading) {
    return (
      <div style={{ padding: "24px" }}>
        <Skeleton active avatar paragraph={{ rows: 2 }} />
        <div style={{ marginTop: 32 }}>
          <Skeleton.Button active size="large" block style={{ height: 100 }} />
        </div>
        <div style={{ marginTop: 32 }}>
           <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      </div>
    );
  }

  const completedCount = activities.filter(
    (a: any) => a.status === "completed"
  ).length;
  const pendingCount = activities.filter(
    (a: any) => a.status === "pending"
  ).length;
  const totalCount = activities.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div>
       <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Title level={2} style={{ marginBottom: "8px", margin: 0 }}>User Dashboard</Title>
          <Text type="secondary">
            Track your progress and manage your daily tasks.
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => { /* Placeholder for action */ }}>
            Quick Log
        </Button>
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
          <Col>
             <div style={{ textAlign: "right", color: "white" }}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Completion Rate</div>
                <div style={{ fontSize: 24, fontWeight: "bold" }}>{completionRate}%</div>
             </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Left Column: Stats & Performance */}
        <Col xs={24} lg={8}>
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card hoverable style={{ borderRadius: "8px" }} title="Overview">
                        <Row gutter={16}>
                             <Col span={12}>
                                <Statistic
                                    title="Total Tasks"
                                    value={totalCount}
                                    prefix={<BarChartOutlined style={{ color: "#1890ff" }} />}
                                />
                             </Col>
                             <Col span={12}>
                                <Statistic
                                    title="Pending"
                                    value={pendingCount}
                                    prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
                                />
                             </Col>
                        </Row>
                        <div style={{ marginTop: 24 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <Text>Task Completion</Text>
                                <Text>{completedCount} / {totalCount}</Text>
                            </div>
                            <Progress percent={completionRate} status="active" strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
                        </div>
                    </Card>
                </Col>
                <Col span={24}>
                    <Card hoverable style={{ borderRadius: "8px" }} title="Quick Actions">
                       <Button block icon={<PlusOutlined />} style={{ marginBottom: 12, textAlign: "left" }}>
                           Log Activity
                       </Button>
                       <Button block icon={<ArrowRightOutlined />} style={{ textAlign: "left" }} onClick={() => navigate('/admin/activities')}>
                           View All Activities
                       </Button>
                    </Card>
                </Col>
            </Row>
        </Col>

        {/* Right Column: Timeline */}
        <Col xs={24} lg={16}>
          <Card
            title="Recent Activity Timeline"
            style={{ borderRadius: "8px", height: "100%" }}
            headStyle={{ borderBottom: "1px solid #f0f0f0" }}
          >
            {activities.length === 0 ? (
              <Empty description="No activities found. Start working!" />
            ) : (
                <Timeline
                    mode="left"
                    items={activities.map((item: any) => ({
                        color: item.status === 'completed' ? 'green' : 'blue',
                        label: new Date(item.timestamp).toLocaleDateString(),
                        children: (
                            <>
                                <Text strong>{item.type}</Text>
                                <br/>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {new Date(item.timestamp).toLocaleTimeString()}
                                </Text>
                                {item.metadata && (
                                    <div style={{ marginTop: 4, background: "#f5f5f5", padding: "4px 8px", borderRadius: 4, fontSize: 12 }}>
                                        {typeof item.metadata === 'string' ? JSON.parse(item.metadata).note : item.metadata.note}
                                    </div>
                                )}
                            </>
                        )
                    }))}
                />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
