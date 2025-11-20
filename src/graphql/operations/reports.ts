import { gql } from '@apollo/client'

// Query 6/11: Reports
export const REPORTS = gql`
  query Reports($userId: ID) {
    reports(userId: $userId) {
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
`

// Query 7/11: Report (single)
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
`

// Mutation 12/14: CreateReport
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
`

// Mutation 13/14: UpdateReport
export const UPDATE_REPORT = gql`
  mutation UpdateReport($updateReportId: ID!, $input: UpdateReportInput!) {
    updateReport(id: $updateReportId, input: $input) {
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
`

// Mutation 14/14: DeleteReport
export const DELETE_REPORT = gql`
  mutation DeleteReport($deleteReportId: ID!) {
    deleteReport(id: $deleteReportId) {
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
`
