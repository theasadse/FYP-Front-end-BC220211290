import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Popconfirm, message, Typography, Space, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useQuery, useMutation } from "@apollo/client";
import {
  ROLES,
  CREATE_ROLE,
  UPDATE_ROLE,
  DELETE_ROLE,
} from "../graphql/operations/roles";

const { Title, Text } = Typography;

/**
 * Roles Page component.
 * Allows managing user roles (create, read, update, delete).
 *
 * Capabilities:
 * - View a list of roles.
 * - Create new roles.
 * - Edit existing roles.
 * - Delete roles.
 *
 * @returns {JSX.Element} The rendered Roles page.
 */
export default function RolesPage() {
  const [data, setData] = useState<any[]>([]);
  const { data: rolesData, loading } = useQuery(ROLES);
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (rolesData?.roles) setData(rolesData.roles);
  }, [rolesData]);

  /**
   * Opens the modal for adding a new role.
   */
  function onAdd() {
    setEditing(null);
    form.resetFields();
    setVisible(true);
  }

  /**
   * Opens the modal for editing an existing role.
   * Pre-fills the form with the role data.
   *
   * @param {object} record - The role record to edit.
   */
  function onEdit(record: any) {
    setEditing(record);
    form.setFieldsValue(record);
    setVisible(true);
  }

  const [createRoleMut, { loading: createLoading }] = useMutation(CREATE_ROLE, {
    refetchQueries: [{ query: ROLES }],
  });
  const [updateRoleMut, { loading: updateLoading }] = useMutation(UPDATE_ROLE, {
    refetchQueries: [{ query: ROLES }],
  });
  const [deleteRoleMut, { loading: deleteLoading }] = useMutation(DELETE_ROLE, {
    refetchQueries: [{ query: ROLES }],
  });

  /**
   * Deletes a role.
   *
   * @param {string} id - The ID of the role to delete.
   */
  async function onDelete(id: string) {
    const hide = messageApi.loading("Deleting role...", 0);
    try {
      await deleteRoleMut({ variables: { deleteRoleId: id } });
      hide();
      messageApi.success("Role deleted successfully");
    } catch (error: any) {
      hide();
      messageApi.error(error.message || "Failed to delete role");
    }
  }

  /**
   * Handles the submission of the role form (add or edit).
   */
  async function onOk() {
    try {
      const vals = await form.validateFields();
      const hide = messageApi.loading(
        editing ? "Updating role..." : "Creating role...",
        0
      );

      if (editing) {
        await updateRoleMut({
          variables: { updateRoleId: editing.id, name: vals.name },
        });
        hide();
        messageApi.success("Role updated successfully");
      } else {
        await createRoleMut({ variables: { name: vals.name } });
        hide();
        messageApi.success("Role created successfully");
      }
      setVisible(false);
    } catch (error: any) {
      messageApi.error(error.message || "Operation failed");
    }
  }

  const isSaving = createLoading || updateLoading;

  const columns = [
    { title: "ID", dataIndex: "id", width: 80, sorter: (a: any, b: any) => a.id.localeCompare(b.id) },
    {
      title: "Role Name",
      dataIndex: "name",
      render: (name: string) => <Tag icon={<SafetyCertificateOutlined />} color="geekblue">{name.toUpperCase()}</Tag>
    },
    {
      title: "Actions",
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          <Popconfirm
            title="Delete role?"
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
          <Title level={2} style={{ margin: 0 }}>Manage Roles</Title>
          <Text type="secondary">
            Define user access levels and permissions
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} size="large">
          New Role
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
          showTotal: (total) => `Total ${total} roles`,
        }}
        style={{ backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)" }}
      />

      <Modal
        title={editing ? "Edit Role" : "Create New Role"}
        open={visible}
        onOk={onOk}
        onCancel={() => setVisible(false)}
        confirmLoading={isSaving}
        okText={editing ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Role Name"
            rules={[{ required: true, message: "Please enter a role name" }]}
          >
            <Input prefix={<SafetyCertificateOutlined style={{ color: "rgba(0,0,0,.25)" }} />} placeholder="e.g., moderator" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
