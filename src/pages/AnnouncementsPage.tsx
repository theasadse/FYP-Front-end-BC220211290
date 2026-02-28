import { useState } from "react";
import {
  Card,
  Tag,
  Button,
  Select,
  Space,
  Modal,
  Form,
  Input,
  Typography,
  message,
  Empty,
  Divider,
} from "antd";
import { NotificationOutlined, PlusOutlined } from "@ant-design/icons";
import { useQuery, useMutation } from "@apollo/client";
import {
  COURSE_ANNOUNCEMENTS,
  POST_ANNOUNCEMENT,
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

/**
 * Announcements page.
 * View and post announcements per course.
 */
export default function AnnouncementsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const courseId = searchParams.get("courseId") || "";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: coursesData } = useQuery(MY_COURSES);
  const courses = coursesData?.myCourses || [];

  const { data, loading, refetch } = useQuery(COURSE_ANNOUNCEMENTS, {
    variables: { courseId },
    skip: !courseId,
  });

  const [postAnnouncement, { loading: posting }] =
    useMutation(POST_ANNOUNCEMENT);

  const handlePost = async () => {
    try {
      const values = await form.validateFields();
      await postAnnouncement({
        variables: {
          input: {
            courseId,
            title: values.title,
            content: values.content,
            priority: values.priority || "Normal",
          },
        },
      });
      messageApi.success("Announcement posted successfully");
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    } catch (err: any) {
      messageApi.error(err.message || "Failed to post announcement");
    }
  };

  const announcements = data?.courseAnnouncements || [];

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
            <NotificationOutlined style={{ marginRight: 8 }} />
            Announcements
          </Title>
          <Text type="secondary">
            Post and view announcements for your courses.
          </Text>
        </div>
        {courseId && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Post Announcement
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
          <Empty description="Select a course to view announcements" />
        </Card>
      ) : loading ? (
        <Card loading style={{ borderRadius: 8 }} />
      ) : announcements.length === 0 ? (
        <Card style={{ borderRadius: 8 }}>
          <Empty description="No announcements yet for this course" />
        </Card>
      ) : (
        <div>
          {announcements.map((a: any) => (
            <Card
              key={a.id}
              style={{ borderRadius: 8, marginBottom: 12 }}
              size="small"
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <Title level={5} style={{ margin: 0 }}>
                    {a.title}
                  </Title>
                  <Space size={4} style={{ marginTop: 4 }}>
                    <Tag color={priorityColor[a.priority]}>{a.priority}</Tag>
                    <Tag color="blue">{a.course?.code}</Tag>
                  </Space>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {dayjs(a.createdAt).fromNow()}
                </Text>
              </div>
              <Divider style={{ margin: "12px 0" }} />
              <Paragraph style={{ margin: 0 }}>{a.content}</Paragraph>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Posted by {a.instructor?.name || "Instructor"}
              </Text>
            </Card>
          ))}
        </div>
      )}

      {/* Post Announcement Modal */}
      <Modal
        title="Post Announcement"
        open={isModalOpen}
        onOk={handlePost}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={posting}
        okText="Post"
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Quiz Next Monday" />
          </Form.Item>
          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} placeholder="Write your announcement..." />
          </Form.Item>
          <Form.Item name="priority" label="Priority" initialValue="Normal">
            <Select
              options={[
                { value: "Low", label: "Low" },
                { value: "Normal", label: "Normal" },
                { value: "High", label: "High" },
                { value: "Urgent", label: "Urgent" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
