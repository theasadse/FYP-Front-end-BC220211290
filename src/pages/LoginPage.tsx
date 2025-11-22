import React from "react";
import { Card, Button, Form, Input, Typography, Alert, Layout, Space } from "antd";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/auth";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../graphql/operations/auth";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Content } = Layout;

/**
 * Login Page component.
 * Allows users to authenticate using their credentials.
 * Handles both GraphQL-based authentication and a fallback to the AuthContext mechanism.
 * Redirects the user to their role-specific dashboard upon successful login.
 *
 * @returns {JSX.Element} The rendered Login page.
 */
export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const [loginMut] = useMutation(LOGIN);

  /**
   * Handles the form submission for login.
   * Attempts to login via GraphQL mutation first, then falls back to AuthContext.
   * On success, stores the token and redirects based on the user's role.
   *
   * @param {object} values - The form values.
   * @param {string} values.username - The username entered.
   * @param {string} values.password - The password entered.
   */
  const onFinish = async (values: { username: string; password: string }) => {
    try {
      // Use the mutation directly with proper variables
      const result = await loginMut({
        variables: {
          input: {
            email: values.username,
            password: values.password,
          },
        },
      });

      if (result.data?.login) {
        const { token, user } = result.data.login;

        // Store auth data in localStorage
        localStorage.setItem("fyp_auth", JSON.stringify({ token, user }));

        // Get role name from the nested role object
        const roleName = user?.role?.name;

        console.log("Login successful:", { user, roleName });

        if (roleName) {
          // Navigate based on role
          navigate(`/${roleName}`);
          return;
        }
      }
    } catch (error) {
      console.error("Login error:", error);
    }

    // Fallback to auth context method if GraphQL fails
    await login(values.username, values.password);
    const raw = localStorage.getItem("fyp_auth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const roleName = parsed?.user?.role?.name || parsed?.user?.role;
        if (roleName) {
          navigate(`/${roleName}`);
          return;
        }
      } catch (e) {
        console.error("Parse error:", e);
      }
    }
    navigate("/");
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
        <Card
          style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "8px" }}
          bodyStyle={{ padding: "40px 32px" }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Title level={3} style={{ marginBottom: "8px", color: "#1890ff" }}>
              FYP Admin Panel
            </Title>
            <Text type="secondary">Welcome back! Please login to continue.</Text>
          </div>

          {error && (
            <Alert
              type="error"
              message={error}
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            initialValues={{ remember: true }}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: "Please input your username!" }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="Username (admin | user | viewer)"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: "12px" }}>
              <Button type="primary" htmlType="submit" block loading={isLoading}>
                Sign in
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              <Text type="secondary">Don't have an account? </Text>
              <Link to="/signup" style={{ fontWeight: 500 }}>
                Sign up now
              </Link>
            </div>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
}
