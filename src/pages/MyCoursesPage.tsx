import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Badge,
  Tabs,
  Table,
  List,
  Empty,
  Spin,
  Statistic,
  Space,
  Button,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  NotificationOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { MY_COURSES } from "../graphql/operations/instructor";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

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

/**
 * My Courses page for instructors.
 * Shows all courses assigned to the logged-in instructor with nested data tabs.
 */
export default function MyCoursesPage() {
  const { data, loading } = useQuery(MY_COURSES);
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const courses = data?.myCourses || [];
  const activeCourse =
    courses.find((c: any) => c.id === selectedCourse) || courses[0];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          <BookOutlined style={{ marginRight: 8 }} />
          My Courses
        </Title>
        <Text type="secondary">
          Courses assigned to you. Click a course to manage it.
        </Text>
      </div>

      {courses.length === 0 ? (
        <Card>
          <Empty description="No courses assigned to you yet." />
        </Card>
      ) : (
        <>
          {/* Course Cards Row */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {courses.map((course: any) => {
              const openQueries =
                course.studentQueries?.filter((q: any) => q.status === "Open")
                  .length ?? 0;
              const isSelected = activeCourse?.id === course.id;
              return (
                <Col xs={24} sm={12} lg={8} xl={6} key={course.id}>
                  <Card
                    hoverable
                    onClick={() => setSelectedCourse(course.id)}
                    style={{
                      borderRadius: 8,
                      border: isSelected ? "2px solid #1890ff" : undefined,
                      height: "100%",
                    }}
                    size="small"
                  >
                    <Tag color="blue" style={{ marginBottom: 8 }}>
                      {course.code}
                    </Tag>
                    <Title level={5} style={{ margin: 0 }} ellipsis>
                      {course.title}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {course.semester || "No semester"} · {course.credits}{" "}
                      credits
                    </Text>
                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <Badge
                        count={course.enrolledStudentCount}
                        showZero
                        style={{ backgroundColor: "#1890ff" }}
                      >
                        <Tag icon={<TeamOutlined />}>Students</Tag>
                      </Badge>
                      {openQueries > 0 && (
                        <Badge
                          count={openQueries}
                          style={{ backgroundColor: "#faad14" }}
                        >
                          <Tag icon={<QuestionCircleOutlined />}>Queries</Tag>
                        </Badge>
                      )}
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {/* Course Detail Tabs */}
          {activeCourse && (
            <Card
              title={
                <>
                  <Tag color="blue">{activeCourse.code}</Tag>{" "}
                  {activeCourse.title}
                </>
              }
              extra={
                <Text type="secondary">
                  {activeCourse.schedule || "No schedule"} ·{" "}
                  {activeCourse.semester || ""}
                </Text>
              }
              style={{ borderRadius: 8 }}
            >
              {activeCourse.description && (
                <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                  {activeCourse.description}
                </Paragraph>
              )}

              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Statistic
                    title="Students"
                    value={activeCourse.enrolledStudentCount}
                    prefix={<TeamOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Assignments"
                    value={activeCourse.assignments?.length ?? 0}
                    prefix={<FileTextOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Open Queries"
                    value={
                      activeCourse.studentQueries?.filter(
                        (q: any) => q.status === "Open",
                      ).length ?? 0
                    }
                    prefix={<QuestionCircleOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Announcements"
                    value={activeCourse.announcements?.length ?? 0}
                    prefix={<NotificationOutlined />}
                  />
                </Col>
              </Row>

              <Tabs
                defaultActiveKey="queries"
                items={[
                  {
                    key: "queries",
                    label: (
                      <span>
                        <QuestionCircleOutlined /> Student Queries{" "}
                        <Badge
                          count={
                            activeCourse.studentQueries?.filter(
                              (q: any) => q.status === "Open",
                            ).length
                          }
                          size="small"
                        />
                      </span>
                    ),
                    children: (
                      <div>
                        <Space style={{ marginBottom: 12 }}>
                          <Button
                            size="small"
                            type="primary"
                            onClick={() =>
                              navigate(
                                `/admin/queries?courseId=${activeCourse.id}`,
                              )
                            }
                          >
                            Manage Queries
                          </Button>
                        </Space>
                        {activeCourse.studentQueries?.length ? (
                          <List
                            size="small"
                            dataSource={activeCourse.studentQueries.slice(
                              0,
                              10,
                            )}
                            renderItem={(q: any) => (
                              <List.Item
                                extra={
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 11 }}
                                  >
                                    {dayjs(q.createdAt).fromNow()}
                                  </Text>
                                }
                              >
                                <List.Item.Meta
                                  title={
                                    <>
                                      <Text strong>{q.subject}</Text>{" "}
                                      <Tag color={statusColor[q.status]}>
                                        {q.status}
                                      </Tag>
                                      <Tag color={priorityColor[q.priority]}>
                                        {q.priority}
                                      </Tag>
                                    </>
                                  }
                                  description={`${q.student?.name || "Student"} · ${q.category}`}
                                />
                              </List.Item>
                            )}
                          />
                        ) : (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No student queries"
                          />
                        )}
                      </div>
                    ),
                  },
                  {
                    key: "assignments",
                    label: (
                      <span>
                        <FileTextOutlined /> Assignments
                      </span>
                    ),
                    children: (
                      <div>
                        <Space style={{ marginBottom: 12 }}>
                          <Button
                            size="small"
                            type="primary"
                            onClick={() =>
                              navigate(
                                `/admin/assignments?courseId=${activeCourse.id}`,
                              )
                            }
                          >
                            Manage Assignments
                          </Button>
                        </Space>
                        <Table
                          size="small"
                          dataSource={activeCourse.assignments || []}
                          rowKey="id"
                          pagination={false}
                          columns={[
                            {
                              title: "Title",
                              dataIndex: "title",
                              key: "title",
                            },
                            {
                              title: "Status",
                              dataIndex: "status",
                              key: "status",
                              render: (s: string) => (
                                <Tag color={statusColor[s]}>{s}</Tag>
                              ),
                            },
                            {
                              title: "Due Date",
                              dataIndex: "dueDate",
                              key: "dueDate",
                              render: (d: string) =>
                                d ? dayjs(d).format("MMM D, YYYY") : "—",
                            },
                            {
                              title: "Marks",
                              dataIndex: "totalMarks",
                              key: "totalMarks",
                              align: "center" as const,
                            },
                            {
                              title: "Submissions",
                              dataIndex: "submissions",
                              key: "submissions",
                              align: "center" as const,
                            },
                          ]}
                        />
                      </div>
                    ),
                  },
                  {
                    key: "enrollments",
                    label: (
                      <span>
                        <TeamOutlined /> Enrollments
                      </span>
                    ),
                    children: (
                      <div>
                        <Space style={{ marginBottom: 12 }}>
                          <Button
                            size="small"
                            type="primary"
                            onClick={() =>
                              navigate(
                                `/admin/enrollments?courseId=${activeCourse.id}`,
                              )
                            }
                          >
                            Manage Grades
                          </Button>
                        </Space>
                        <Table
                          size="small"
                          dataSource={activeCourse.enrollments || []}
                          rowKey="id"
                          pagination={false}
                          columns={[
                            {
                              title: "Student",
                              key: "student",
                              render: (_: any, r: any) =>
                                r.student?.name || "—",
                            },
                            {
                              title: "Grade",
                              dataIndex: "grade",
                              key: "grade",
                              render: (g: string) =>
                                g ? (
                                  <Tag color="blue">{g}</Tag>
                                ) : (
                                  <Tag>N/A</Tag>
                                ),
                            },
                            {
                              title: "Attendance",
                              dataIndex: "attendance",
                              key: "attendance",
                              render: (v: number) => `${(v ?? 0).toFixed(1)}%`,
                            },
                            {
                              title: "Enrolled",
                              dataIndex: "enrolledAt",
                              key: "enrolledAt",
                              render: (d: string) =>
                                d ? dayjs(d).format("MMM D, YYYY") : "—",
                            },
                          ]}
                        />
                      </div>
                    ),
                  },
                  {
                    key: "announcements",
                    label: (
                      <span>
                        <NotificationOutlined /> Announcements
                      </span>
                    ),
                    children: (
                      <div>
                        <Space style={{ marginBottom: 12 }}>
                          <Button
                            size="small"
                            type="primary"
                            onClick={() =>
                              navigate(
                                `/admin/announcements?courseId=${activeCourse.id}`,
                              )
                            }
                          >
                            Post Announcement
                          </Button>
                        </Space>
                        {activeCourse.announcements?.length ? (
                          <List
                            size="small"
                            dataSource={activeCourse.announcements}
                            renderItem={(a: any) => (
                              <List.Item>
                                <List.Item.Meta
                                  title={
                                    <>
                                      <Text strong>{a.title}</Text>{" "}
                                      <Tag color={priorityColor[a.priority]}>
                                        {a.priority}
                                      </Tag>
                                    </>
                                  }
                                  description={
                                    <>
                                      {a.content}
                                      <br />
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: 11 }}
                                      >
                                        by {a.instructor?.name} ·{" "}
                                        {dayjs(a.createdAt).fromNow()}
                                      </Text>
                                    </>
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
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
