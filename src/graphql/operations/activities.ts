import { gql } from '@apollo/client'

export const ACTIVITIES = gql`query Activities($limit: Int, $userId: Int) { activities(limit: $limit, userId: $userId) { id userId type metadata timestamp } }`
export const ACTIVITY = gql`query Activity($id: Int!) { activity(id: $id) { id userId type metadata timestamp } }`

export const LOG_ACTIVITY = gql`mutation LogActivity($input: ActivityInput!) { logActivity(input: $input) { id userId type metadata timestamp } }`
export const DELETE_ACTIVITY = gql`mutation DeleteActivity($id: Int!) { deleteActivity(id: $id) { id } }`
