import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, message, Card, Typography } from "antd";
import { useMutation, useQuery } from "@apollo/client";
import { REGISTER } from "../graphql/operations/auth";
import { ROLES } from "../graphql/operations/roles";
import { useNavigate } from "react-router-dom";
import { LeftOutlined } from "@ant-design/icons";

export default function SignupPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: rolesData } = useQuery(ROLES);

  console.log(rolesData);
  useEffect(() => {
    if (rolesData) setRoles(rolesData.roles);
  }, [rolesData]);

  const [register, { loading }] = useMutation(REGISTER);
  const onFinish = async (vals: any) => {
    const hide = messageApi.loading("Creating account...", 0);
    try {
      const res = await register({
        variables: {
          input: {
            email: vals.username,
            name: vals.name,
            password: vals.password || "defaultPassword123",
            roleName: vals.role,
          },
        },
      });
      hide();
      if (res.data) {
        messageApi.success("Account created successfully. Please sign in.");
        setTimeout(() => navigate("/login"), 1000);
      }
    } catch (error: any) {
      hide();
      messageApi.error(error.message || "Failed to create account");
    }
  };

  return (
    <div className="form-center">
      {contextHolder}
      <Card style={{ width: 460, borderRadius: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 8,
            gap: 12,
          }}
        >
          <Button
            type="text"
            className="back-button"
            icon={<LeftOutlined />}
            onClick={() => navigate("/login")}
          />
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Create Account
            </Typography.Title>
            <div style={{ color: "var(--muted, #5f6f88)", fontSize: 13 }}>
              Create a new user account
            </div>
          </div>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Full name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select
              options={roles?.map((r) => ({ label: r.name, value: r.name }))}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Create account
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
