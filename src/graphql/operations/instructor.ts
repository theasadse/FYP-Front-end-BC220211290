import { gql } from "@apollo/client";

/**
 * GraphQL operations for instructor-specific course management.
 * @module InstructorOperations
 */

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetch the instructor dashboard overview.
 * Returns top-level stats, per-course breakdown, recent student queries, and upcoming deadlines.
 * Auth: INSTRUCTOR+
 */
export const INSTRUCTOR_DASHBOARD = gql`
  query InstructorDashboard {
    instructorDashboard {
      totalCourses
      totalStudents
      openQueries
      pendingAssignments
      averageAttendance
      courseBreakdown {
        courseId
        courseTitle
        courseCode
        studentCount
        openQueries
        averageAttendance
        assignmentsDue
      }
      recentQueries {
        id
        subject
        status
        priority
        student {
          name
        }
        course {
          code
        }
        createdAt
      }
      upcomingDeadlines {
        id
        title
        dueDate
        status
        course {
          code
          title
        }
      }
    }
  }
`;

/**
 * Fetch all courses assigned to the logged-in instructor with full nested data.
 * Auth: INSTRUCTOR+
 */
export const MY_COURSES = gql`
  query MyCourses {
    myCourses {
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
      }
      assignments {
        id
        title
        status
        dueDate
        totalMarks
        submissions
        createdAt
      }
      studentQueries {
        id
        subject
        message
        status
        priority
        category
        createdAt
        student {
          id
          name
          email
        }
        responses {
          id
          message
          instructor {
            name
          }
          createdAt
        }
      }
      announcements {
        id
        title
        content
        priority
        createdAt
        instructor {
          name
        }
      }
      enrollments {
        id
        student {
          id
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

/**
 * Fetch student queries for a specific course, optionally filtered by status.
 * Auth: INSTRUCTOR (own course) or ADMIN+
 */
export const COURSE_STUDENT_QUERIES = gql`
  query CourseStudentQueries($courseId: ID!, $status: String) {
    courseStudentQueries(courseId: $courseId, status: $status) {
      id
      subject
      message
      status
      priority
      category
      createdAt
      updatedAt
      student {
        id
        name
        email
      }
      course {
        id
        code
        title
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

/**
 * Fetch a single student query by ID.
 * Auth: Required (any role)
 */
export const STUDENT_QUERY = gql`
  query StudentQuery($id: ID!) {
    studentQuery(id: $id) {
      id
      subject
      message
      status
      priority
      category
      createdAt
      updatedAt
      student {
        id
        name
        email
      }
      course {
        id
        code
        title
        instructor {
          name
        }
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

/**
 * Fetch enrollments for a specific course.
 * Auth: INSTRUCTOR (own course) or ADMIN+
 */
export const COURSE_ENROLLMENTS = gql`
  query CourseEnrollments($courseId: ID!) {
    courseEnrollments(courseId: $courseId) {
      id
      enrolledAt
      grade
      attendance
      student {
        id
        name
        email
      }
      course {
        id
        code
        title
      }
    }
  }
`;

/**
 * Fetch assignments for a specific course.
 * Auth: INSTRUCTOR (own course) or ADMIN+
 */
export const COURSE_ASSIGNMENTS = gql`
  query CourseAssignments($courseId: ID!) {
    courseAssignments(courseId: $courseId) {
      id
      title
      description
      dueDate
      totalMarks
      status
      submissions
      createdAt
      course {
        id
        code
        title
      }
    }
  }
`;

/**
 * Fetch announcements for a specific course.
 * Auth: Required (any role)
 */
export const COURSE_ANNOUNCEMENTS = gql`
  query CourseAnnouncements($courseId: ID!) {
    courseAnnouncements(courseId: $courseId) {
      id
      title
      content
      priority
      createdAt
      course {
        id
        code
        title
      }
      instructor {
        id
        name
      }
    }
  }
`;

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Respond to a student query.
 * Side effects: auto-updates query status to "Answered", creates notification, publishes newQueryResponse.
 * Auth: INSTRUCTOR (own course) or ADMIN+
 */
export const RESPOND_TO_QUERY = gql`
  mutation RespondToQuery($input: RespondToQueryInput!) {
    respondToQuery(input: $input) {
      id
      message
      createdAt
      instructor {
        id
        name
      }
      query {
        id
        subject
        status
        student {
          name
        }
        course {
          code
        }
      }
    }
  }
`;

/**
 * Close a student query.
 * Auth: INSTRUCTOR (own course) or ADMIN+
 */
export const CLOSE_QUERY = gql`
  mutation CloseQuery($id: ID!) {
    closeQuery(id: $id) {
      id
      subject
      status
      student {
        name
      }
      responses {
        id
        message
        instructor {
          name
        }
      }
    }
  }
`;

/**
 * Create a new assignment for a course.
 * Auth: INSTRUCTOR (own course) or ADMIN+
 */
export const CREATE_ASSIGNMENT = gql`
  mutation CreateAssignment($input: CreateAssignmentInput!) {
    createAssignment(input: $input) {
      id
      title
      description
      dueDate
      totalMarks
      status
      course {
        id
        code
        title
      }
    }
  }
`;

/**
 * Update an existing assignment.
 * Auth: INSTRUCTOR (own course) or ADMIN+
 */
export const UPDATE_ASSIGNMENT = gql`
  mutation UpdateAssignment($id: ID!, $input: UpdateAssignmentInput!) {
    updateAssignment(id: $id, input: $input) {
      id
      title
      description
      dueDate
      totalMarks
      status
      course {
        id
        code
      }
    }
  }
`;

/**
 * Update a student's enrollment grade.
 * Auth: INSTRUCTOR (own course) or ADMIN+
 * Valid grades: A, A-, B+, B, B-, C+, C, C-, D, F
 */
export const UPDATE_ENROLLMENT_GRADE = gql`
  mutation UpdateEnrollmentGrade($input: UpdateEnrollmentGradeInput!) {
    updateEnrollmentGrade(input: $input) {
      id
      grade
      attendance
      student {
        id
        name
        email
      }
      course {
        id
        code
        title
      }
    }
  }
`;

/**
 * Post an announcement for a course.
 * Side effect: creates a notification for every enrolled student.
 * Auth: INSTRUCTOR (own course) or ADMIN+
 * Priority: Low | Normal (default) | High | Urgent
 */
export const POST_ANNOUNCEMENT = gql`
  mutation PostAnnouncement($input: PostAnnouncementInput!) {
    postAnnouncement(input: $input) {
      id
      title
      content
      priority
      createdAt
      course {
        id
        code
        title
      }
      instructor {
        id
        name
      }
    }
  }
`;

// ─── Subscriptions ────────────────────────────────────────────────────────────

/**
 * Real-time subscription for new student queries.
 * Optionally filter by courseId.
 */
export const NEW_STUDENT_QUERY = gql`
  subscription NewStudentQuery($courseId: ID) {
    newStudentQuery(courseId: $courseId) {
      id
      subject
      message
      status
      priority
      category
      createdAt
      student {
        id
        name
      }
      course {
        id
        code
        title
      }
    }
  }
`;

/**
 * Real-time subscription for new responses to student queries.
 * Optionally filter by queryId.
 */
export const NEW_QUERY_RESPONSE = gql`
  subscription NewQueryResponse($queryId: ID!) {
    newQueryResponse(queryId: $queryId) {
      id
      message
      createdAt
      instructor {
        id
        name
      }
      query {
        id
        subject
        status
      }
    }
  }
`;
