import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  List,
  Table,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Popconfirm,
  message,
  Tag,
} from "antd";
import { useQuery, useMutation } from "@apollo/client";
import { ACTIVITIES } from "../graphql/operations/activities";
import {
  REPORTS,
  CREATE_REPORT,
  UPDATE_REPORT,
  DELETE_REPORT,
} from "../graphql/operations/reports";

export default function ReportsPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const { data: activitiesData } = useQuery(ACTIVITIES);
  const { data: reportsData, loading } = useQuery(REPORTS);
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (activitiesData?.activities) setActivities(activitiesData.activities);
  }, [activitiesData]);

  useEffect(() => {
    if (reportsData?.reports) setReports(reportsData.reports);
  }, [reportsData]);

  function onAdd() {
    setEditing(null);
    form.resetFields();
    setVisible(true);
  }

  function onEdit(record: any) {
    setEditing(record);
    form.setFieldsValue({
      userId: record.user?.id,
      type: record.type,
      startDate: record.start_date,
      endDate: record.end_date,
    });
    setVisible(true);
  }

  const [createReportMut, { loading: createLoading }] =
    useMutation(CREATE_REPORT);
  const [updateReportMut, { loading: updateLoading }] =
    useMutation(UPDATE_REPORT);
  const [deleteReportMut, { loading: deleteLoading }] =
    useMutation(DELETE_REPORT);

  async function onDelete(id: string) {
    const hide = messageApi.loading("Deleting report...", 0);
    try {
      await deleteReportMut({ variables: { deleteReportId: id } });
      hide();
      messageApi.success("Report deleted successfully");
      setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      hide();
      messageApi.error(error.message || "Failed to delete report");
    }
  }

  async function onOk() {
    try {
      const vals = await form.validateFields();
      const hide = messageApi.loading(
        editing ? "Updating report..." : "Creating report...",
        0
      );

      if (editing) {
        await updateReportMut({
          variables: {
            updateReportId: editing.id,
            input: {
              startDate: vals.startDate,
              endDate: vals.endDate,
              type: vals.type,
            },
          },
        });
        hide();
        messageApi.success("Report updated successfully");
      } else {
        await createReportMut({
          variables: {
            input: {
              userId: vals.userId,
              startDate: vals.startDate,
              endDate: vals.endDate,
              type: vals.type,
            },
          },
        });
        hide();
        messageApi.success("Report created successfully");
      }
      setVisible(false);
      setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      messageApi.error(error.message || "Operation failed");
    }
  }

  const isSaving = createLoading || updateLoading;

  async function onExport() {
    // Export activities data as JSON
    const payload = JSON.stringify(activities, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "activities.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const reportColumns = [
    { title: "ID", dataIndex: "id", width: 80 },
    { title: "User", dataIndex: ["user", "name"] },
    {
      title: "Type",
      dataIndex: "type",
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "N/A",
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "N/A",
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
            title="Delete report?"
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
          <h2 style={{ margin: 0 }}>Reports</h2>
          <p style={{ color: "#8c8c8c", margin: "4px 0 0 0" }}>
            Generate and manage activity reports
          </p>
        </div>
        <div>
          <Button onClick={onExport} style={{ marginRight: 8 }}>
            Export Activities (JSON)
          </Button>
          <Button type="primary" onClick={onAdd} size="large">
            Create Report
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        dataSource={reports}
        columns={reportColumns}
        loading={loading}
        style={{
          marginBottom: 24,
          backgroundColor: "#fff",
          borderRadius: "8px",
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} reports`,
        }}
      />

      <Card
        title="Recent Activities"
        style={{ borderRadius: "8px" }}
        headStyle={{ backgroundColor: "#fafafa", fontWeight: 600 }}
      >
        {activities.length === 0 ? (
          <p style={{ color: "#8c8c8c" }}>No recent activities</p>
        ) : (
          <List
            dataSource={activities.slice(0, 10)}
            renderItem={(item: any) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <div>
                      {item.type}
                      {item.status && (
                        <Tag
                          color={
                            item.status === "completed"
                              ? "success"
                              : item.status === "pending"
                              ? "warning"
                              : "default"
                          }
                          style={{ marginLeft: "8px" }}
                        >
                          {item.status}
                        </Tag>
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <span style={{ color: "#8c8c8c" }}>
                        {item.timestamp
                          ? new Date(item.timestamp).toLocaleString()
                          : "N/A"}
                      </span>
                      {item.user?.name && (
                        <span style={{ marginLeft: "12px", color: "#1890ff" }}>
                          User: {item.user.name}
                        </span>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title={editing ? "Edit Report" : "Create Report"}
        open={visible}
        onOk={onOk}
        onCancel={() => setVisible(false)}
        confirmLoading={isSaving}
      >
        <Form form={form} layout="vertical">
          {!editing && (
            <Form.Item
              name="userId"
              label="User ID"
              rules={[{ required: true }]}
            >
              <Input type="number" />
            </Form.Item>
          )}
          <Form.Item
            name="type"
            label="Report Type"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "Weekly", value: "weekly" },
                { label: "Monthly", value: "monthly" },
                { label: "Quarterly", value: "quarterly" },
                { label: "Annual", value: "annual" },
              ]}
            />
          </Form.Item>
          <Form.Item name="startDate" label="Start Date">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="endDate" label="End Date">
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
