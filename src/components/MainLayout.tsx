import React from "react";
import { Layout, Menu, Dropdown, Avatar, Button, theme } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DashboardOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/auth";

const { Header, Sider, Content } = Layout;

/**
 * Navigation menu items configuration.
 * Each item contains a key (route path) and a label (display text).
 */
const items = [
  { key: "/admin", label: "Dashboard", icon: <DashboardOutlined /> },
  { key: "/admin/activities", label: "Activities", icon: <UnorderedListOutlined /> },
  { key: "/admin/reports", label: "Reports", icon: <FileTextOutlined /> },
  { key: "/admin/users", label: "Users", icon: <TeamOutlined /> },
  { key: "/admin/roles", label: "Roles", icon: <SafetyCertificateOutlined /> },
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
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

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
        icon={<LogoutOutlined />}
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div
          className="logo"
          style={{
            height: 32,
            margin: 16,
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            letterSpacing: "1px",
            fontSize: collapsed ? "12px" : "16px",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {collapsed ? "FYP" : "FYP Panel"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[location.pathname]}
          onClick={(e) => navigate(e.key)}
          items={items}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: "margin-left 0.2s" }}>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 1,
            boxShadow: "0 1px 4px rgba(0,21,41,0.08)",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <div style={{ display: "flex", alignItems: "center" }}>
            <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
              <div
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "4px 12px",
                  borderRadius: "6px",
                  transition: "background 0.3s",
                }}
                className="user-dropdown-trigger"
              >
                <Avatar
                  style={{ backgroundColor: "#1890ff" }}
                  icon={<UserOutlined />}
                  size="default"
                />
                <div style={{ lineHeight: "1.2" }}>
                  <div style={{ fontWeight: 600, color: "#262626" }}>{user?.name || "User"}</div>
                  <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                    {typeof userRole === "string" ? userRole.toUpperCase() : userRole}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: "transparent",
            overflow: "initial",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
