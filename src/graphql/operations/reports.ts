import { gql } from "@apollo/client";

/**
 * GraphQL queries and mutations for managing Reports.
 * @module ReportOperations
 */

/**
 * Query to fetch a list of reports.
 *
 * @param {ID} [userId] - Filter reports by this user ID.
 * @returns {object} The list of reports with their details.
 */
export const REPORTS = gql`
  query Reports($userId: ID) {
    reports(userId: $userId) {
      id
      user {
        id
        name
        email
      }
      start_date
      end_date
      type
      content
    }
  }
`;

/**
 * Query to fetch a single report by ID.
 *
 * @param {ID} reportId - The ID of the report to retrieve.
 * @returns {object} The report details.
 */
export const REPORT = gql`
  query Report($reportId: ID!) {
    report(id: $reportId) {
      id
      user {
        name
        id
      }
      start_date
      end_date
      type
      content
    }
  }
`;

/**
 * Mutation to create a new report.
 *
 * @param {CreateReportInput} input - The data for the new report.
 * @returns {object} The created report object.
 */
export const CREATE_REPORT = gql`
  mutation CreateReport($input: CreateReportInput!) {
    createReport(input: $input) {
      id
      user {
        id
        name
      }
      start_date
      end_date
      type
      content
    }
  }
`;

/**
 * Mutation to update an existing report.
 *
 * @param {ID} updateReportId - The ID of the report to update.
 * @param {UpdateReportInput} input - The new data for the report.
 * @returns {object} The updated report object.
 */
export const UPDATE_REPORT = gql`
  mutation UpdateReport($id: ID!, $input: UpdateReportInput!) {
    updateReport(id: $id, input: $input) {
      id
      user {
        name
      }
      start_date
      end_date
      type
      content
    }
  }
`;

/**
 * Mutation to delete a report.
 *
 * @param {ID} id - The ID of the report to delete.
 * @returns {object} The deleted report ID.
 */
export const DELETE_REPORT = gql`
  mutation DeleteReport($id: ID!) {
    deleteReport(id: $id) {
      id
    }
  }
`;
