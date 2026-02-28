import { gql } from "@apollo/client";

/**
 * GraphQL operations for student-specific course management.
 * @module StudentOperations
 */

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetch all enrollments for the logged-in student.
 * Returns enrolled courses with grades, attendance, assignments, and announcements.
 * Auth: Required (any role — returns enrollments for the logged-in user)
 */
export const MY_ENROLLMENTS = gql`
  query MyEnrollments {
    myEnrollments {
      id
      grade
      attendance
      enrolledAt
      student {
        id
        name
        email
      }
      course {
        id
        code
        title
        description
        credits
        semester
        schedule
        instructor {
          id
          name
          email
        }
        assignments {
          id
          title
          dueDate
          status
        }
        announcements {
          id
          title
          priority
          createdAt
        }
      }
    }
  }
`;

/**
 * Fetch the logged-in student's own queries.
 * Optionally filter by courseId and/or status.
 * Auth: Required (returns only the logged-in student's queries)
 */
export const MY_QUERIES = gql`
  query MyQueries($courseId: ID, $status: String) {
    myQueries(courseId: $courseId, status: $status) {
      id
      subject
      message
      status
      priority
      category
      createdAt
      updatedAt
      course {
        id
        code
        title
      }
      student {
        id
        name
      }
      responses {
        id
        message
        createdAt
        instructor {
          id
          name
        }
      }
    }
  }
`;

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Submit a new student query to a course.
 * Auth: Required (student must be enrolled in the course)
 * Side effects:
 *   - Creates a notification for the course instructor
 *   - Publishes newStudentQuery subscription
 * Priority: Low | Normal (default) | High | Urgent
 * Category: General (default) | Assignment | Exam | Technical | Other
 */
export const SUBMIT_QUERY = gql`
  mutation SubmitQuery($input: SubmitQueryInput!) {
    submitQuery(input: $input) {
      id
      subject
      message
      status
      priority
      category
      createdAt
      course {
        id
        code
        title
      }
      student {
        id
        name
      }
    }
  }
`;
