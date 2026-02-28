import { gql } from "@apollo/client";

/**
 * GraphQL queries and mutations for managing Activities.
 * @module ActivityOperations
 */

/**
 * Query to fetch a list of activities.
 *
 * @param {ID}     [userId] - Filter by user ID.
 * @param {String} [status] - Filter by status (Completed | Pending | In Progress | Overdue).
 * @param {Int}    [limit]  - Max number of activities to return.
 * @returns {object} The list of activities with their details.
 */
export const ACTIVITIES = gql`
  query Activities($userId: ID, $status: String, $limit: Int) {
    activities(userId: $userId, status: $status, limit: $limit) {
      id
      user {
        id
        name
        email
      }
      type
      timestamp
      status
      metadata
    }
  }
`;

/**
 * Query to fetch a single activity by ID.
 *
 * @param {ID} activityId - The ID of the activity to retrieve.
 * @returns {object} The activity details.
 */
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

/**
 * Query to fetch activities, optionally filtered by user ID.
 *
 * @param {ID} [userId] - Filter activities by this user ID.
 * @param {number} [limit] - The maximum number of activities to return.
 * @returns {object} The list of filtered activities.
 */
export const GET_ACTIVITIES = gql`
  query GetActivities($userId: ID, $limit: Int) {
    getActivities(userId: $userId, limit: $limit) {
      id
      user {
        id
        name
        email
      }
      type
      timestamp
      status
      metadata
    }
  }
`;

/**
 * Query to fetch dashboard statistics.
 *
 * @returns {object} Dashboard statistics including total activities, completion status, and breakdown by type.
 */
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

/**
 * Mutation to log a new activity.
 *
 * @param {LogActivityInput} input - The input data for the new activity.
 * @returns {object} The created activity object.
 */
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

/**
 * Mutation to update an existing activity.
 *
 * @param {ID} updateActivityId - The ID of the activity to update.
 * @param {ActivityInput} input - The new data for the activity.
 * @returns {object} The updated activity object.
 */
export const UPDATE_ACTIVITY = gql`
  mutation UpdateActivity($id: ID!, $input: ActivityInput!) {
    updateActivity(id: $id, input: $input) {
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

/**
 * Mutation to delete an activity.
 *
 * @param {ID} deleteActivityId - The ID of the activity to delete.
 * @returns {boolean} True if the deletion was successful.
 */
export const DELETE_ACTIVITY = gql`
  mutation DeleteActivity($id: ID!) {
    deleteActivity(id: $id)
  }
`;

/**
 * Subscription to listen for new activities being logged.
 *
 * @returns {object} The newly created activity.
 */
export const NEW_ACTIVITY_LOGGED = gql`
  subscription NewActivityLogged {
    newActivityLogged {
      id
      user {
        id
        name
      }
      type
      timestamp
      status
    }
  }
`;
