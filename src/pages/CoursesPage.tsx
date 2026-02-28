import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Space,
  Popconfirm,
  message,
  Typography,
  Badge,
  Tooltip,
  Card,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation } from "@apollo/client";
import {
  COURSES,
  CREATE_COURSE,
  UPDATE_COURSE,
  ASSIGN_INSTRUCTOR,
  REMOVE_INSTRUCTOR,
} from "../graphql/operations/courses";
import { USERS } from "../graphql/operations/users";

const { Title, Text } = Typography;

/**
 * Admin Course Management page.
 * Allows ADMIN/SUPER_ADMIN to list, create, update courses, and assign/remove instructors.
 */
export default function CoursesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [assigningCourseId, setAssigningCourseId] = useState<string | null>(
    null,
  );
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const { data, loading, refetch } = useQuery(COURSES);
  const { data: usersData } = useQuery(USERS);
  const [createCourse, { loading: creating }] = useMutation(CREATE_COURSE);
  const [updateCourse, { loading: updating }] = useMutation(UPDATE_COURSE);
  const [assignInstructor] = useMutation(ASSIGN_INSTRUCTOR);
  const [removeInstructor] = useMutation(REMOVE_INSTRUCTOR);

  const instructors = (usersData?.users || []).filter(
    (u: any) =>
      u.role?.name === "INSTRUCTOR" ||
      u.role?.name === "ADMIN" ||
      u.role?.name === "SUPER_ADMIN",
  );

  const handleCreate = () => {
    setEditingCourse(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingCourse(record);
    form.setFieldsValue({
      title: record.title,
      code: record.code,
      description: record.description,
      credits: record.credits,
      semester: record.semester,
      schedule: record.schedule,
      instructorId: record.instructor?.id,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCourse) {
        const { code, instructorId, ...updateInput } = values;
        await updateCourse({
          variables: { id: editingCourse.id, input: updateInput },
        });
        messageApi.success("Course updated successfully");
      } else {
        await createCourse({ variables: { input: values } });
        messageApi.success("Course created successfully");
      }
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    } catch (err: any) {
      messageApi.error(err.message || "Operation failed");
    }
  };

  const handleAssign = (courseId: string) => {
    setAssigningCourseId(courseId);
    assignForm.resetFields();
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async () => {
    try {
      const values = await assignForm.validateFields();
      await assignInstructor({
        variables: {
          courseId: assigningCourseId,
          instructorId: values.instructorId,
        },
      });
      messageApi.success("Instructor assigned successfully");
      setIsAssignModalOpen(false);
      refetch();
    } catch (err: any) {
      messageApi.error(err.message || "Failed to assign instructor");
    }
  };

  const handleRemoveInstructor = async (courseId: string) => {
    try {
      await removeInstructor({ variables: { courseId } });
      messageApi.success("Instructor removed");
      refetch();
    } catch (err: any) {
      messageApi.error(err.message || "Failed to remove instructor");
    }
  };

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 100,
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "Credits",
      dataIndex: "credits",
      key: "credits",
      width: 80,
      align: "center" as const,
    },
    {
      title: "Semester",
      dataIndex: "semester",
      key: "semester",
      width: 140,
      render: (v: string) => v || <Text type="secondary">—</Text>,
    },
    {
      title: "Instructor",
      key: "instructor",
      width: 180,
      render: (_: any, record: any) =>
        record.instructor ? (
          <Tag color="green">{record.instructor.name}</Tag>
        ) : (
          <Tag color="default">Unassigned</Tag>
        ),
    },
    {
      title: "Students",
      dataIndex: "enrolledStudentCount",
      key: "enrolledStudentCount",
      width: 90,
      align: "center" as const,
      render: (v: number) => (
        <Badge count={v} showZero style={{ backgroundColor: "#1890ff" }} />
      ),
    },
    {
      title: "Stats",
      key: "stats",
      width: 180,
      render: (_: any, record: any) => (
        <Space size={4}>
          <Tooltip title="Assignments">
            <Tag>{record.assignments?.length ?? 0} assignments</Tag>
          </Tooltip>
          <Tooltip title="Queries">
            <Tag color="orange">
              {record.studentQueries?.filter((q: any) => q.status === "Open")
                .length ?? 0}{" "}
              open
            </Tag>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {record.instructor ? (
            <Popconfirm
              title="Remove instructor from this course?"
              onConfirm={() => handleRemoveInstructor(record.id)}
            >
              <Tooltip title="Remove Instructor">
                <Button size="small" danger icon={<UserDeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Tooltip title="Assign Instructor">
              <Button
                size="small"
                type="primary"
                ghost
                icon={<UserAddOutlined />}
                onClick={() => handleAssign(record.id)}
              />
            </Tooltip>
          )}
        </Space>
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
            <BookOutlined style={{ marginRight: 8 }} />
            Course Management
          </Title>
          <Text type="secondary">
            Manage all courses, assign instructors, and track enrollments.
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          New Course
        </Button>
      </div>

      <Card style={{ borderRadius: 8 }}>
        <Table
          dataSource={data?.courses || []}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create/Edit Course Modal */}
      <Modal
        title={editingCourse ? "Edit Course" : "Create Course"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={creating || updating}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Machine Learning" />
          </Form.Item>
          {!editingCourse && (
            <Form.Item
              name="code"
              label="Course Code"
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g. CS501" />
            </Form.Item>
          )}
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Course description..." />
          </Form.Item>
          <Form.Item name="credits" label="Credits">
            <InputNumber
              min={1}
              max={12}
              style={{ width: "100%" }}
              placeholder="e.g. 3"
            />
          </Form.Item>
          <Form.Item name="semester" label="Semester">
            <Input placeholder="e.g. Spring 2026" />
          </Form.Item>
          <Form.Item name="schedule" label="Schedule">
            <Input placeholder="e.g. Mon/Wed 10:00-11:30 AM" />
          </Form.Item>
          {!editingCourse && (
            <Form.Item name="instructorId" label="Instructor (optional)">
              <Select allowClear placeholder="Select instructor">
                {instructors.map((u: any) => (
                  <Select.Option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Assign Instructor Modal */}
      <Modal
        title="Assign Instructor"
        open={isAssignModalOpen}
        onOk={handleAssignSubmit}
        onCancel={() => setIsAssignModalOpen(false)}
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item
            name="instructorId"
            label="Instructor"
            rules={[{ required: true, message: "Please select an instructor" }]}
          >
            <Select placeholder="Select instructor">
              {instructors.map((u: any) => (
                <Select.Option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
