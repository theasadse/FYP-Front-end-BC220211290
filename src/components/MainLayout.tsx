import React from "react";
import { Layout, Menu, Dropdown, Avatar, Button } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth";

const { Header, Sider, Content } = Layout;

/**
 * Navigation menu items configuration.
 * Each item contains a key (route path) and a label (display text).
 */
const items = [
  { key: "/admin", label: "Dashboard" },
  { key: "/admin/activities", label: "Activities" },
  { key: "/admin/reports", label: "Reports" },
  { key: "/admin/users", label: "Users" },
  { key: "/admin/roles", label: "Roles" },
];

/**
 * Main layout component for the application.
 *
 * This layout includes:
 * - A collapsible sidebar with navigation menu.
 * - A header with a toggle button for the sidebar and a user dropdown profile.
 * - A content area where child components are rendered.
 *
 * It uses the `useAuth` hook to get current user information and handle logout.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to render inside the main layout.
 * @returns {JSX.Element} The rendered layout component.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle both role as string and role as object
  const userRole =
    typeof user?.role === "string" ? user.role : user?.role?.name;

  const menu = (
    <Menu>
      <Menu.Item
        key="logout"
        onClick={() => {
          logout();
          navigate("/login");
        }}
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(val) => setCollapsed(val)}
      >
        <div
          className="logo"
          style={{ color: "white", padding: 18, textAlign: "center" }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              padding: "8px 12px",
              borderRadius: 8,
              display: "inline-block",
            }}
          >
            FYP Panel
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[window.location.pathname]}
          onClick={(e) => navigate(e.key)}
          items={items}
        />
      </Sider>
      <Layout>
        <Header
          className="page-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 24px",
          }}
        >
          <div>
            <Button
              type="text"
              onClick={() => setCollapsed(!collapsed)}
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            />
          </div>
          <div>
            <Dropdown overlay={menu} trigger={["click"]}>
              <div
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{
                    marginRight: 8,
                    background: "#fff",
                    color: "#0f2a4a",
                  }}
                />
                <div style={{ color: "#ffffff" }}>
                  <div style={{ fontWeight: 700 }}>{user?.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>{userRole}</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: "16px" }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
