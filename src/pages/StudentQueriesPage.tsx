import React, { useState } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Select,
  Space,
  Modal,
  Form,
  Input,
  Typography,
  message,
  List,
  Popconfirm,
  Empty,
  Spin,
  Divider,
  Badge,
} from "antd";
import {
  QuestionCircleOutlined,
  SendOutlined,
  CloseCircleOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import {
  COURSE_STUDENT_QUERIES,
  RESPOND_TO_QUERY,
  CLOSE_QUERY,
  NEW_STUDENT_QUERY,
  MY_COURSES,
} from "../graphql/operations/instructor";
import { useSearchParams } from "react-router-dom";
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
};

/**
 * Student Queries management page.
 * Instructors can view, respond to, and close student queries per course.
 */
export default function StudentQueriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const courseId = searchParams.get("courseId") || "";
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );
  const [respondingTo, setRespondingTo] = useState<any>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: coursesData } = useQuery(MY_COURSES);
  const courses = coursesData?.myCourses || [];

  const { data, loading, refetch } = useQuery(COURSE_STUDENT_QUERIES, {
    variables: { courseId, status: statusFilter },
    skip: !courseId,
  });

  const [respondToQuery, { loading: responding }] =
    useMutation(RESPOND_TO_QUERY);
  const [closeQuery] = useMutation(CLOSE_QUERY);

  // Real-time subscription for new queries
  useSubscription(NEW_STUDENT_QUERY, {
    variables: { courseId: courseId || undefined },
    onData: ({ data: subData }: any) => {
      if (subData?.data?.newStudentQuery) {
        messageApi.info(
          `New query: "${subData.data.newStudentQuery.subject}" from ${subData.data.newStudentQuery.student?.name}`,
        );
        refetch();
      }
    },
  });

  const queries = data?.courseStudentQueries || [];

  const handleRespond = async () => {
    try {
      const values = await form.validateFields();
      await respondToQuery({
        variables: {
          input: {
            queryId: respondingTo.id,
            message: values.message,
          },
        },
      });
      messageApi.success("Response sent successfully");
      setRespondingTo(null);
      form.resetFields();
      refetch();
    } catch (err: any) {
      messageApi.error(err.message || "Failed to respond");
    }
  };

  const handleClose = async (id: string) => {
    try {
      await closeQuery({ variables: { id } });
      messageApi.success("Query closed");
      refetch();
    } catch (err: any) {
      messageApi.error(err.message || "Failed to close query");
    }
  };

  const columns = [
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      render: (text: string, record: any) => (
        <Button
          type="link"
          onClick={() => setRespondingTo(record)}
          style={{ padding: 0 }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: "Student",
      key: "student",
      width: 150,
      render: (_: any, r: any) => r.student?.name || "—",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (c: string) => <Tag>{c}</Tag>,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (p: string) => <Tag color={priorityColor[p]}>{p}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (s: string) => <Tag color={statusColor[s]}>{s}</Tag>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (d: string) => dayjs(d).format("MMM D, YYYY"),
      sorter: (a: any, b: any) =>
        dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: "Responses",
      key: "responses",
      width: 100,
      align: "center" as const,
      render: (_: any, r: any) => (
        <Badge
          count={r.responses?.length ?? 0}
          showZero
          style={{ backgroundColor: "#1890ff" }}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            icon={<MessageOutlined />}
            onClick={() => setRespondingTo(record)}
            disabled={record.status === "Closed"}
          >
            Reply
          </Button>
          {record.status !== "Closed" && (
            <Popconfirm
              title="Close this query?"
              onConfirm={() => handleClose(record.id)}
            >
              <Button size="small" danger icon={<CloseCircleOutlined />}>
                Close
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          <QuestionCircleOutlined style={{ marginRight: 8 }} />
          Student Queries
        </Title>
        <Text type="secondary">
          View and respond to student questions for your courses.
        </Text>
      </div>

      {/* Filters */}
      <Card style={{ borderRadius: 8, marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="Select Course"
            value={courseId || undefined}
            onChange={(v) => setSearchParams({ courseId: v })}
            style={{ width: 300 }}
            options={courses.map((c: any) => ({
              value: c.id,
              label: `${c.code} — ${c.title}`,
            }))}
          />
          <Select
            placeholder="Filter by Status"
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
            options={[
              { value: "Open", label: "Open" },
              { value: "Answered", label: "Answered" },
              { value: "Closed", label: "Closed" },
            ]}
          />
        </Space>
      </Card>

      {!courseId ? (
        <Card style={{ borderRadius: 8 }}>
          <Empty description="Select a course to view student queries" />
        </Card>
      ) : (
        <Card style={{ borderRadius: 8 }}>
          <Table
            dataSource={queries}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 900 }}
          />
        </Card>
      )}

      {/* Respond/View Query Modal */}
      <Modal
        title={
          respondingTo ? (
            <>
              <QuestionCircleOutlined /> {respondingTo.subject}
            </>
          ) : (
            "Query"
          )
        }
        open={!!respondingTo}
        onCancel={() => {
          setRespondingTo(null);
          form.resetFields();
        }}
        footer={
          respondingTo?.status !== "Closed"
            ? [
                <Button key="cancel" onClick={() => setRespondingTo(null)}>
                  Cancel
                </Button>,
                <Button
                  key="send"
                  type="primary"
                  icon={<SendOutlined />}
                  loading={responding}
                  onClick={handleRespond}
                >
                  Send Response
                </Button>,
              ]
            : [
                <Button key="close" onClick={() => setRespondingTo(null)}>
                  Close
                </Button>,
              ]
        }
        width={640}
      >
        {respondingTo && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Tag color={statusColor[respondingTo.status]}>
                  {respondingTo.status}
                </Tag>
                <Tag color={priorityColor[respondingTo.priority]}>
                  {respondingTo.priority}
                </Tag>
                <Tag>{respondingTo.category}</Tag>
              </Space>
              <Paragraph style={{ marginTop: 12 }}>
                <Text strong>From:</Text> {respondingTo.student?.name} (
                {respondingTo.student?.email})
              </Paragraph>
              <Paragraph style={{ marginTop: 4 }}>
                <Text strong>Course:</Text> {respondingTo.course?.code} —{" "}
                {respondingTo.course?.title}
              </Paragraph>
              <Paragraph style={{ marginTop: 4 }}>
                <Text strong>Date:</Text>{" "}
                {dayjs(respondingTo.createdAt).format("MMMM D, YYYY h:mm A")}
              </Paragraph>
            </div>

            <Card
              size="small"
              style={{ marginBottom: 16, backgroundColor: "#fafafa" }}
            >
              <Text>{respondingTo.message}</Text>
            </Card>

            {/* Existing Responses */}
            {respondingTo.responses?.length > 0 && (
              <>
                <Divider orientation="left" plain>
                  Responses ({respondingTo.responses.length})
                </Divider>
                <List
                  size="small"
                  dataSource={respondingTo.responses}
                  renderItem={(r: any) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {r.instructor?.name} ·{" "}
                            {dayjs(r.createdAt).fromNow()}
                          </Text>
                        }
                        description={r.message}
                      />
                    </List.Item>
                  )}
                />
              </>
            )}

            {/* Reply Form */}
            {respondingTo.status !== "Closed" && (
              <>
                <Divider orientation="left" plain>
                  Your Response
                </Divider>
                <Form form={form} layout="vertical">
                  <Form.Item
                    name="message"
                    rules={[
                      { required: true, message: "Please enter your response" },
                    ]}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Type your response here..."
                    />
                  </Form.Item>
                </Form>
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
