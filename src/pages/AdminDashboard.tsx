import React, { useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Tag,
  message,
  Table,
  List,
  Progress,
  Skeleton,
  Badge,
  Tooltip,
  Empty,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  NotificationOutlined,
  SmileOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useQuery, useSubscription } from "@apollo/client";
import {
  GET_DASHBOARD_STATS,
  NEW_ACTIVITY_LOGGED,
} from "../graphql/operations/activities";
import { INSTRUCTOR_DASHBOARD } from "../graphql/operations/instructor";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

/* ───────── helper maps ───────── */

const priorityColor: Record<string, string> = {
  Low: "default",
  Normal: "processing",
  High: "warning",
  Urgent: "error",
};

const statusColor: Record<string, string> = {
  Open: "warning",
  Answered: "processing",
  Closed: "default",
  Active: "success",
  Graded: "purple",
};

/* ───────── component ───────── */

/**
 * Instructor Dashboard page.
 *
 * Combines:
 * - `instructorDashboard` — top-level stats, course breakdown, recent queries, upcoming deadlines
 * - `getDashboardStats`   — activity-level stats & per-type distribution
 * - `newActivityLogged`   — real-time subscription for live toasts
 */
export default function AdminDashboard() {
  /* ---- data fetching ---- */
  const {
    data: instrData,
    loading: instrLoading,
    error: instrError,
    refetch: refetchInstr,
  } = useQuery(INSTRUCTOR_DASHBOARD);

  const {
    data: statsData,
    loading: statsLoading,
    refetch: refetchStats,
  } = useQuery(GET_DASHBOARD_STATS);

  const [messageApi, contextHolder] = message.useMessage();

  /* ---- real-time subscription ---- */
  const { data: subData } = useSubscription(NEW_ACTIVITY_LOGGED);

  useEffect(() => {
    if (subData?.newActivityLogged) {
      const a = subData.newActivityLogged;
      messageApi.open({
        type: "info",
        content: `New Activity: ${a.type} by ${a.user?.name || "User"}`,
        icon: <NotificationOutlined style={{ color: "#108ee9" }} />,
        duration: 5,
      });
      refetchInstr();
      refetchStats();
    }
  }, [subData, refetchInstr, refetchStats, messageApi]);

  /* ---- derived values ---- */
  const dash = instrData?.instructorDashboard;
  const stats = statsData?.getDashboardStats;
  const isLoading = instrLoading || statsLoading;

  /* ---- loading skeleton ---- */
  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Row gutter={[24, 24]}>
          {[1, 2, 3, 4, 5].map((k) => (
            <Col xs={24} sm={12} lg={k <= 4 ? 6 : 8} key={k}>
              <Skeleton active paragraph={{ rows: 2 }} />
            </Col>
          ))}
        </Row>
        <div style={{ marginTop: 24 }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    );
  }

  /* ---- error state ---- */
  if (instrError) {
    return (
      <div>
        <Title level={2}>Dashboard</Title>
        <Card>
          <Text type="danger">
            Error loading dashboard: {instrError.message}
          </Text>
        </Card>
      </div>
    );
  }

  /* ---- course breakdown table columns ---- */
  const courseColumns = [
    {
      title: "Course",
      dataIndex: "courseTitle",
      key: "courseTitle",
      render: (text: string, record: any) => (
        <>
          <Text strong>{record.courseCode}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {text}
          </Text>
        </>
      ),
    },
    {
      title: "Students",
      dataIndex: "studentCount",
      key: "studentCount",
      align: "center" as const,
      render: (v: number) => (
        <Badge count={v} showZero style={{ backgroundColor: "#1890ff" }} />
      ),
    },
    {
      title: "Open Queries",
      dataIndex: "openQueries",
      key: "openQueries",
      align: "center" as const,
      render: (v: number) =>
        v > 0 ? (
          <Badge count={v} style={{ backgroundColor: "#faad14" }} />
        ) : (
          <Tag color="success">0</Tag>
        ),
    },
    {
      title: "Avg Attendance",
      dataIndex: "averageAttendance",
      key: "averageAttendance",
      align: "center" as const,
      render: (v: number) => (
        <Progress
          type="circle"
          percent={parseFloat((v ?? 0).toFixed(1))}
          size={44}
          strokeColor={v >= 75 ? "#52c41a" : v >= 50 ? "#faad14" : "#ff4d4f"}
        />
      ),
    },
    {
      title: "Assignments Due",
      dataIndex: "assignmentsDue",
      key: "assignmentsDue",
      align: "center" as const,
      render: (v: number) =>
        v > 0 ? (
          <Tag icon={<ExclamationCircleOutlined />} color="volcano">
            {v}
          </Tag>
        ) : (
          <Tag color="default">0</Tag>
        ),
    },
  ];

  return (
    <div>
      {contextHolder}

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Instructor Dashboard
        </Title>
        <Text type="secondary">
          Overview of your courses, students, and activities.
        </Text>
      </div>

      {/* ── Top-level stat cards ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: 8, height: "100%" }}>
            <Statistic
              title="Total Courses"
              value={dash?.totalCourses ?? 0}
              prefix={
                <BookOutlined
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
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: 8, height: "100%" }}>
            <Statistic
              title="Total Students"
              value={dash?.totalStudents ?? 0}
              prefix={
                <TeamOutlined
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
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: 8, height: "100%" }}>
            <Statistic
              title="Open Queries"
              value={dash?.openQueries ?? 0}
              prefix={
                <QuestionCircleOutlined
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
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderRadius: 8, height: "100%" }}>
            <Statistic
              title="Pending Assignments"
              value={dash?.pendingAssignments ?? 0}
              prefix={
                <FileTextOutlined
                  style={{
                    color: "#eb2f96",
                    backgroundColor: "#fff0f6",
                    padding: 8,
                    borderRadius: "50%",
                  }}
                />
              }
              valueStyle={{ fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* ── Average Attendance + Activity Stats ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card
            style={{ borderRadius: 8, height: "100%", textAlign: "center" }}
          >
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 8 }}
            >
              Average Attendance
            </Text>
            <Progress
              type="dashboard"
              percent={parseFloat((dash?.averageAttendance ?? 0).toFixed(1))}
              strokeColor={
                (dash?.averageAttendance ?? 0) >= 75
                  ? "#52c41a"
                  : (dash?.averageAttendance ?? 0) >= 50
                    ? "#faad14"
                    : "#ff4d4f"
              }
              format={(p) => `${p}%`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable style={{ borderRadius: 8, height: "100%" }}>
            <Statistic
              title="Total Activities"
              value={stats?.totalActivities ?? 0}
              prefix={
                <BarChartOutlined
                  style={{
                    color: "#722ed1",
                    backgroundColor: "#f9f0ff",
                    padding: 8,
                    borderRadius: "50%",
                  }}
                />
              }
              valueStyle={{ fontWeight: 600 }}
            />
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <Tag icon={<CheckCircleOutlined />} color="success">
                {stats?.completedActivities ?? 0} done
              </Tag>
              <Tag icon={<ClockCircleOutlined />} color="warning">
                {stats?.pendingActivities ?? 0} pending
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={8}>
          <Card
            title="Activity Distribution"
            style={{ borderRadius: 8, height: "100%" }}
            bodyStyle={{ maxHeight: 200, overflowY: "auto" }}
          >
            {stats?.perType?.length ? (
              stats.perType.map((item: any) => {
                const total = stats.totalActivities || 1;
                const pct = (item.count / total) * 100;
                return (
                  <div key={item.type} style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 2,
                      }}
                    >
                      <Text style={{ fontSize: 12 }}>{item.type}</Text>
                      <Text strong style={{ fontSize: 12 }}>
                        {item.count}
                      </Text>
                    </div>
                    <Progress
                      percent={parseFloat(pct.toFixed(1))}
                      size="small"
                      showInfo={false}
                    />
                  </div>
                );
              })
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No activities yet"
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* ── Course Breakdown Table ── */}
      <Card
        title="Course Breakdown"
        style={{ borderRadius: 8, marginTop: 16 }}
        extra={
          <Tag color="blue">
            {dash?.courseBreakdown?.length ?? 0} course
            {(dash?.courseBreakdown?.length ?? 0) !== 1 ? "s" : ""}
          </Tag>
        }
      >
        <Table
          dataSource={dash?.courseBreakdown ?? []}
          columns={courseColumns}
          rowKey="courseId"
          pagination={false}
          size="middle"
          locale={{
            emptyText: <Empty description="No courses assigned yet" />,
          }}
        />
      </Card>

      {/* ── Recent Queries + Upcoming Deadlines ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Recent Student Queries */}
        <Col xs={24} lg={12}>
          <Card
            title="Recent Student Queries"
            style={{ borderRadius: 8, height: "100%" }}
            extra={
              <Tag color="processing" icon={<NotificationOutlined />}>
                Live
              </Tag>
            }
          >
            {dash?.recentQueries?.length ? (
              <List
                dataSource={dash.recentQueries}
                renderItem={(q: any) => (
                  <List.Item
                    extra={
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(q.createdAt).fromNow()}
                      </Text>
                    }
                  >
                    <List.Item.Meta
                      title={
                        <>
                          <Text strong>{q.subject}</Text>{" "}
                          <Tag
                            color={statusColor[q.status] || "default"}
                            style={{ marginLeft: 4 }}
                          >
                            {q.status}
                          </Tag>
                          <Tag
                            color={priorityColor[q.priority] || "default"}
                            style={{ marginLeft: 2 }}
                          >
                            {q.priority}
                          </Tag>
                        </>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {q.student?.name} &middot; {q.course?.code}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No recent queries"
              />
            )}
          </Card>
        </Col>

        {/* Upcoming Deadlines */}
        <Col xs={24} lg={12}>
          <Card
            title="Upcoming Deadlines"
            style={{ borderRadius: 8, height: "100%" }}
            extra={<CalendarOutlined />}
          >
            {dash?.upcomingDeadlines?.length ? (
              <List
                dataSource={dash.upcomingDeadlines}
                renderItem={(d: any) => {
                  const due = dayjs(d.dueDate);
                  const isOverdue = due.isBefore(dayjs());
                  return (
                    <List.Item
                      extra={
                        <Tooltip title={due.format("MMMM D, YYYY")}>
                          <Tag color={isOverdue ? "error" : "blue"}>
                            {isOverdue ? "Overdue" : due.fromNow()}
                          </Tag>
                        </Tooltip>
                      }
                    >
                      <List.Item.Meta
                        title={
                          <>
                            <Text strong>{d.title}</Text>{" "}
                            <Tag
                              color={statusColor[d.status] || "default"}
                              style={{ marginLeft: 4 }}
                            >
                              {d.status}
                            </Tag>
                          </>
                        }
                        description={
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {d.course?.code} &middot; {d.course?.title}
                          </Text>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No upcoming deadlines"
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
