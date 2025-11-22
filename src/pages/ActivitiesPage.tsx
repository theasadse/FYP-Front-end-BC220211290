import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
  Tag,
  Typography,
  Space
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { useQuery, useMutation } from "@apollo/client";
import {
  ACTIVITIES,
  LOG_ACTIVITY,
  UPDATE_ACTIVITY,
  DELETE_ACTIVITY,
} from "../graphql/operations/activities";

const { Title, Text } = Typography;

/**
 * Page component for managing Activities.
 * Displays a table of activities and allows creating, updating, and deleting activities.
 *
 * @returns {JSX.Element} The rendered Activities page.
 */
export default function ActivitiesPage() {
  const [data, setData] = useState<any[]>([]);
  const { data: activitiesData, loading } = useQuery(ACTIVITIES, {
    variables: { limit: 100 },
  });
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (activitiesData?.activities) setData(activitiesData.activities);
  }, [activitiesData]);

  /**
   * Opens the modal for adding a new activity.
   */
  function onAdd() {
    setEditing(null);
    form.resetFields();
    setVisible(true);
  }

  /**
   * Opens the modal for editing an existing activity.
   * Pre-fills the form with the activity data.
   *
   * @param {object} record - The activity record to edit.
   */
  function onEdit(record: any) {
    setEditing(record);
    form.setFieldsValue({
      instructor_id: record.user?.id,
      activity: record.type,
      "metadata.note": record.metadata,
    });
    setVisible(true);
  }

  const [logActivityMut, { loading: logLoading }] = useMutation(LOG_ACTIVITY);
  const [updateActivityMut, { loading: updateLoading }] =
    useMutation(UPDATE_ACTIVITY);
  const [deleteActivityMut, { loading: deleteLoading }] =
    useMutation(DELETE_ACTIVITY);

  /**
   * Deletes an activity.
   *
   * @param {string} id - The ID of the activity to delete.
   */
  async function onDelete(id: string) {
    const hide = messageApi.loading("Deleting activity...", 0);
    try {
      await deleteActivityMut({ variables: { deleteActivityId: id } });
      hide();
      messageApi.success("Activity deleted successfully");
      setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      hide();
      messageApi.error(error.message || "Failed to delete activity");
    }
  }

  /**
   * Handles the submission of the activity form (add or edit).
   */
  async function onOk() {
    try {
      const vals = await form.validateFields();
      const activityInput = {
        userId: Number(vals.instructor_id),
        type: vals.activity,
        metadata: JSON.stringify({ note: vals["metadata.note"] }),
      };

      const hide = messageApi.loading(
        editing ? "Updating activity..." : "Logging activity...",
        0
      );

      if (editing) {
        await updateActivityMut({
          variables: { updateActivityId: editing.id, input: activityInput },
        });
        hide();
        messageApi.success("Activity updated successfully");
      } else {
        await logActivityMut({ variables: { input: activityInput } });
        hide();
        messageApi.success("Activity logged successfully");
      }
      setVisible(false);
      setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      messageApi.error(error.message || "Operation failed");
    }
  }

  const isSaving = logLoading || updateLoading;

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      sorter: (a: any, b: any) => a.id - b.id,
    },
    {
      title: "User",
      dataIndex: ["user", "name"],
      render: (name: string) => name || <Text type="secondary">N/A</Text>,
      sorter: (a: any, b: any) => (a.user?.name || "").localeCompare(b.user?.name || ""),
    },
    {
      title: "Activity Type",
      dataIndex: "type",
      filters: [
        { text: 'MDB Reply', value: 'MDB Reply' },
        { text: 'Assignment Upload', value: 'Assignment Upload' },
        { text: 'Ticket Response', value: 'Ticket Response' },
      ],
      onFilter: (value: any, record: any) => record.type.indexOf(value) === 0,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "completed"
              ? "success"
              : status === "pending"
              ? "warning"
              : "default"
          }
        >
          {status ? status.toUpperCase() : "N/A"}
        </Tag>
      ),
    },
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      render: (timestamp: string) =>
        timestamp ? new Date(timestamp).toLocaleString() : <Text type="secondary">N/A</Text>,
      sorter: (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: "Actions",
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          <Popconfirm
            title="Delete activity?"
            description="This action cannot be undone."
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>Activity Logs</Title>
          <Text type="secondary">
            Monitor and manage system activities
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} size="large">
          Log Activity
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)"
        }}
      />

      <Modal
        title={editing ? "Edit Activity" : "Log New Activity"}
        open={visible}
        onOk={onOk}
        onCancel={() => setVisible(false)}
        confirmLoading={isSaving}
        okText={editing ? "Update" : "Create"}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ activity: "MDB Reply" }}
        >
          <Form.Item
            name="instructor_id"
            label="Instructor ID"
            rules={[{ required: true, message: "Please enter the instructor ID" }]}
          >
            <Input placeholder="e.g., 101" />
          </Form.Item>
          <Form.Item
            name="activity"
            label="Activity Type"
            rules={[{ required: true, message: "Please select an activity type" }]}
          >
            <Select
              options={[
                { label: "MDB Reply", value: "MDB Reply" },
                { label: "Assignment Upload", value: "Assignment Upload" },
                { label: "Ticket Response", value: "Ticket Response" },
              ]}
            />
          </Form.Item>
          <Form.Item name="metadata.note" label="Additional Note">
            <Input.TextArea rows={3} placeholder="Add any relevant details..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
