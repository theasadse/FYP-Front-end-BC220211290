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
  Empty,
  Divider,
  Badge,
} from "antd";
import {
  QuestionCircleOutlined,
  PlusOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import {
  MY_QUERIES,
  MY_ENROLLMENTS,
  SUBMIT_QUERY,
} from "../graphql/operations/student";
import { NEW_QUERY_RESPONSE } from "../graphql/operations/instructor";
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
 * My Queries page — Student view.
 * Students can view their submitted queries, see responses,
 * and submit new queries to courses they are enrolled in.
 */
export default function MyQueriesPage() {
  const [courseFilter, setCourseFilter] = useState<string | undefined>(
    undefined,
  );
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );
  const [viewingQuery, setViewingQuery] = useState<any>(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // Fetch student's enrolled courses (for course selector)
  const { data: enrollmentsData } = useQuery(MY_ENROLLMENTS);
  const enrolledCourses = (enrollmentsData?.myEnrollments || []).map(
    (e: any) => e.course,
  );

  // Fetch student's own queries
  const { data, loading, refetch } = useQuery(MY_QUERIES, {
    variables: {
      courseId: courseFilter || undefined,
      status: statusFilter || undefined,
    },
  });

  const [submitQuery, { loading: submitting }] = useMutation(SUBMIT_QUERY);

  // Real-time subscription for responses to student's queries
  // Listen for responses to the currently viewed query
  useSubscription(NEW_QUERY_RESPONSE, {
    variables: { queryId: viewingQuery?.id },
    skip: !viewingQuery?.id,
    onData: ({ data: subData }: any) => {
      if (subData?.data?.newQueryResponse) {
        messageApi.info("New response from instructor!");
        refetch();
        // Update the viewing query with the new response
        if (viewingQuery) {
          setViewingQuery((prev: any) => ({
            ...prev,
            responses: [
              ...(prev?.responses || []),
              subData.data.newQueryResponse,
            ],
            status: subData.data.newQueryResponse.query?.status || prev?.status,
          }));
        }
      }
    },
  });

  const queries = data?.myQueries || [];

  const handleSubmitQuery = async () => {
    try {
      const values = await form.validateFields();
      await submitQuery({
        variables: {
          input: {
            courseId: values.courseId,
            subject: values.subject,
            message: values.message,
            priority: values.priority || "Normal",
            category: values.category || "General",
          },
        },
      });
      messageApi.success("Query submitted successfully!");
      setSubmitModalOpen(false);
      form.resetFields();
      refetch();
    } catch (err: any) {
      messageApi.error(err.message || "Failed to submit query");
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
          onClick={() => setViewingQuery(record)}
          style={{ padding: 0 }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: "Course",
      key: "course",
      width: 160,
      render: (_: any, r: any) =>
        r.course ? `${r.course.code} — ${r.course.title}` : "—",
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
          style={{
            backgroundColor: r.responses?.length > 0 ? "#52c41a" : "#d9d9d9",
          }}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_: any, record: any) => (
        <Button
          size="small"
          icon={<MessageOutlined />}
          onClick={() => setViewingQuery(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <QuestionCircleOutlined style={{ marginRight: 8 }} />
            My Queries
          </Title>
          <Text type="secondary">
            View your submitted queries and ask new questions to your
            instructors.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setSubmitModalOpen(true)}
          disabled={enrolledCourses.length === 0}
        >
          Ask a Question
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ borderRadius: 8, marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="Filter by Course"
            allowClear
            value={courseFilter}
            onChange={setCourseFilter}
            style={{ width: 300 }}
            options={enrolledCourses.map((c: any) => ({
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

      {/* Queries Table */}
      <Card style={{ borderRadius: 8 }}>
        <Table
          dataSource={queries}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
          locale={{
            emptyText: (
              <Empty description="No queries yet. Ask your first question!" />
            ),
          }}
        />
      </Card>

      {/* View Query Detail Modal */}
      <Modal
        title={
          viewingQuery ? (
            <>
              <QuestionCircleOutlined /> {viewingQuery.subject}
            </>
          ) : (
            "Query"
          )
        }
        open={!!viewingQuery}
        onCancel={() => setViewingQuery(null)}
        footer={[
          <Button key="close" onClick={() => setViewingQuery(null)}>
            Close
          </Button>,
        ]}
        width={640}
      >
        {viewingQuery && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Tag color={statusColor[viewingQuery.status]}>
                  {viewingQuery.status}
                </Tag>
                <Tag color={priorityColor[viewingQuery.priority]}>
                  {viewingQuery.priority}
                </Tag>
                <Tag>{viewingQuery.category}</Tag>
              </Space>
              <Paragraph style={{ marginTop: 12 }}>
                <Text strong>Course:</Text> {viewingQuery.course?.code} —{" "}
                {viewingQuery.course?.title}
              </Paragraph>
              <Paragraph style={{ marginTop: 4 }}>
                <Text strong>Date:</Text>{" "}
                {dayjs(viewingQuery.createdAt).format("MMMM D, YYYY h:mm A")}
              </Paragraph>
            </div>

            {/* Your question */}
            <Card
              size="small"
              style={{ marginBottom: 16, backgroundColor: "#e6f7ff" }}
              title={<Text strong>Your Question</Text>}
            >
              <Text>{viewingQuery.message}</Text>
            </Card>

            {/* Instructor Responses */}
            {viewingQuery.responses?.length > 0 ? (
              <>
                <Divider orientation="left" plain>
                  Instructor Responses ({viewingQuery.responses.length})
                </Divider>
                <List
                  size="small"
                  dataSource={viewingQuery.responses}
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
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No responses yet. Your instructor will respond soon."
              />
            )}
          </>
        )}
      </Modal>

      {/* Submit Query Modal */}
      <Modal
        title="Ask a Question"
        open={submitModalOpen}
        onCancel={() => {
          setSubmitModalOpen(false);
          form.resetFields();
        }}
        onOk={handleSubmitQuery}
        confirmLoading={submitting}
        okText="Submit Query"
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="courseId"
            label="Course"
            rules={[{ required: true, message: "Please select a course" }]}
          >
            <Select
              placeholder="Select a course"
              options={enrolledCourses.map((c: any) => ({
                value: c.id,
                label: `${c.code} — ${c.title}`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="subject"
            label="Subject"
            rules={[
              { required: true, message: "Please enter a subject" },
              { max: 200, message: "Subject must be under 200 characters" },
            ]}
          >
            <Input placeholder="Brief summary of your question" />
          </Form.Item>
          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: "Please enter your question" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Describe your question in detail..."
            />
          </Form.Item>
          <Space style={{ width: "100%" }}>
            <Form.Item name="priority" label="Priority" initialValue="Normal">
              <Select
                style={{ width: 140 }}
                options={[
                  { value: "Low", label: "Low" },
                  { value: "Normal", label: "Normal" },
                  { value: "High", label: "High" },
                  { value: "Urgent", label: "Urgent" },
                ]}
              />
            </Form.Item>
            <Form.Item name="category" label="Category" initialValue="General">
              <Select
                style={{ width: 160 }}
                options={[
                  { value: "General", label: "General" },
                  { value: "Assignment", label: "Assignment" },
                  { value: "Exam", label: "Exam" },
                  { value: "Technical", label: "Technical" },
                  { value: "Other", label: "Other" },
                ]}
              />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
