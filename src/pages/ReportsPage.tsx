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
  Popconfirm,
  message,
  Tag,
  Typography,
  Space,
  Avatar,
  Badge,
} from "antd";
import {
  DownloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation } from "@apollo/client";
import { ACTIVITIES } from "../graphql/operations/activities";
import {
  REPORTS,
  CREATE_REPORT,
  UPDATE_REPORT,
  DELETE_REPORT,
} from "../graphql/operations/reports";

const { Title, Text } = Typography;

/**
 * Reports Page component.
 * Allows managing reports and viewing recent activities.
 *
 * Capabilities:
 * - View a list of reports.
 * - Create, edit, and delete reports.
 * - Export activities to JSON.
 * - View a list of recent activities.
 *
 * @returns {JSX.Element} The rendered Reports page.
 */
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

  /**
   * Opens the modal for adding a new report.
   */
  function onAdd() {
    setEditing(null);
    form.resetFields();
    setVisible(true);
  }

  /**
   * Opens the modal for editing an existing report.
   * Pre-fills the form with the report data.
   *
   * @param {object} record - The report record to edit.
   */
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

  const [createReportMut, { loading: createLoading }] = useMutation(
    CREATE_REPORT,
    {
      refetchQueries: [{ query: REPORTS }],
    }
  );
  const [updateReportMut, { loading: updateLoading }] = useMutation(
    UPDATE_REPORT,
    {
      refetchQueries: [{ query: REPORTS }],
    }
  );
  const [deleteReportMut, { loading: deleteLoading }] = useMutation(
    DELETE_REPORT,
    {
      refetchQueries: [{ query: REPORTS }],
    }
  );

  /**
   * Deletes a report.
   *
   * @param {string} id - The ID of the report to delete.
   */
  async function onDelete(id: string) {
    const hide = messageApi.loading("Deleting report...", 0);
    try {
      await deleteReportMut({ variables: { deleteReportId: id } });
      hide();
      messageApi.success("Report deleted successfully");
    } catch (error: any) {
      hide();
      messageApi.error(error.message || "Failed to delete report");
    }
  }

  /**
   * Handles the submission of the report form (add or edit).
   */
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
    } catch (error: any) {
      messageApi.error(error.message || "Operation failed");
    }
  }

  const isSaving = createLoading || updateLoading;

  /**
   * Exports the current list of activities to a JSON file.
   */
  async function onExport() {
    try {
      // Export activities data as JSON
      const payload = JSON.stringify(activities, null, 2);
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "activities.json";
      a.click();
      URL.revokeObjectURL(url);
      messageApi.success("Activities exported successfully");
    } catch (error: any) {
      messageApi.error(error.message || "Failed to export activities");
    }
  }

  const reportColumns = [
    { title: "ID", dataIndex: "id", width: 80 },
    {
      title: "User",
      dataIndex: ["user", "name"],
      render: (name: string) => name || <Text type="secondary">N/A</Text>,
    },
    {
      title: "Type",
      dataIndex: "type",
      render: (type: string) => <Tag color="blue">{type.toUpperCase()}</Tag>,
      filters: [
        { text: "Weekly", value: "weekly" },
        { text: "Monthly", value: "monthly" },
        { text: "Quarterly", value: "quarterly" },
        { text: "Annual", value: "annual" },
      ],
      onFilter: (value: any, record: any) => record.type === value,
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      render: (date: string) =>
        date ? (
          new Date(date).toLocaleDateString()
        ) : (
          <Text type="secondary">N/A</Text>
        ),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      render: (date: string) =>
        date ? (
          new Date(date).toLocaleDateString()
        ) : (
          <Text type="secondary">N/A</Text>
        ),
    },
    {
      title: "Actions",
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
          <Popconfirm
            title="Delete report?"
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
          <Title level={2} style={{ margin: 0 }}>
            Reports
          </Title>
          <Text type="secondary">Generate and manage activity reports</Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={onExport}>
            Export JSON
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAdd}
            size="large"
          >
            Create Report
          </Button>
        </Space>
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
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
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
        headStyle={{ borderBottom: "1px solid #f0f0f0" }}
      >
        {activities.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px" }}>
            <Text type="secondary">No recent activities found</Text>
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={activities.slice(0, 10)}
            renderItem={(item: any) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<UserOutlined />}
                      style={{ backgroundColor: "#f0f2f5", color: "#1890ff" }}
                    />
                  }
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text strong>{item.type}</Text>
                      {item.status && (
                        <Badge
                          status={
                            item.status === "completed"
                              ? "success"
                              : "processing"
                          }
                          text={item.status}
                        />
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.timestamp
                          ? new Date(item.timestamp).toLocaleString()
                          : "N/A"}
                      </Text>
                      {item.user?.name && (
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          by {item.user.name}
                        </Text>
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
        title={editing ? "Edit Report" : "Generate New Report"}
        open={visible}
        onOk={onOk}
        onCancel={() => setVisible(false)}
        confirmLoading={isSaving}
        okText={editing ? "Update" : "Generate"}
      >
        <Form form={form} layout="vertical">
          {!editing && (
            <Form.Item
              name="userId"
              label="User ID"
              rules={[{ required: true, message: "Please enter a User ID" }]}
            >
              <Input type="number" placeholder="Enter User ID" />
            </Form.Item>
          )}
          <Form.Item
            name="type"
            label="Report Type"
            rules={[{ required: true, message: "Please select a report type" }]}
          >
            <Select
              options={[
                { label: "Weekly Report", value: "weekly" },
                { label: "Monthly Report", value: "monthly" },
                { label: "Quarterly Report", value: "quarterly" },
                { label: "Annual Report", value: "annual" },
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
