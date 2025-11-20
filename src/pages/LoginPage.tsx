import React from "react";
import { Card, Button, Form, Input, Typography, Alert } from "antd";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/auth";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../graphql/operations/auth";

const { Title } = Typography;

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const [loginMut] = useMutation(LOGIN);
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
    <div
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card style={{ width: 360 }}>
        <Title level={4} style={{ textAlign: "center" }}>
          FYP Admin Panel — Login
        </Title>
        {error && (
          <Alert type="error" message={error} style={{ marginBottom: 12 }} />
        )}
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username" }]}
          >
            <Input placeholder="admin | user | viewer" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password" }]}
          >
            <Input.Password placeholder="password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              Sign in
            </Button>
          </Form.Item>
          <div style={{ textAlign: "center" }}>
            <Link to="/signup">Create an account</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
