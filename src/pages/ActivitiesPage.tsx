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
} from "antd";
import { useQuery, useMutation } from "@apollo/client";
import {
  ACTIVITIES,
  LOG_ACTIVITY,
  UPDATE_ACTIVITY,
  DELETE_ACTIVITY,
} from "../graphql/operations/activities";

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

  function onAdd() {
    setEditing(null);
    form.resetFields();
    setVisible(true);
  }

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
    },
    {
      title: "User",
      dataIndex: ["user", "name"],
      render: (name: string) => name || "N/A",
    },
    {
      title: "Activity Type",
      dataIndex: "type",
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
          {status || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      render: (timestamp: string) =>
        timestamp ? new Date(timestamp).toLocaleString() : "N/A",
    },
    {
      title: "Actions",
      width: 180,
      render: (_: any, record: any) => (
        <>
          <Button type="link" onClick={() => onEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete activity?"
            onConfirm={() => onDelete(record.id)}
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Activity Logs</h2>
          <p style={{ color: "#8c8c8c", margin: "4px 0 0 0" }}>
            Monitor and manage system activities
          </p>
        </div>
        <Button type="primary" onClick={onAdd} size="large">
          Log New Activity
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
          showTotal: (total) => `Total ${total} activities`,
        }}
        style={{ backgroundColor: "#fff", borderRadius: "8px" }}
      />

      <Modal
        title={editing ? "Edit Activity" : "Log Activity"}
        open={visible}
        onOk={onOk}
        onCancel={() => setVisible(false)}
        confirmLoading={isSaving}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ activity: "MDB Reply" }}
        >
          <Form.Item
            name="instructor_id"
            label="Instructor ID"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="activity"
            label="Activity"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "MDB Reply", value: "MDB Reply" },
                { label: "Assignment Upload", value: "Assignment Upload" },
                { label: "Ticket Response", value: "Ticket Response" },
              ]}
            />
          </Form.Item>
          <Form.Item name="metadata.note" label="Note">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
