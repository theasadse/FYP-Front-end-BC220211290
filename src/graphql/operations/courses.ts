import { gql } from "@apollo/client";

/**
 * GraphQL operations for admin-level course management.
 * @module CourseOperations
 */

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetch all courses with full nested data.
 * Auth: Required (any role)
 */
export const COURSES = gql`
  query Courses {
    courses {
      id
      title
      code
      description
      credits
      semester
      schedule
      enrolledStudentCount
      instructor {
        id
        name
        email
      }
      assignments {
        id
        title
        status
        dueDate
      }
      studentQueries {
        id
        subject
        status
        priority
      }
      announcements {
        id
        title
        priority
      }
      enrollments {
        id
        student {
          name
        }
        grade
        attendance
      }
      createdAt
      updatedAt
    }
  }
`;

/**
 * Fetch a single course by ID with full nested data.
 * Auth: Required (any role)
 */
export const COURSE = gql`
  query Course($id: ID!) {
    course(id: $id) {
      id
      title
      code
      description
      credits
      semester
      schedule
      enrolledStudentCount
      instructor {
        id
        name
        email
      }
      assignments {
        id
        title
        status
        dueDate
        totalMarks
        submissions
      }
      studentQueries {
        id
        subject
        status
        priority
        category
        student {
          name
        }
      }
      announcements {
        id
        title
        content
        priority
        createdAt
      }
      enrollments {
        id
        student {
          name
        }
        grade
        attendance
        enrolledAt
      }
      createdAt
      updatedAt
    }
  }
`;

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Create a new course.
 * Auth: ADMIN or SUPER_ADMIN
 */
export const CREATE_COURSE = gql`
  mutation CreateCourse($input: CreateCourseInput!) {
    createCourse(input: $input) {
      id
      title
      code
      credits
      semester
      schedule
      instructor {
        id
        name
      }
      createdAt
    }
  }
`;

/**
 * Update an existing course.
 * Auth: INSTRUCTOR (own course) or ADMIN+
 */
export const UPDATE_COURSE = gql`
  mutation UpdateCourse($id: ID!, $input: UpdateCourseInput!) {
    updateCourse(id: $id, input: $input) {
      id
      title
      description
      credits
      semester
      schedule
      instructor {
        id
        name
      }
    }
  }
`;

/**
 * Assign an instructor to a course.
 * Auth: ADMIN or SUPER_ADMIN
 */
export const ASSIGN_INSTRUCTOR = gql`
  mutation AssignInstructor($courseId: ID!, $instructorId: ID!) {
    assignInstructor(courseId: $courseId, instructorId: $instructorId) {
      id
      title
      code
      instructor {
        id
        name
        email
      }
    }
  }
`;

/**
 * Remove the instructor from a course.
 * Auth: ADMIN or SUPER_ADMIN
 */
export const REMOVE_INSTRUCTOR = gql`
  mutation RemoveInstructor($courseId: ID!) {
    removeInstructor(courseId: $courseId) {
      id
      title
      code
      instructor {
        id
        name
      }
    }
  }
`;
