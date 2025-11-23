import { gql } from "@apollo/client";

export const NOTIFICATIONS_QUERY = gql`
  query Notifications {
    notifications {
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

export const MARK_AS_READ_MUTATION = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id)
  }
`;
