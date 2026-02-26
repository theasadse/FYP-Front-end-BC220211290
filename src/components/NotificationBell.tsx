import React, { useEffect } from "react";
import {
  Badge,
  Dropdown,
  Menu,
  Typography,
  List,
  Button,
  Empty,
  Tooltip,
} from "antd";
import { BellOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useQuery, useMutation } from "@apollo/client";
import { useAuth } from "../contexts/auth";
import {
  NOTIFICATIONS_QUERY,
  NOTIFICATION_SUBSCRIPTION,
  MARK_NOTIFICATION_READ,
} from "../graphql/operations/notifications";

const { Text } = Typography;

/**
 * NotificationBell component.
 * Displays a bell icon with a badge for unread notifications.
 * Opens a dropdown with a list of notifications.
 * Real-time updates via GraphQL Subscriptions.
 */
export default function NotificationBell() {
  const { user } = useAuth();

  // Skip query if no user is logged in
  const { data, loading, subscribeToMore, refetch } = useQuery(
    NOTIFICATIONS_QUERY,
    {
      skip: !user?.id,
      fetchPolicy: "cache-and-network",
    },
  );

  const [markAsRead] = useMutation(MARK_NOTIFICATION_READ);

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToMore({
      document: NOTIFICATION_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newNotification = subscriptionData.data.notificationReceived;

        // Check if already exists to prevent duplicates
        if (prev.notifications.find((n: any) => n.id === newNotification.id)) {
          return prev;
        }

        return {
          ...prev,
          notifications: [newNotification, ...prev.notifications],
        };
      },
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id, subscribeToMore]);

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead({ variables: { id, all: false } });
      refetch();
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAsRead({ variables: { all: true } });
      refetch();
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  };

  const menu = (
    <div
      style={{
        width: 350,
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow:
          "0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text strong>Notifications</Text>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {unreadCount > 0 && (
            <Badge count={unreadCount} style={{ backgroundColor: "#1890ff" }} />
          )}
          {unreadCount > 0 && (
            <Button type="link" size="small" onClick={handleMarkAll}>
              Mark all read
            </Button>
          )}
        </div>
      </div>
      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No notifications"
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item: any) => (
              <List.Item
                style={{
                  padding: "12px 16px",
                  background: item.isRead ? "#fff" : "#e6f7ff",
                  transition: "background 0.3s",
                  cursor: "pointer",
                }}
                actions={[
                  !item.isRead && (
                    <Tooltip title="Mark as read">
                      <Button
                        type="text"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(item.id);
                        }}
                      />
                    </Tooltip>
                  ),
                ]}
              >
                <List.Item.Meta
                  title={
                    <Text strong={!item.isRead} style={{ fontSize: "14px" }}>
                      {item.message}
                    </Text>
                  }
                  description={
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {new Date(Number(item.createdAt)).toLocaleString()}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => menu}
      trigger={["click"]}
      placement="bottomRight"
    >
      <div style={{ cursor: "pointer", display: "inline-block" }}>
        <Badge count={unreadCount} size="small" offset={[0, 0]}>
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: 18 }} />}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </Badge>
      </div>
    </Dropdown>
  );
}
