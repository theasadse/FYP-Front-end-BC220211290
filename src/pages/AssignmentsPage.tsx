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
  InputNumber,
  DatePicker,
  Typography,
  message,
  Empty,
  Tooltip,
} from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation } from "@apollo/client";
import {
  COURSE_ASSIGNMENTS,
  CREATE_ASSIGNMENT,
  UPDATE_ASSIGNMENT,
  MY_COURSES,
} from "../graphql/operations/instructor";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const statusColor: Record<string, string> = {
  Active: "success",
  Closed: "default",
  Graded: "purple",
};

/**
 * Assignments management page.
 * Create, view, and update assignments per course.
 */
export default function AssignmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const courseId = searchParams.get("courseId") || "";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: coursesData } = useQuery(MY_COURSES);
  const courses = coursesData?.myCourses || [];

  const { data, loading, refetch } = useQuery(COURSE_ASSIGNMENTS, {
    variables: { courseId },
    skip: !courseId,
  });

  const [createAssignment, { loading: creating }] =
    useMutation(CREATE_ASSIGNMENT);
  const [updateAssignment, { loading: updating }] =
    useMutation(UPDATE_ASSIGNMENT);

  const handleCreate = () => {
    setEditing(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditing(record);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      dueDate: record.dueDate ? dayjs(record.dueDate) : null,
      totalMarks: record.totalMarks,
      status: record.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const dueDate = values.dueDate
        ? values.dueDate.format("YYYY-MM-DD")
        : undefined;

      if (editing) {
        await updateAssignment({
          variables: {
            id: editing.id,
            input: {
              title: values.title,
              description: values.description,
              dueDate,
              totalMarks: values.totalMarks,
              status: values.status,
            },
          },
        });
        messageApi.success("Assignment updated");
      } else {
        await createAssignment({
          variables: {
            input: {
              courseId,
              title: values.title,
              description: values.description,
              dueDate,
              totalMarks: values.totalMarks,
            },
          },
        });
        messageApi.success("Assignment created");
      }
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    } catch (err: any) {
      messageApi.error(err.message || "Operation failed");
    }
  };

  const assignments = data?.courseAssignments || [];

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (s: string) => <Tag color={statusColor[s]}>{s}</Tag>,
      filters: [
        { text: "Active", value: "Active" },
        { text: "Closed", value: "Closed" },
        { text: "Graded", value: "Graded" },
      ],
      onFilter: (value: any, record: any) => record.status === value,
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 140,
      render: (d: string) => {
        if (!d) return "—";
        const due = dayjs(d);
        const isOverdue = due.isBefore(dayjs());
        return (
          <Text type={isOverdue ? "danger" : undefined}>
            {due.format("MMM D, YYYY")}
          </Text>
        );
      },
      sorter: (a: any, b: any) =>
        dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix(),
    },
    {
      title: "Total Marks",
      dataIndex: "totalMarks",
      key: "totalMarks",
      width: 110,
      align: "center" as const,
    },
    {
      title: "Submissions",
      dataIndex: "submissions",
      key: "submissions",
      width: 110,
      align: "center" as const,
    },
    {
      title: "Course",
      key: "course",
      width: 100,
      render: (_: any, r: any) => (
        <Tag color="blue">{r.course?.code || "—"}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_: any, record: any) => (
        <Tooltip title="Edit">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Assignments
          </Title>
          <Text type="secondary">
            Create and manage assignments for your courses.
          </Text>
        </div>
        {courseId && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            New Assignment
          </Button>
        )}
      </div>

      <Card style={{ borderRadius: 8, marginBottom: 16 }}>
        <Select
          placeholder="Select Course"
          value={courseId || undefined}
          onChange={(v) => setSearchParams({ courseId: v })}
          style={{ width: 340 }}
          options={courses.map((c: any) => ({
            value: c.id,
            label: `${c.code} — ${c.title}`,
          }))}
        />
      </Card>

      {!courseId ? (
        <Card style={{ borderRadius: 8 }}>
          <Empty description="Select a course to view assignments" />
        </Card>
      ) : (
        <Card style={{ borderRadius: 8 }}>
          <Table
            dataSource={assignments}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
          />
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        title={editing ? "Edit Assignment" : "Create Assignment"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={creating || updating}
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Midterm Project" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Assignment description..." />
          </Form.Item>
          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: !editing, message: "Due date is required" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="totalMarks" label="Total Marks">
            <InputNumber
              min={1}
              max={1000}
              style={{ width: "100%" }}
              placeholder="100"
            />
          </Form.Item>
          {editing && (
            <Form.Item name="status" label="Status">
              <Select
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Closed", label: "Closed" },
                  { value: "Graded", label: "Graded" },
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
