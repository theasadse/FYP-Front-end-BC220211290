import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Popconfirm, message } from "antd";
import { useQuery, useMutation } from "@apollo/client";
import {
  ROLES,
  CREATE_ROLE,
  UPDATE_ROLE,
  DELETE_ROLE,
} from "../graphql/operations/roles";

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

  function onAdd() {
    setEditing(null);
    form.resetFields();
    setVisible(true);
  }

  function onEdit(record: any) {
    setEditing(record);
    form.setFieldsValue(record);
    setVisible(true);
  }

  const [createRoleMut, { loading: createLoading }] = useMutation(CREATE_ROLE);
  const [updateRoleMut, { loading: updateLoading }] = useMutation(UPDATE_ROLE);
  const [deleteRoleMut, { loading: deleteLoading }] = useMutation(DELETE_ROLE);

  async function onDelete(id: string) {
    const hide = messageApi.loading("Deleting role...", 0);
    try {
      await deleteRoleMut({ variables: { deleteRoleId: id } });
      hide();
      messageApi.success("Role deleted successfully");
      setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      hide();
      messageApi.error(error.message || "Failed to delete role");
    }
  }

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
      setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      messageApi.error(error.message || "Operation failed");
    }
  }

  const isSaving = createLoading || updateLoading;

  const columns = [
    { title: "ID", dataIndex: "id", width: 80 },
    { title: "Role Name", dataIndex: "name" },
    {
      title: "Actions",
      width: 180,
      render: (_: any, record: any) => (
        <>
          <Button type="link" onClick={() => onEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete role?"
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
          <h2 style={{ margin: 0 }}>Manage Roles</h2>
          <p style={{ color: "#8c8c8c", margin: "4px 0 0 0" }}>
            Create, update, and manage user roles
          </p>
        </div>
        <Button type="primary" onClick={onAdd} size="large">
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
        style={{ backgroundColor: "#fff", borderRadius: "8px" }}
      />

      <Modal
        title={editing ? "Edit Role" : "New Role"}
        open={visible}
        onOk={onOk}
        onCancel={() => setVisible(false)}
        confirmLoading={isSaving}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Role Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
