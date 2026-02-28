import React from "react";
import {
  Layout,
  Menu,
  Dropdown,
  Avatar,
  Button,
  theme,
  Breadcrumb,
  Badge,
  Tooltip,
} from "antd";
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
  BookOutlined,
  ReadOutlined,
  QuestionCircleOutlined,
  FormOutlined,
  InboxOutlined,
  ContainerOutlined,
  SolutionOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/auth";
import NotificationBell from "./NotificationBell";

const { Header, Sider, Content } = Layout;

/**
 * Build sidebar menu items based on the user's role.
 * Role hierarchy from API:
 *   SUPER_ADMIN (4) / ADMIN (3) → Everything
 *   INSTRUCTOR (2)              → Own courses, activities, reports, student queries
 *   STUDENT (1)                 → Enrolled courses, submit queries
 *   VIEWER (1)                  → Read-only dashboard
 */
function getSidebarItems(role: string) {
  const upper = (role || "").toUpperCase();

  // Items visible to everyone
  const common = [
    { key: "/admin", label: "Dashboard", icon: <DashboardOutlined /> },
  ];

  // Student-specific
  const studentItems = [
    {
      key: "/admin/my-enrollments",
      label: "My Enrollments",
      icon: <ContainerOutlined />,
    },
    { key: "/admin/my-queries", label: "My Queries", icon: <InboxOutlined /> },
  ];

  // Instructor-specific
  const instructorItems = [
    { key: "/admin/my-courses", label: "My Courses", icon: <ReadOutlined /> },
    {
      key: "/admin/queries",
      label: "Student Queries",
      icon: <QuestionCircleOutlined />,
    },
    { key: "/admin/assignments", label: "Assignments", icon: <FormOutlined /> },
    {
      key: "/admin/enrollments",
      label: "Enrollments",
      icon: <SolutionOutlined />,
    },
    {
      key: "/admin/announcements",
      label: "Announcements",
      icon: <NotificationOutlined />,
    },
    {
      key: "/admin/activities",
      label: "Activities",
      icon: <UnorderedListOutlined />,
    },
    { key: "/admin/reports", label: "Reports", icon: <FileTextOutlined /> },
  ];

  // Admin-only
  const adminItems = [
    { key: "/admin/courses", label: "Courses", icon: <BookOutlined /> },
    { key: "/admin/users", label: "Users", icon: <TeamOutlined /> },
    {
      key: "/admin/roles",
      label: "Roles",
      icon: <SafetyCertificateOutlined />,
    },
  ];

  if (upper === "SUPER_ADMIN" || upper === "ADMIN") {
    // Admins see everything: instructor features + student features + admin features
    return [...common, ...instructorItems, ...studentItems, ...adminItems];
  }
  if (upper === "INSTRUCTOR") {
    return [...common, ...instructorItems];
  }
  if (upper === "STUDENT") {
    return [...common, ...studentItems];
  }
  // VIEWER or unknown
  return common;
}

/**
 * Main layout component for the application.
 *
 * This layout includes:
 * - A collapsible sidebar with navigation menu.
 * - A header with a toggle button, notifications, and user profile.
 * - Breadcrumbs for navigation context.
 * - A content area.
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

  // Build role-aware sidebar items
  const items = React.useMemo(
    () => getSidebarItems(userRole || ""),
    [userRole],
  );

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

  // Generate breadcrumb items based on current path
  const pathSnippets = location.pathname.split("/").filter((i) => i);
  const breadcrumbItems = [
    { title: <Link to="/">Home</Link> },
    ...pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      const title =
        pathSnippets[index].charAt(0).toUpperCase() +
        pathSnippets[index].slice(1);
      return {
        title:
          index === pathSnippets.length - 1 ? (
            title
          ) : (
            <Link to={url}>{title}</Link>
          ),
      };
    }),
  ];

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
          boxShadow: "2px 0 8px 0 rgba(29,35,41,.05)",
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
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          {collapsed ? "FYP" : "FYP Panel"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={(e) => navigate(e.key)}
          items={items}
        />
      </Sider>
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 200,
          transition: "margin-left 0.2s",
        }}
      >
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
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
                marginRight: 16,
              }}
            />
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <NotificationBell />

            <Dropdown
              overlay={menu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "4px 8px",
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
                <div style={{ lineHeight: "1.2", display: "none" }}>
                  {/* Hide text on small screens if needed, but flex keeps it okay usually */}
                  <div style={{ fontWeight: 600, color: "#262626" }}>
                    {user?.name || "User"}
                  </div>
                  <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                    {typeof userRole === "string"
                      ? userRole.toUpperCase()
                      : userRole}
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
