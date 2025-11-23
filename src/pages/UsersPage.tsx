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
  Space,
  Avatar
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, MailOutlined, LockOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useQuery, useMutation } from "@apollo/client";
import {
  USERS,
  CREATE_USER,
  UPDATE_USER,
  DELETE_USER,
} from "../graphql/operations/users";
import { ROLES } from "../graphql/operations/roles";

const { Title, Text } = Typography;

/**
 * Users Page component.
 * Allows managing users (create, read, update, delete).
 *
 * Capabilities:
 * - View a list of users with their details.
 * - Create new users with name, email, password, and role.
 * - Edit existing users.
 * - Delete users.
 *
 * @returns {JSX.Element} The rendered Users page.
 */
export default function UsersPage() {
  const [data, setData] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const { data: usersData, loading } = useQuery(USERS);
  const { data: rolesData } = useQuery(ROLES);
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (usersData?.users) setData(usersData.users);
  }, [usersData]);

  useEffect(() => {
    if (rolesData?.roles) setRoles(rolesData.roles);
  }, [rolesData]);

  /**
   * Opens the modal for adding a new user.
   */
  function onAdd() {
    setEditing(null);
    form.resetFields();
    setVisible(true);
  }

  /**
   * Opens the modal for editing an existing user.
   * Pre-fills the form with the user data.
   *
   * @param {object} record - The user record to edit.
   */
  function onEdit(record: any) {
    setEditing(record);
    form.setFieldsValue(record);
    setVisible(true);
  }

  const [deleteUserMut, { loading: deleteLoading }] = useMutation(DELETE_USER, {
    refetchQueries: [{ query: USERS }],
  });

  /**
   * Deletes a user.
   *
   * @param {string} id - The ID of the user to delete.
   */
  async function onDelete(id: string) {
    const hide = messageApi.loading("Deleting user...", 0);
    try {
      await deleteUserMut({ variables: { deleteUserId: id } });
      hide();
      messageApi.success("User deleted successfully");
    } catch (error: any) {
      hide();
      messageApi.error(error.message || "Failed to delete user");
    }
  }

  const [createUserMut, { loading: createLoading }] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: USERS }],
  });
  const [updateUserMut, { loading: updateLoading }] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: USERS }],
  });

  /**
   * Handles the submission of the user form (add or edit).
   */
  async function onOk() {
    try {
      const vals = await form.validateFields();
      const hide = messageApi.loading(
        editing ? "Updating user..." : "Creating user...",
        0
      );

      if (editing) {
        await updateUserMut({
          variables: { updateUserId: editing.id, input: vals },
        });
        hide();
        messageApi.success("User updated successfully");
      } else {
        await createUserMut({ variables: { input: vals } });
        hide();
        messageApi.success("User created successfully");
      }
      setVisible(false);
    } catch (error: any) {
      messageApi.error(error.message || "Operation failed");
    }
  }

  const isSaving = createLoading || updateLoading;

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      sorter: (a: any, b: any) => a.id.localeCompare(b.id),
    },
    {
      title: "Name",
      dataIndex: "name",
      render: (name: string) => (
        <Space>
           <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} size="small" />
           {name}
        </Space>
      ),
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Role",
      dataIndex: ["role", "name"],
      render: (role: string) => {
        let color = 'default';
        if (role === 'admin') color = 'magenta';
        if (role === 'user') color = 'green';
        if (role === 'viewer') color = 'blue';
        return <Tag color={color}>{role ? role.toUpperCase() : "N/A"}</Tag>;
      },
      filters: roles.map(r => ({ text: r.name, value: r.name })),
      onFilter: (value: any, record: any) => record.role?.name === value,
    },
    {
      title: "Actions",
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          <Popconfirm
            title="Delete user?"
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
          <Title level={2} style={{ margin: 0 }}>Manage Users</Title>
          <Text type="secondary">
            Create, update, and manage user accounts
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} size="large">
          New User
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
          showTotal: (total) => `Total ${total} users`,
        }}
        style={{ backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)" }}
      />

      <Modal
        title={editing ? "Edit User" : "Create New User"}
        open={visible}
        onOk={onOk}
        onCancel={() => setVisible(false)}
        confirmLoading={isSaving}
        okText={editing ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Full Name" rules={[{ required: true, message: "Please enter full name" }]}>
            <Input prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />} placeholder="John Doe" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
          >
            <Input prefix={<MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />} placeholder="john@example.com" />
          </Form.Item>
          {!editing && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, min: 6, message: "Password must be at least 6 characters" }]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />} placeholder="Min 6 characters" />
            </Form.Item>
          )}
          <Form.Item name="roleName" label="Role" rules={[{ required: true, message: "Please select a role" }]}>
            <Select
              placeholder="Select a role"
              suffixIcon={<SafetyCertificateOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              options={roles.map((r) => ({ label: r.name, value: r.name }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
