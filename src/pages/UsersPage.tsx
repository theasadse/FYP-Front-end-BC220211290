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
  USERS,
  CREATE_USER,
  UPDATE_USER,
  DELETE_USER,
} from "../graphql/operations/users";
import { ROLES } from "../graphql/operations/roles";

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

  const [deleteUserMut, { loading: deleteLoading }] = useMutation(DELETE_USER);

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
      setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      hide();
      messageApi.error(error.message || "Failed to delete user");
    }
  }

  const [createUserMut, { loading: createLoading }] = useMutation(CREATE_USER);
  const [updateUserMut, { loading: updateLoading }] = useMutation(UPDATE_USER);

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
      setTimeout(() => window.location.reload(), 500);
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
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Role",
      dataIndex: ["role", "name"],
      render: (role: string) => <Tag color="blue">{role || "N/A"}</Tag>,
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
            title="Delete user?"
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
          <h2 style={{ margin: 0 }}>Manage Users</h2>
          <p style={{ color: "#8c8c8c", margin: "4px 0 0 0" }}>
            Create, update, and manage user accounts
          </p>
        </div>
        <Button type="primary" onClick={onAdd} size="large">
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
        style={{ backgroundColor: "#fff", borderRadius: "8px" }}
      />

      <Modal
        title={editing ? "Edit User" : "New User"}
        open={visible}
        onOk={onOk}
        onCancel={() => setVisible(false)}
        confirmLoading={isSaving}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input placeholder="Enter full name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
          {!editing && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password placeholder="Enter password (min 6 characters)" />
            </Form.Item>
          )}
          <Form.Item name="roleName" label="Role" rules={[{ required: true }]}>
            <Select
              placeholder="Select a role"
              options={roles.map((r) => ({ label: r.name, value: r.name }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
