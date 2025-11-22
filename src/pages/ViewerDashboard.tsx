import React from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  List,
  Spin,
  Typography,
  Tag,
} from "antd";
import {
  EyeOutlined,
  FileTextOutlined,
  BarChartOutlined,
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
    <div style={{ padding: "24px" }}>
      <Card
        style={{
          marginBottom: "24px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <Row align="middle" gutter={16}>
          <Col>
            <EyeOutlined style={{ fontSize: "48px", color: "#fff" }} />
          </Col>
          <Col flex="auto">
            <Title level={3} style={{ color: "#fff", margin: 0 }}>
              Viewer Dashboard
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: "16px" }}>
              Read-only access • View reports and activity summaries
            </Text>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card
            hoverable
            style={{ borderRadius: "8px" }}
            bodyStyle={{ padding: "24px" }}
          >
            <Statistic
              title="Total Activities"
              value={stats?.totalActivities || 0}
              prefix={<BarChartOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            hoverable
            style={{ borderRadius: "8px" }}
            bodyStyle={{ padding: "24px" }}
          >
            <Statistic
              title="Completed"
              value={stats?.completedActivities || 0}
              prefix={<FileTextOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            hoverable
            style={{ borderRadius: "8px" }}
            bodyStyle={{ padding: "24px" }}
          >
            <Statistic
              title="Total Reports"
              value={reports.length}
              prefix={<FileTextOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Recent Activities"
            style={{ borderRadius: "8px", height: "100%" }}
            headStyle={{ backgroundColor: "#fafafa", fontWeight: 600 }}
          >
            {activities.length === 0 ? (
              <Text type="secondary">No recent activities</Text>
            ) : (
              <List
                dataSource={activities}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <div>
                          {item.type}
                          {item.status && (
                            <Tag
                              color={
                                item.status === "completed"
                                  ? "success"
                                  : item.status === "pending"
                                  ? "warning"
                                  : "default"
                              }
                              style={{ marginLeft: "8px" }}
                            >
                              {item.status}
                            </Tag>
                          )}
                        </div>
                      }
                      description={
                        <Text type="secondary">
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
            headStyle={{ backgroundColor: "#fafafa", fontWeight: 600 }}
          >
            {reports.length === 0 ? (
              <Text type="secondary">No reports available</Text>
            ) : (
              <List
                dataSource={reports.slice(0, 5)}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <div>
                          <Tag color="blue">{item.type}</Tag>
                          {item.user?.name}
                        </div>
                      }
                      description={
                        <Text type="secondary">
                          {item.start_date && item.end_date
                            ? `${new Date(
                                item.start_date
                              ).toLocaleDateString()} - ${new Date(
                                item.end_date
                              ).toLocaleDateString()}`
                            : "Date not specified"}
                        </Text>
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
