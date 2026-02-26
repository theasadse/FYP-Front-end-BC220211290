import { gql } from "@apollo/client";

export const NOTIFICATIONS_QUERY = gql`
  query Notifications($limit: Int, $offset: Int) {
    notifications(limit: $limit, offset: $offset) {
      id
      user {
        name
        id
      }
      message
      isRead
      createdAt
      metadata
    }
  }
`;

export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription NotificationReceived {
    notificationReceived {
      id
      user {
        id
        name
      }
      message
      isRead
      createdAt
      metadata
    }
  }
`;

/**
 * Mark a single notification or all notifications as read.
 * Pass { id, all: false } for a single notification.
 * Pass { all: true } to clear all.
 */
export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID, $all: Boolean) {
    markNotificationRead(id: $id, all: $all)
  }
`;
