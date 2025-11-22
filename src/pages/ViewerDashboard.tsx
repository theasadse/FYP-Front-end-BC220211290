import React from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  List,
  Spin,
  Typography,
  Tag,
  Avatar
} from "antd";
import {
  EyeOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import {
  GET_DASHBOARD_STATS,
  ACTIVITIES,
} from "../graphql/operations/activities";
import { REPORTS } from "../graphql/operations/reports";

const { Title, Text } = Typography;

/**
 * Viewer Dashboard page component.
 * Displays a read-only dashboard for users with the 'viewer' role.
 *
 * Capabilities:
 * - Shows a welcome banner.
 * - Displays summary statistics (Total Activities, Completed, Total Reports).
 * - Lists recent activities (read-only).
 * - Lists available reports (read-only).
 *
 * @returns {JSX.Element} The rendered Viewer Dashboard.
 */
export default function ViewerDashboard() {
  const { data: statsData, loading: statsLoading } =
    useQuery(GET_DASHBOARD_STATS);
  const { data: activitiesData, loading: activitiesLoading } = useQuery(
    ACTIVITIES,
    {
      variables: { limit: 5 },
    }
  );
  const { data: reportsData, loading: reportsLoading } = useQuery(REPORTS);

  const stats = statsData?.getDashboardStats;
  const activities = activitiesData?.activities || [];
  const reports = reportsData?.reports || [];

  if (statsLoading || activitiesLoading || reportsLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ marginBottom: "8px" }}>Viewer Dashboard</Title>
        <Text type="secondary">
          Read-only access to system overview and reports.
        </Text>
      </div>

      <Card
        style={{
          marginBottom: "24px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          border: "none",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <Row align="middle" gutter={24}>
          <Col>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "50%", padding: 16 }}>
               <EyeOutlined style={{ fontSize: "40px", color: "#fff" }} />
            </div>
          </Col>
          <Col flex="auto">
            <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 600 }}>
              Viewer Access
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: "16px" }}>
              You have limited permissions to view activities and reports.
            </Text>
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
              title="Total Activities"
              value={stats?.totalActivities || 0}
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
              value={stats?.completedActivities || 0}
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
              title="Total Reports"
              value={reports.length}
              prefix={<FileTextOutlined style={{ color: "#722ed1", backgroundColor: "#f9f0ff", padding: 8, borderRadius: "50%" }} />}
              valueStyle={{ fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title="Recent Activities"
            style={{ borderRadius: "8px", height: "100%" }}
            headStyle={{ borderBottom: "1px solid #f0f0f0" }}
          >
            {activities.length === 0 ? (
              <Text type="secondary">No recent activities</Text>
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={activities}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar style={{ backgroundColor: "#f0f2f5", color: "#1890ff" }} icon={<BarChartOutlined />} />}
                      title={
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                           <Text strong>{item.type}</Text>
                           <Tag color={item.status === "completed" ? "success" : "default"}>{item.status}</Tag>
                        </div>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.timestamp
                            ? new Date(item.timestamp).toLocaleString()
                            : "N/A"}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Available Reports"
            style={{ borderRadius: "8px", height: "100%" }}
            headStyle={{ borderBottom: "1px solid #f0f0f0" }}
          >
            {reports.length === 0 ? (
              <Text type="secondary">No reports available</Text>
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={reports.slice(0, 5)}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar style={{ backgroundColor: "#f9f0ff", color: "#722ed1" }} icon={<FileTextOutlined />} />}
                      title={
                        <div>
                          <Text strong>{item.type.charAt(0).toUpperCase() + item.type.slice(1)} Report</Text>
                        </div>
                      }
                      description={
                        <div style={{ display: "flex", flexDirection: "column" }}>
                           <Text type="secondary" style={{ fontSize: 12 }}>User: {item.user?.name}</Text>
                           <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.start_date && item.end_date
                                ? `${new Date(item.start_date).toLocaleDateString()} - ${new Date(item.end_date).toLocaleDateString()}`
                                : "Date not specified"}
                           </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
