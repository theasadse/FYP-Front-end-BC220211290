import React, { useState } from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  Empty,
  Progress,
  Space,
  List,
  Badge,
  Collapse,
  Tooltip,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { MY_ENROLLMENTS } from "../graphql/operations/student";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const gradeColor: Record<string, string> = {
  A: "green",
  "A-": "green",
  "B+": "cyan",
  B: "cyan",
  "B-": "blue",
  "C+": "geekblue",
  C: "geekblue",
  "C-": "purple",
  D: "orange",
  F: "red",
};

const assignmentStatusColor: Record<string, string> = {
  Active: "processing",
  Closed: "default",
  Graded: "success",
};

const priorityColor: Record<string, string> = {
  Low: "default",
  Normal: "processing",
  High: "warning",
  Urgent: "error",
};

/**
 * My Enrollments page — Student view.
 * Shows all courses the student is enrolled in with grades, attendance,
 * upcoming assignments, and recent announcements.
 */
export default function MyEnrollmentsPage() {
  const { data, loading } = useQuery(MY_ENROLLMENTS);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const enrollments = data?.myEnrollments || [];

  // Summary stats
  const totalCourses = enrollments.length;
  const avgAttendance =
    totalCourses > 0
      ? (
          enrollments.reduce(
            (sum: number, e: any) => sum + (e.attendance || 0),
            0,
          ) / totalCourses
        ).toFixed(1)
      : "0";
  const activeAssignments = enrollments.reduce(
    (sum: number, e: any) =>
      sum +
      (e.course?.assignments?.filter((a: any) => a.status === "Active")
        ?.length || 0),
    0,
  );

  const columns = [
    {
      title: "Course",
      key: "course",
      render: (_: any, r: any) => (
        <div>
          <Text strong>{r.course?.code}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.course?.title}
          </Text>
        </div>
      ),
    },
    {
      title: "Instructor",
      key: "instructor",
      width: 160,
      render: (_: any, r: any) => (
        <Space>
          <UserOutlined />
          {r.course?.instructor?.name || "Unassigned"}
        </Space>
      ),
    },
    {
      title: "Semester",
      key: "semester",
      width: 130,
      render: (_: any, r: any) => r.course?.semester || "—",
    },
    {
      title: "Credits",
      key: "credits",
      width: 80,
      align: "center" as const,
      render: (_: any, r: any) => r.course?.credits ?? "—",
    },
    {
      title: "Attendance",
      key: "attendance",
      width: 130,
      render: (_: any, r: any) => (
        <Tooltip title={`${r.attendance?.toFixed(1) ?? 0}%`}>
          <Progress
            percent={r.attendance ?? 0}
            size="small"
            status={r.attendance < 75 ? "exception" : "active"}
            format={(p) => `${p?.toFixed(0)}%`}
          />
        </Tooltip>
      ),
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      width: 80,
      align: "center" as const,
      render: (g: string) =>
        g ? (
          <Tag color={gradeColor[g] || "default"}>{g}</Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Enrolled",
      key: "enrolledAt",
      width: 120,
      render: (_: any, r: any) =>
        r.enrolledAt ? dayjs(r.enrolledAt).format("MMM D, YYYY") : "—",
    },
    {
      title: "Assignments",
      key: "assignments",
      width: 110,
      align: "center" as const,
      render: (_: any, r: any) => {
        const active =
          r.course?.assignments?.filter((a: any) => a.status === "Active")
            ?.length || 0;
        const total = r.course?.assignments?.length || 0;
        return (
          <Tooltip title={`${active} active / ${total} total`}>
            <Badge
              count={active}
              showZero
              style={{ backgroundColor: active > 0 ? "#faad14" : "#52c41a" }}
            >
              <Tag icon={<CheckCircleOutlined />}>{total}</Tag>
            </Badge>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          <BookOutlined style={{ marginRight: 8 }} />
          My Enrollments
        </Title>
        <Text type="secondary">
          View your enrolled courses, grades, attendance, and upcoming
          assignments.
        </Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Enrolled Courses"
              value={totalCourses}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Avg Attendance"
              value={avgAttendance}
              suffix="%"
              prefix={<ClockCircleOutlined />}
              valueStyle={{
                color: Number(avgAttendance) >= 75 ? "#3f8600" : "#cf1322",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Assignments"
              value={activeAssignments}
              prefix={<CalendarOutlined />}
              valueStyle={{
                color: activeAssignments > 0 ? "#faad14" : "#3f8600",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Enrollments Table */}
      <Card style={{ borderRadius: 8 }}>
        <Table
          dataSource={enrollments}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 900 }}
          expandable={{
            expandedRowKeys: expandedId ? [expandedId] : [],
            onExpand: (expanded, record) =>
              setExpandedId(expanded ? record.id : null),
            expandedRowRender: (record: any) => (
              <Row gutter={16}>
                {/* Course Details */}
                <Col xs={24} md={8}>
                  <Card size="small" title="Course Details" bordered={false}>
                    <Paragraph>
                      <Text strong>Schedule:</Text>{" "}
                      {record.course?.schedule || "N/A"}
                    </Paragraph>
                    <Paragraph>
                      <Text strong>Description:</Text>{" "}
                      {record.course?.description || "No description"}
                    </Paragraph>
                    <Paragraph>
                      <Text strong>Instructor Email:</Text>{" "}
                      {record.course?.instructor?.email || "N/A"}
                    </Paragraph>
                  </Card>
                </Col>

                {/* Assignments */}
                <Col xs={24} md={8}>
                  <Card
                    size="small"
                    title={`Assignments (${record.course?.assignments?.length || 0})`}
                    bordered={false}
                  >
                    {record.course?.assignments?.length > 0 ? (
                      <List
                        size="small"
                        dataSource={record.course.assignments}
                        renderItem={(a: any) => (
                          <List.Item>
                            <List.Item.Meta
                              title={a.title}
                              description={
                                <Space>
                                  <Tag color={assignmentStatusColor[a.status]}>
                                    {a.status}
                                  </Tag>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    Due:{" "}
                                    {dayjs(a.dueDate).format("MMM D, YYYY")}
                                  </Text>
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No assignments"
                      />
                    )}
                  </Card>
                </Col>

                {/* Announcements */}
                <Col xs={24} md={8}>
                  <Card
                    size="small"
                    title={`Announcements (${record.course?.announcements?.length || 0})`}
                    bordered={false}
                  >
                    {record.course?.announcements?.length > 0 ? (
                      <List
                        size="small"
                        dataSource={record.course.announcements.slice(0, 5)}
                        renderItem={(a: any) => (
                          <List.Item>
                            <List.Item.Meta
                              title={
                                <Space>
                                  <NotificationOutlined />
                                  {a.title}
                                </Space>
                              }
                              description={
                                <Space>
                                  <Tag color={priorityColor[a.priority]}>
                                    {a.priority}
                                  </Tag>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    {dayjs(a.createdAt).format("MMM D, YYYY")}
                                  </Text>
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No announcements"
                      />
                    )}
                  </Card>
                </Col>
              </Row>
            ),
          }}
        />
      </Card>
    </div>
  );
}
