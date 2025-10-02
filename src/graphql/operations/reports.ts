import { gql } from '@apollo/client'

export const REPORTS = gql`query Reports($userId: Int) { reports(userId: $userId) { id userId startDate endDate type createdAt } }`
export const CREATE_REPORT = gql`mutation CreateReport($input: ReportInput!) { createReport(input: $input) { id userId startDate endDate type createdAt } }`
