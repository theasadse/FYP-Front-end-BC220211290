import { gql } from "@apollo/client";

// Query 1/11: Activities
export const ACTIVITIES = gql`
  query Activities($limit: Int) {
    activities(limit: $limit) {
      id
      user {
        id
        name
      }
      type
      timestamp
      status
      metadata
    }
  }
`;

// Query 2/11: Activity (single)
export const ACTIVITY = gql`
  query Activity($activityId: ID!) {
    activity(id: $activityId) {
      id
      user {
        id
        name
      }
      type
      timestamp
      status
      metadata
    }
  }
`;

// Query 3/11: GetActivities (with userId filter)
export const GET_ACTIVITIES = gql`
  query GetActivities($userId: ID, $limit: Int) {
    getActivities(userId: $userId, limit: $limit) {
      id
      user {
        id
        name
      }
      type
      timestamp
      status
      metadata
    }
  }
`;

// Query 4/11: GetDashboardStats
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    getDashboardStats {
      totalActivities
      completedActivities
      pendingActivities
      perType {
        type
        count
      }
    }
  }
`;

// Mutation 9/14: LogActivity
export const LOG_ACTIVITY = gql`
  mutation LogActivity($input: LogActivityInput!) {
    logActivity(input: $input) {
      id
      user {
        name
      }
      type
      timestamp
      status
      metadata
    }
  }
`;

// Mutation 10/14: UpdateActivity
export const UPDATE_ACTIVITY = gql`
  mutation UpdateActivity($updateActivityId: ID!, $input: ActivityInput!) {
    updateActivity(id: $updateActivityId, input: $input) {
      id
      user {
        id
        name
      }
      type
      timestamp
      status
      metadata
    }
  }
`;

// Mutation 11/14: DeleteActivity
export const DELETE_ACTIVITY = gql`
  mutation DeleteActivity($deleteActivityId: ID!) {
    deleteActivity(id: $deleteActivityId)
  }
`;
