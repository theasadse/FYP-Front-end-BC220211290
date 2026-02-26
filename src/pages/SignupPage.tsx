import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  message,
  Card,
  Typography,
  Layout,
  Space,
} from "antd";
import { useMutation, useQuery } from "@apollo/client";
import { REGISTER } from "../graphql/operations/auth";
import { ROLES } from "../graphql/operations/roles";
import { useNavigate } from "react-router-dom";
import {
  LeftOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Content } = Layout;

/**
 * Signup Page component.
 * Allows new users to register an account.
 *
 * Capabilities:
 * - Register a new user with username, full name, password, and role.
 * - Fetches available roles from the backend to populate the role selection dropdown.
 * - Redirects to the login page upon successful registration.
 *
 * @returns {JSX.Element} The rendered Signup page.
 */
export default function SignupPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: rolesData } = useQuery(ROLES);

  useEffect(() => {
    if (rolesData) setRoles(rolesData.roles);
  }, [rolesData]);

  const [register, { loading }] = useMutation(REGISTER);

  /**
   * Handles the form submission for user registration.
   *
   * @param {object} vals - The form values.
   * @param {string} vals.username - The desired username (used as email).
   * @param {string} vals.name - The user's full name.
   * @param {string} vals.password - The user's password.
   * @param {string} vals.role - The selected role name.
   */
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
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        {contextHolder}
        <Card
          style={{
            width: 480,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: "8px",
          }}
          bodyStyle={{ padding: "32px 32px" }}
        >
          <div style={{ marginBottom: "24px" }}>
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={() => navigate("/login")}
              style={{ paddingLeft: 0, marginBottom: 8 }}
            >
              Back to Login
            </Button>
            <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
              Create Account
            </Title>
            <Text type="secondary">Join the FYP Admin Panel today.</Text>
          </div>

          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              name="name"
              label="Full Name"
              rules={[
                { required: true, message: "Please enter your full name" },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="John Doe"
              />
            </Form.Item>

            <Form.Item
              name="username"
              label="Email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please enter a valid email",
                },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="john@university.edu"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  min: 6,
                  message: "Password must be at least 6 characters",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: "Please select a role" }]}
            >
              <Select
                placeholder="Select a role"
                suffixIcon={
                  <SafetyCertificateOutlined
                    style={{ color: "rgba(0,0,0,.25)" }}
                  />
                }
                options={roles?.map((r) => ({ label: r.name, value: r.name }))}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Create Account
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
}
