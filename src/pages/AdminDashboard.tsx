import React from "react";
import { Card, Row, Col, Statistic, Table, Spin, Typography } from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { GET_DASHBOARD_STATS } from "../graphql/operations/activities";

const { Title } = Typography;

/**
 * Admin Dashboard page component.
 * Displays an overview of system activities using statistics and charts/tables.
 *
 * It fetches dashboard statistics using the `GET_DASHBOARD_STATS` GraphQL query.
 *
 * @returns {JSX.Element} The rendered Admin Dashboard.
 */
export default function AdminDashboard() {
  const { data, loading, error } = useQuery(GET_DASHBOARD_STATS);
  const stats = data?.getDashboardStats;

  if (loading) {
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
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Admin Dashboard</Title>
      <p style={{ color: "#8c8c8c", marginBottom: "24px" }}>
        Overview of system activities and statistics
      </p>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
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
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            style={{ borderRadius: "8px" }}
            bodyStyle={{ padding: "24px" }}
          >
            <Statistic
              title="Completed Activities"
              value={stats?.completedActivities || 0}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card
            hoverable
            style={{ borderRadius: "8px" }}
            bodyStyle={{ padding: "24px" }}
          >
            <Statistic
              title="Pending Activities"
              value={stats?.pendingActivities || 0}
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Activities by Type"
        style={{ marginTop: "24px", borderRadius: "8px" }}
        headStyle={{ backgroundColor: "#fafafa", fontWeight: 600 }}
      >
        <Table
          dataSource={stats?.perType || []}
          columns={typeColumns}
          rowKey="type"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
}
