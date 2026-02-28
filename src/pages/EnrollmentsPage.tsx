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
  Typography,
  message,
  Empty,
  Progress,
  Tooltip,
} from "antd";
import { TeamOutlined, EditOutlined } from "@ant-design/icons";
import { useQuery, useMutation } from "@apollo/client";
import {
  COURSE_ENROLLMENTS,
  UPDATE_ENROLLMENT_GRADE,
  MY_COURSES,
} from "../graphql/operations/instructor";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const VALID_GRADES = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

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

/**
 * Enrollments & Grading page.
 * View student roster per course and update grades.
 */
export default function EnrollmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const courseId = searchParams.get("courseId") || "";
  const [grading, setGrading] = useState<any>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: coursesData } = useQuery(MY_COURSES);
  const courses = coursesData?.myCourses || [];

  const { data, loading, refetch } = useQuery(COURSE_ENROLLMENTS, {
    variables: { courseId },
    skip: !courseId,
  });

  const [updateGrade, { loading: updatingGrade }] = useMutation(
    UPDATE_ENROLLMENT_GRADE,
  );

  const handleGrade = (record: any) => {
    setGrading(record);
    form.setFieldsValue({ grade: record.grade || undefined });
  };

  const handleGradeSubmit = async () => {
    try {
      const values = await form.validateFields();
      await updateGrade({
        variables: {
          input: {
            enrollmentId: grading.id,
            grade: values.grade,
          },
        },
      });
      messageApi.success("Grade updated successfully");
      setGrading(null);
      form.resetFields();
      refetch();
    } catch (err: any) {
      messageApi.error(err.message || "Failed to update grade");
    }
  };

  const enrollments = data?.courseEnrollments || [];

  const columns = [
    {
      title: "Student",
      key: "student",
      render: (_: any, r: any) => (
        <div>
          <Text strong>{r.student?.name || "—"}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.student?.email || ""}
          </Text>
        </div>
      ),
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      width: 100,
      align: "center" as const,
      render: (g: string) =>
        g ? <Tag color={gradeColor[g] || "default"}>{g}</Tag> : <Tag>N/A</Tag>,
      filters: VALID_GRADES.map((g) => ({ text: g, value: g })),
      onFilter: (value: any, record: any) => record.grade === value,
    },
    {
      title: "Attendance",
      dataIndex: "attendance",
      key: "attendance",
      width: 140,
      align: "center" as const,
      render: (v: number) => (
        <Progress
          type="circle"
          percent={parseFloat((v ?? 0).toFixed(1))}
          size={40}
          strokeColor={v >= 75 ? "#52c41a" : v >= 50 ? "#faad14" : "#ff4d4f"}
        />
      ),
      sorter: (a: any, b: any) => (a.attendance ?? 0) - (b.attendance ?? 0),
    },
    {
      title: "Enrolled At",
      dataIndex: "enrolledAt",
      key: "enrolledAt",
      width: 140,
      render: (d: string) => (d ? dayjs(d).format("MMM D, YYYY") : "—"),
      sorter: (a: any, b: any) =>
        dayjs(a.enrolledAt).unix() - dayjs(b.enrolledAt).unix(),
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
      width: 100,
      render: (_: any, record: any) => (
        <Tooltip title="Update Grade">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleGrade(record)}
          >
            Grade
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          Enrollments & Grading
        </Title>
        <Text type="secondary">
          View student roster and update grades per course.
        </Text>
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
          <Empty description="Select a course to view enrollments" />
        </Card>
      ) : (
        <Card style={{ borderRadius: 8 }}>
          <Table
            dataSource={enrollments}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 20 }}
            scroll={{ x: 800 }}
          />
        </Card>
      )}

      {/* Grade Update Modal */}
      <Modal
        title={
          grading ? `Update Grade — ${grading.student?.name}` : "Update Grade"
        }
        open={!!grading}
        onOk={handleGradeSubmit}
        onCancel={() => {
          setGrading(null);
          form.resetFields();
        }}
        confirmLoading={updatingGrade}
        okText="Save Grade"
      >
        {grading && (
          <div style={{ marginBottom: 16 }}>
            <Text>
              <strong>Student:</strong> {grading.student?.name}
            </Text>
            <br />
            <Text>
              <strong>Current Grade:</strong> {grading.grade || "N/A"}
            </Text>
            <br />
            <Text>
              <strong>Attendance:</strong>{" "}
              {(grading.attendance ?? 0).toFixed(1)}%
            </Text>
          </div>
        )}
        <Form form={form} layout="vertical">
          <Form.Item
            name="grade"
            label="New Grade"
            rules={[{ required: true, message: "Please select a grade" }]}
          >
            <Select
              placeholder="Select grade"
              options={VALID_GRADES.map((g) => ({ value: g, label: g }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
