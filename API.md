# Course Instructor Management System — Complete GraphQL API Reference

**Endpoint:** `http://localhost:4000/graphql`
**WebSocket:** `ws://localhost:4000/graphql`
**Protocol:** GraphQL over HTTP · graphql-ws (subscriptions)

---

## Table of Contents

- [Full GraphQL Schema](#full-graphql-schema)

1. [Authentication](#1--authentication)
2. [User & Role Management](#2--user--role-management)
3. [Course Management (Admin)](#3--course-management-admin)
4. [Instructor Course Management](#4--instructor-course-management)
5. [Student Course Management](#5--student-course-management)
6. [Student Queries & Responses](#6--student-queries--responses)
7. [Assignments](#7--assignments)
8. [Enrollments & Grading](#8--enrollments--grading)
9. [Announcements](#9--announcements)
10. [Activity Logging & Tracking](#10--activity-logging--tracking)
11. [Dashboard & Statistics](#11--dashboard--statistics)
12. [Notifications](#12--notifications)
13. [Reports](#13--reports)
14. [Subscriptions (Real-time)](#14--subscriptions-real-time)
15. [Object Types](#15--object-types)
16. [Input Types](#16--input-types)
17. [Error Reference](#17--error-reference)
18. [Environment Variables](#18--environment-variables)
19. [Seed & Demo Data](#19--seed--demo-data)

---

## Quick-Start for Frontend

```
Step 1  → mutation login                 → get JWT token
Step 2  → store token as header          → Authorization: Bearer <token>
Step 3  → query instructorDashboard      → instructor home screen
Step 4  → query myCourses               → course cards with queries/assignments
Step 5  → query courseStudentQueries     → student Q&A inbox
Step 6  → mutation respondToQuery        → answer a student question
Step 7  → query notifications            → notification bell
Step 8  → subscribe notificationReceived → live updates (WebSocket)
Step 9  → mutation checkDeadlines        → trigger deadline alerts on login
Step 10 → mutation createReport          → generate analytics report
```

---

## Authentication

All protected operations require a Bearer token:

```http
Authorization: Bearer <your-jwt-token>
```

Tokens are returned by `login` and `register`. Valid for **7 days** (JWT).

For WebSocket subscriptions, pass the token in connection params:

```json
{ "Authorization": "Bearer <your-jwt-token>" }
```

### Role Hierarchy

| Role          | Level | Access                                            |
| ------------- | ----- | ------------------------------------------------- |
| `SUPER_ADMIN` | 4     | Everything                                        |
| `ADMIN`       | 3     | User/role/course management                       |
| `INSTRUCTOR`  | 2     | Own courses, activities, reports, student queries |
| `STUDENT`     | 1     | Enrolled courses, submit queries                  |
| `VIEWER`      | 1     | Read-only                                         |

---

## API Summary

| Category              | Queries | Mutations | Subscriptions | Total  |
| --------------------- | ------- | --------- | ------------- | ------ |
| Auth                  | 1       | 2         | —             | 3      |
| Users & Roles         | 3       | 6         | —             | 9      |
| Courses (Admin)       | 2       | 4         | —             | 6      |
| Instructor Management | 6       | 1         | —             | 7      |
| Student Management    | 2       | 1         | —             | 3      |
| Student Queries       | 1       | 2         | 1             | 4      |
| Assignments           | 1       | 2         | —             | 3      |
| Enrollments           | 1       | 1         | —             | 2      |
| Announcements         | 1       | 1         | —             | 2      |
| Activities            | 3       | 3         | 1             | 7      |
| Dashboard             | 1       | —         | —             | 1      |
| Notifications         | 1       | 2         | 1             | 4      |
| Reports               | 2       | 3         | —             | 5      |
| **TOTAL**             | **25**  | **28**    | **4**         | **57** |

---

## Full GraphQL Schema

The complete schema definition used by the backend (`src/graphql/typeDefs.ts`):

```graphql
scalar JSON

# ─── Object Types ─────────────────────────────────────────

type Role {
  id: ID!
  name: String!
}

type User {
  id: ID!
  name: String!
  email: String!
  role: Role!
}

type Activity {
  id: ID!
  user: User!
  type: String!
  timestamp: String!
  status: String!
  metadata: JSON
}

type Course {
  id: ID!
  title: String!
  code: String!
  description: String
  credits: Int!
  semester: String
  schedule: String
  enrolledStudentCount: Int!
  instructor: User
  createdAt: String!
  updatedAt: String!
  assignments: [Assignment!]
  announcements: [CourseAnnouncement!]
  studentQueries: [StudentQuery!]
  enrollments: [Enrollment!]
}

type Enrollment {
  id: ID!
  course: Course!
  student: User!
  enrolledAt: String!
  grade: String
  attendance: Float!
}

type StudentQuery {
  id: ID!
  course: Course!
  student: User!
  subject: String!
  message: String!
  status: String! # "Open" | "Answered" | "Closed"
  priority: String! # "Low" | "Normal" | "High" | "Urgent"
  category: String! # "General" | "Assignment" | "Exam" | "Technical" | "Other"
  createdAt: String!
  updatedAt: String!
  responses: [InstructorResponse!]
}

type InstructorResponse {
  id: ID!
  query: StudentQuery!
  instructor: User!
  message: String!
  createdAt: String!
}

type CourseAnnouncement {
  id: ID!
  course: Course!
  instructor: User!
  title: String!
  content: String!
  priority: String! # "Low" | "Normal" | "High" | "Urgent"
  createdAt: String!
}

type Assignment {
  id: ID!
  course: Course!
  title: String!
  description: String
  dueDate: String!
  totalMarks: Int!
  status: String! # "Active" | "Closed" | "Graded"
  submissions: Int!
  createdAt: String!
}

type InstructorDashboard {
  totalCourses: Int!
  totalStudents: Int!
  openQueries: Int!
  pendingAssignments: Int!
  averageAttendance: Float!
  courseBreakdown: [CourseStats!]!
  recentQueries: [StudentQuery!]!
  upcomingDeadlines: [Assignment!]!
}

type CourseStats {
  courseId: ID!
  courseTitle: String!
  courseCode: String!
  studentCount: Int!
  openQueries: Int!
  averageAttendance: Float!
  assignmentsDue: Int!
}

type Notification {
  id: ID!
  user: User!
  message: String!
  isRead: Boolean!
  createdAt: String!
  metadata: JSON
}

type Report {
  id: ID!
  user: User!
  start_date: String!
  end_date: String!
  type: String!
  content: JSON
}

type DashboardStats {
  totalActivities: Int!
  completedActivities: Int!
  pendingActivities: Int!
  perType: [ActivityTypeCount!]!
}

type ActivityTypeCount {
  type: String!
  count: Int!
}

type AuthPayload {
  token: String!
  user: User!
}

type DeadlineCheckResult {
  processed: Int!
  notificationsSent: Int!
}

# ─── Input Types ──────────────────────────────────────────

input RegisterInput {
  name: String!
  email: String!
  password: String!
  roleName: String!
}

input LoginInput {
  email: String!
  password: String!
}

input LogActivityInput {
  userId: ID!
  type: String!
  metadata: JSON
}

input ActivityInput {
  userId: ID!
  type: String!
  status: String
  metadata: JSON
}

input CreateUserInput {
  name: String!
  email: String!
  password: String!
  roleName: String!
}

input UpdateUserInput {
  name: String
  email: String
  password: String
  roleName: String
}

input CreateCourseInput {
  title: String!
  code: String!
  description: String
  credits: Int
  semester: String
  schedule: String
  instructorId: ID
}

input UpdateCourseInput {
  title: String
  description: String
  credits: Int
  semester: String
  schedule: String
}

input RespondToQueryInput {
  queryId: ID!
  message: String!
}

input PostAnnouncementInput {
  courseId: ID!
  title: String!
  content: String!
  priority: String # "Low" | "Normal" | "High" | "Urgent" — defaults to "Normal"
}

input CreateAssignmentInput {
  courseId: ID!
  title: String!
  description: String
  dueDate: String!
  totalMarks: Int # defaults to 100
}

input UpdateAssignmentInput {
  title: String
  description: String
  dueDate: String
  totalMarks: Int
  status: String # "Active" | "Closed" | "Graded"
}

input UpdateEnrollmentGradeInput {
  enrollmentId: ID!
  grade: String! # A, A-, B+, B, B-, C+, C, C-, D, F
}

input CreateReportInput {
  userId: ID!
  startDate: String!
  endDate: String!
  type: String!
}

input UpdateReportInput {
  startDate: String!
  endDate: String!
  type: String!
}

input SubmitQueryInput {
  courseId: ID!
  subject: String!
  message: String!
  priority: String # "Low" | "Normal" (default) | "High" | "Urgent"
  category: String # "General" (default) | "Assignment" | "Exam" | "Technical" | "Other"
}

# ─── Root Query ───────────────────────────────────────────

type Query {
  # Auth
  me: User

  # Users & Roles
  users: [User!]!
  user(id: ID!): User
  roles: [Role!]!

  # Activities
  activities(userId: ID, status: String, limit: Int): [Activity!]!
  activity(id: ID!): Activity
  getActivities(userId: ID, limit: Int): [Activity!]!

  # Notifications
  notifications(limit: Int, offset: Int): [Notification!]!

  # Reports
  reports(userId: ID): [Report!]!
  report(id: ID!): Report

  # Course Management
  courses: [Course!]!
  course(id: ID!): Course

  # Instructor Course Management
  myCourses: [Course!]!
  courseStudentQueries(courseId: ID!, status: String): [StudentQuery!]!
  courseEnrollments(courseId: ID!): [Enrollment!]!
  courseAssignments(courseId: ID!): [Assignment!]!
  courseAnnouncements(courseId: ID!): [CourseAnnouncement!]!
  instructorDashboard: InstructorDashboard!
  studentQuery(id: ID!): StudentQuery

  # Student Course Management
  myQueries(courseId: ID, status: String): [StudentQuery!]!
  myEnrollments: [Enrollment!]!

  # Dashboard
  getDashboardStats: DashboardStats!
}

# ─── Root Mutation ────────────────────────────────────────

type Mutation {
  # Auth
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!

  # Activity
  logActivity(input: LogActivityInput!): Activity!
  updateActivity(id: ID!, input: ActivityInput!): Activity!
  deleteActivity(id: ID!): Boolean!

  # User & Role Management
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
  createRole(name: String!): Role!
  updateRole(id: ID!, name: String!): Role!
  deleteRole(id: ID!): Boolean!

  # Notifications
  markNotificationRead(id: ID, all: Boolean): Boolean!
  checkDeadlines: DeadlineCheckResult!

  # Reports
  createReport(input: CreateReportInput!): Report!
  updateReport(id: ID!, input: UpdateReportInput!): Report!
  deleteReport(id: ID!): Report!

  # Course Management (Admin)
  createCourse(input: CreateCourseInput!): Course!
  updateCourse(id: ID!, input: UpdateCourseInput!): Course!
  assignInstructor(courseId: ID!, instructorId: ID!): Course!
  removeInstructor(courseId: ID!): Course!

  # Student Course Management
  submitQuery(input: SubmitQueryInput!): StudentQuery!

  # Instructor Course Management
  respondToQuery(input: RespondToQueryInput!): InstructorResponse!
  closeQuery(id: ID!): StudentQuery!
  postAnnouncement(input: PostAnnouncementInput!): CourseAnnouncement!
  createAssignment(input: CreateAssignmentInput!): Assignment!
  updateAssignment(id: ID!, input: UpdateAssignmentInput!): Assignment!
  updateEnrollmentGrade(input: UpdateEnrollmentGradeInput!): Enrollment!
}

# ─── Root Subscription ───────────────────────────────────

type Subscription {
  newActivityLogged: Activity!
  notificationReceived: Notification!
  newStudentQuery(courseId: ID): StudentQuery!
  newQueryResponse(queryId: ID!): InstructorResponse!
}
```

---

# 1 — Authentication

### 1.1 `login` (Mutation)

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      name
      email
      role {
        id
        name
      }
    }
  }
}
```

**Variables:**

```json
{
  "input": {
    "email": "sarah.thompson@university.edu",
    "password": "password123"
  }
}
```

- **Auth:** None
- **Returns:** JWT token + user object

---

### 1.2 `register` (Mutation)

```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      name
      email
      role {
        id
        name
      }
    }
  }
}
```

**Variables:**

```json
{
  "input": {
    "name": "Sara Ahmed",
    "email": "sara@university.edu",
    "password": "securepass123",
    "roleName": "INSTRUCTOR"
  }
}
```

- **Auth:** None
- **`roleName`:** `SUPER_ADMIN` | `ADMIN` | `INSTRUCTOR` | `STUDENT` | `VIEWER`

---

### 1.3 `me` (Query)

```graphql
query Me {
  me {
    id
    name
    email
    role {
      id
      name
    }
  }
}
```

- **Auth:** Required (any role)
- **Returns:** Current user or `null` if token invalid

---

# 2 — User & Role Management

### 2.1 `users` (Query)

```graphql
query Users {
  users {
    id
    name
    email
    role {
      id
      name
    }
  }
}
```

- **Auth:** `ADMIN`+

---

### 2.2 `user` (Query)

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    role {
      id
      name
    }
  }
}
```

- **Auth:** Own account OR `ADMIN`+

---

### 2.3 `roles` (Query)

```graphql
query Roles {
  roles {
    id
    name
  }
}
```

- **Auth:** None required

---

### 2.4 `createUser` (Mutation)

```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
    role {
      id
      name
    }
  }
}
```

**Variables:**

```json
{
  "input": {
    "name": "John Doe",
    "email": "john@university.edu",
    "password": "pass123",
    "roleName": "INSTRUCTOR"
  }
}
```

- **Auth:** `ADMIN`+

---

### 2.5 `updateUser` (Mutation)

```graphql
mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    name
    email
    role {
      id
      name
    }
  }
}
```

**Variables:**

```json
{ "id": "<user-uuid>", "input": { "name": "John Smith" } }
```

- **Auth:** Own account OR `ADMIN`+
- All fields optional: `name`, `email`, `password`, `roleName`

---

### 2.6 `deleteUser` (Mutation)

```graphql
mutation DeleteUser($id: ID!) {
  deleteUser(id: $id)
}
```

- **Auth:** `ADMIN`+
- **Returns:** `Boolean`

---

### 2.7 `createRole` (Mutation)

```graphql
mutation CreateRole {
  createRole(name: "LEAD_INSTRUCTOR") {
    id
    name
  }
}
```

- **Auth:** `ADMIN`+

---

### 2.8 `updateRole` (Mutation)

```graphql
mutation UpdateRole {
  updateRole(id: "2", name: "SENIOR_INSTRUCTOR") {
    id
    name
  }
}
```

- **Auth:** `ADMIN`+

---

### 2.9 `deleteRole` (Mutation)

```graphql
mutation DeleteRole {
  deleteRole(id: "2")
}
```

- **Auth:** `ADMIN`+
- **Returns:** `Boolean`
- **Note:** Fails if users are still assigned to the role

---

# 3 — Course Management (Admin)

### 3.1 `courses` (Query)

```graphql
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
```

- **Auth:** Required (any role)
- **Returns:** All courses with full nested data

---

### 3.2 `course` (Query)

```graphql
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
```

- **Auth:** Required (any role)

---

### 3.3 `createCourse` (Mutation)

```graphql
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
```

**Variables:**

```json
{
  "input": {
    "title": "Machine Learning",
    "code": "CS501",
    "description": "Introduction to ML concepts.",
    "credits": 4,
    "semester": "Spring 2026",
    "schedule": "Mon/Wed 10:00-11:30 AM",
    "instructorId": "<user-uuid>"
  }
}
```

- **Auth:** `ADMIN` or `SUPER_ADMIN`
- `instructorId`, `semester`, `schedule` are optional

---

### 3.4 `updateCourse` (Mutation)

```graphql
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
```

**Variables:**

```json
{
  "id": "<course-uuid>",
  "input": {
    "title": "Advanced Machine Learning",
    "semester": "Fall 2026",
    "schedule": "Tue/Thu 2:00-3:30 PM"
  }
}
```

- **Auth:** `INSTRUCTOR` (own course) or `ADMIN`+
- All fields optional: `title`, `description`, `credits`, `semester`, `schedule`

---

### 3.5 `assignInstructor` (Mutation)

```graphql
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
```

- **Auth:** `ADMIN` or `SUPER_ADMIN`

---

### 3.6 `removeInstructor` (Mutation)

```graphql
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
```

- **Auth:** `ADMIN` or `SUPER_ADMIN`
- Sets `instructor` to `null`

---

# 4 — Instructor Course Management

### 4.1 `myCourses` (Query) ⭐

```graphql
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
```

- **Auth:** `INSTRUCTOR`+ (returns only courses assigned to the logged-in instructor)

---

### 4.2 `instructorDashboard` (Query) ⭐

```graphql
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
```

- **Auth:** `INSTRUCTOR`+
- **Returns:** Complete instructor overview — stats, per-course breakdown, open queries, upcoming deadlines

**Example response:**

```json
{
  "data": {
    "instructorDashboard": {
      "totalCourses": 2,
      "totalStudents": 54,
      "openQueries": 9,
      "pendingAssignments": 4,
      "averageAttendance": 75.37,
      "courseBreakdown": [
        {
          "courseCode": "CS101",
          "courseTitle": "Introduction to Computer Science",
          "studentCount": 26,
          "openQueries": 6,
          "averageAttendance": 73.96,
          "assignmentsDue": 2
        }
      ],
      "recentQueries": [],
      "upcomingDeadlines": []
    }
  }
}
```

---

### 4.3 `courseStudentQueries` (Query)

```graphql
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
```

**Variables:**

```json
{ "courseId": "<course-uuid>", "status": "Open" }
```

- **Auth:** `INSTRUCTOR` (own course) or `ADMIN`+
- **`status` filter:** `Open` | `Answered` | `Closed` | omit for all

---

### 4.4 `studentQuery` (Query)

```graphql
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
```

- **Auth:** Required (any role)

---

### 4.5 `courseEnrollments` (Query)

```graphql
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
```

- **Auth:** `INSTRUCTOR` (own course) or `ADMIN`+

---

### 4.6 `courseAssignments` (Query)

```graphql
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
```

- **Auth:** `INSTRUCTOR` (own course) or `ADMIN`+

---

### 4.7 `courseAnnouncements` (Query)

```graphql
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
```

- **Auth:** Required (any role)

---

# 5 — Student Course Management

### 5.1 `myEnrollments` (Query) ⭐

```graphql
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
```

- **Auth:** Required (any role — returns enrollments for the logged-in user)
- **Returns:** All courses the student is enrolled in, with grades, attendance, assignments, and announcements

---

### 5.2 `myQueries` (Query) ⭐

```graphql
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
```

**Variables:**

```json
{ "courseId": "<course-uuid>", "status": "Open" }
```

- **Auth:** Required (returns only the logged-in student's queries)
- **Filters:** Both `courseId` and `status` are optional
- **`status` values:** `Open` | `Answered` | `Closed` | omit for all

---

### 5.3 `submitQuery` (Mutation) ⭐

```graphql
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
```

**Variables:**

```json
{
  "input": {
    "courseId": "<course-uuid>",
    "subject": "Need help with lab assignment",
    "message": "I am stuck on the socket programming exercise. Can you help?",
    "priority": "High",
    "category": "Assignment"
  }
}
```

- **Auth:** Required (student must be enrolled in the course)
- **`priority`:** `Low` | `Normal` (default) | `High` | `Urgent`
- **`category`:** `General` (default) | `Assignment` | `Exam` | `Technical` | `Other`
- **Side effects:**
  - Creates a notification for the course instructor
  - Publishes `newStudentQuery` subscription
- **Errors:**
  - `You are not enrolled in this course` — student not enrolled
  - `This course has no assigned instructor` — course has no instructor

---

# 6 — Student Queries & Responses

### 6.1 `respondToQuery` (Mutation) ⭐

```graphql
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
```

**Variables:**

```json
{
  "input": {
    "queryId": "<student-query-uuid>",
    "message": "Great question! Please refer to Chapter 5 in the textbook."
  }
}
```

- **Auth:** `INSTRUCTOR` (own course) or `ADMIN`+
- **Side effects:**
  - Auto-updates query status to `"Answered"`
  - Creates a notification for the student
  - Publishes `newQueryResponse` subscription

---

### 6.2 `closeQuery` (Mutation)

```graphql
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
```

- **Auth:** `INSTRUCTOR` (own course) or `ADMIN`+
- Sets query status to `"Closed"`

---

# 7 — Assignments

### 7.1 `createAssignment` (Mutation)

```graphql
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
```

**Variables:**

```json
{
  "input": {
    "courseId": "<course-uuid>",
    "title": "Midterm Project",
    "description": "Build a REST API using Express and Prisma",
    "dueDate": "2026-04-15",
    "totalMarks": 100
  }
}
```

- **Auth:** `INSTRUCTOR` (own course) or `ADMIN`+
- `totalMarks` defaults to `100` if omitted

---

### 7.2 `updateAssignment` (Mutation)

```graphql
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
```

**Variables:**

```json
{
  "id": "<assignment-uuid>",
  "input": {
    "title": "Midterm Project (Updated)",
    "dueDate": "2026-04-20",
    "status": "Closed"
  }
}
```

- **Auth:** `INSTRUCTOR` (own course) or `ADMIN`+
- All fields optional: `title`, `description`, `dueDate`, `totalMarks`, `status`
- **`status` values:** `Active` | `Closed` | `Graded`

---

# 8 — Enrollments & Grading

### 8.1 `updateEnrollmentGrade` (Mutation) ⭐

```graphql
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
```

**Variables:**

```json
{
  "input": {
    "enrollmentId": "<enrollment-uuid>",
    "grade": "A"
  }
}
```

- **Auth:** `INSTRUCTOR` (own course) or `ADMIN`+
- **Valid grades:** `A`, `A-`, `B+`, `B`, `B-`, `C+`, `C`, `C-`, `D`, `F`

---

# 9 — Announcements

### 9.1 `postAnnouncement` (Mutation) ⭐

```graphql
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
```

**Variables:**

```json
{
  "input": {
    "courseId": "<course-uuid>",
    "title": "Quiz Next Monday",
    "content": "Surprise quiz covering chapters 6-8. Prepare well!",
    "priority": "High"
  }
}
```

- **Auth:** `INSTRUCTOR` (own course) or `ADMIN`+
- **`priority`:** `Low` | `Normal` (default) | `High` | `Urgent`
- **Side effect:** Creates a notification for every enrolled student

---

# 10 — Activity Logging & Tracking

### 10.1 `activities` (Query)

```graphql
query Activities($userId: ID, $status: String, $limit: Int) {
  activities(userId: $userId, status: $status, limit: $limit) {
    id
    type
    timestamp
    status
    metadata
    user {
      id
      name
      email
    }
  }
}
```

**Variables:**

```json
{ "userId": "<uuid>", "status": "Pending", "limit": 50 }
```

- **Auth:** Required
- **`status` filter:** `Completed` | `Pending` | `In Progress` | `Overdue`

---

### 10.2 `activity` (Query)

```graphql
query Activity($id: ID!) {
  activity(id: $id) {
    id
    type
    timestamp
    status
    metadata
    user {
      id
      name
      email
    }
  }
}
```

---

### 10.3 `getActivities` (Query)

```graphql
query GetActivities($userId: ID, $limit: Int) {
  getActivities(userId: $userId, limit: $limit) {
    id
    type
    timestamp
    status
    metadata
    user {
      id
      name
      email
    }
  }
}
```

- **Auth:** Required
- Use this for the instructor's activity log table

---

### 10.4 `logActivity` (Mutation) ⭐

```graphql
mutation LogActivity($input: LogActivityInput!) {
  logActivity(input: $input) {
    id
    type
    timestamp
    status
    metadata
    user {
      id
      name
    }
  }
}
```

**Variables:**

```json
{
  "input": {
    "userId": "<instructor-uuid>",
    "type": "MDB Reply",
    "metadata": {
      "thread_id": "abc123",
      "reply_delay_minutes": 15,
      "course_code": "CS101"
    }
  }
}
```

- **Auth:** Required — can only log for own `userId` unless `ADMIN`+
- **Side effect:** Auto-creates a notification pushed via WebSocket

#### LMS Activity Types

| Category                    | `type` values                                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Discussion Board**        | `MDB Reply`, `MDB Thread Created`, `MDB Post Moderated`, `MDB Announcement Posted`                                                      |
| **Assignments**             | `Assignment Upload`, `Assignment Graded`, `Assignment Feedback Given`, `Assignment Extension Granted`, `Assignment Deadline Updated`    |
| **Support & Communication** | `Ticket Response`, `Ticket Escalated`, `Email Sent`, `Email Broadcast`, `Office Hours Held`                                             |
| **Live Sessions**           | `GDB Session`, `Zoom Lecture`, `Recorded Lecture Uploaded`, `Lab Session Conducted`, `Quiz Invigilated`                                 |
| **Assessment**              | `Grading Completed`, `Marks Uploaded to Portal`, `Plagiarism Check Run`, `Re-checking Request Processed`, `Grade Appeal Reviewed`       |
| **Course Management**       | `Course Material Uploaded`, `Course Outline Updated`, `Student Enrolled Manually`, `Attendance Marked`, `Syllabus Revision Submitted`   |
| **Instructor Actions**      | `Lecture Delivered`, `Quiz Conducted`, `Office Hours`, `Student Meeting`, `Exam Paper Prepared`, `Project Review`, `Curriculum Updated` |

#### Suggested `metadata` shapes per type

| Type                   | Key metadata fields                                                     |
| ---------------------- | ----------------------------------------------------------------------- |
| `MDB Reply`            | `thread_id`, `reply_delay_minutes`, `word_count`, `student_email`       |
| `Assignment Graded`    | `assignment_name`, `submissions_graded`, `total_marks`, `average_score` |
| `Ticket Response`      | `ticket_id`, `response_duration_minutes`, `resolved`                    |
| `GDB Session`          | `session_duration_minutes`, `attendees`, `topic`, `platform`            |
| `Email Broadcast`      | `recipients`, `subject`, `open_rate_pct`                                |
| `Attendance Marked`    | `week_number`, `present_count`, `absent_count`, `late_count`            |
| `Plagiarism Check Run` | `tool`, `submissions_checked`, `flagged_count`                          |
| `Zoom Lecture`         | `duration_minutes`, `attendees`, `recording_link`                       |

---

### 10.5 `updateActivity` (Mutation)

```graphql
mutation UpdateActivity($id: ID!, $input: ActivityInput!) {
  updateActivity(id: $id, input: $input) {
    id
    type
    status
    timestamp
    metadata
  }
}
```

**Variables:**

```json
{
  "id": "<activity-uuid>",
  "input": {
    "userId": "<user-uuid>",
    "type": "MDB Reply",
    "status": "Completed",
    "metadata": { "resolved": true }
  }
}
```

- **Auth:** Own activity OR `ADMIN`+

---

### 10.6 `deleteActivity` (Mutation)

```graphql
mutation DeleteActivity($id: ID!) {
  deleteActivity(id: $id)
}
```

- **Auth:** Own activity OR `ADMIN`+
- **Returns:** `Boolean`

---

# 11 — Dashboard & Statistics

### 11.1 `getDashboardStats` (Query) ⭐

```graphql
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
```

- **Auth:** Required
- **Scoped** to the logged-in user's activities
- `pendingActivities` = count of `Pending` + `In Progress` + `Overdue`

**Example response:**

```json
{
  "data": {
    "getDashboardStats": {
      "totalActivities": 87,
      "completedActivities": 62,
      "pendingActivities": 25,
      "perType": [
        { "type": "Lecture Delivered", "count": 18 },
        { "type": "Assignment Graded", "count": 14 },
        { "type": "Query Answered", "count": 10 }
      ]
    }
  }
}
```

---

# 12 — Notifications

### 12.1 `notifications` (Query)

```graphql
query Notifications($limit: Int, $offset: Int) {
  notifications(limit: $limit, offset: $offset) {
    id
    message
    isRead
    createdAt
    metadata
    user {
      id
      name
    }
  }
}
```

**Variables:**

```json
{ "limit": 20, "offset": 0 }
```

- **Auth:** Required — returns notifications for the **logged-in user only**, newest first

---

### 12.2 `checkDeadlines` (Mutation) ⭐

```graphql
mutation CheckDeadlines {
  checkDeadlines {
    processed
    notificationsSent
  }
}
```

- **Auth:** Required
- **Logic:** Finds `Pending` activities older than 7 days, creates a notification for each
- **Frontend:** Call on every login

---

### 12.3 `markNotificationRead` (Mutation)

```graphql
mutation MarkNotificationRead($id: ID, $all: Boolean) {
  markNotificationRead(id: $id, all: $all)
}
```

Mark single:

```json
{ "id": "<notification-uuid>" }
```

Mark all as read ("Clear all" button):

```json
{ "all": true }
```

- **Returns:** `Boolean`

---

# 13 — Reports

### 13.1 `reports` (Query)

```graphql
query Reports($userId: ID) {
  reports(userId: $userId) {
    id
    start_date
    end_date
    type
    content
    user {
      id
      name
      email
    }
  }
}
```

- **Auth:** Own reports OR `ADMIN`+

---

### 13.2 `report` (Query)

```graphql
query Report($id: ID!) {
  report(id: $id) {
    id
    start_date
    end_date
    type
    content
    user {
      id
      name
    }
  }
}
```

---

### 13.3 `createReport` (Mutation) ⭐

```graphql
mutation CreateReport($input: CreateReportInput!) {
  createReport(input: $input) {
    id
    start_date
    end_date
    type
    content
    user {
      id
      name
    }
  }
}
```

**Variables:**

```json
{
  "input": {
    "userId": "<user-uuid>",
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-03-31T23:59:59Z",
    "type": "Monthly Activity Summary"
  }
}
```

- **Auth:** Own user OR `ADMIN`+
- **Auto-generates `content`:**

```json
{
  "generatedAt": "2026-04-01T10:00:00Z",
  "stats": {
    "total": 45,
    "completed": 38,
    "pending": 7,
    "byType": { "Lecture Delivered": 12, "Assignment Graded": 8 }
  },
  "activityLog": [
    {
      "id": "...",
      "type": "Lecture Delivered",
      "status": "Completed",
      "timestamp": "2026-01-15T14:30:00Z"
    }
  ]
}
```

---

### 13.4 `updateReport` (Mutation)

```graphql
mutation UpdateReport($id: ID!, $input: UpdateReportInput!) {
  updateReport(id: $id, input: $input) {
    id
    start_date
    end_date
    type
  }
}
```

**Variables:**

```json
{
  "id": "<report-uuid>",
  "input": {
    "startDate": "2026-02-01T00:00:00Z",
    "endDate": "2026-04-30T23:59:59Z",
    "type": "Quarterly Review"
  }
}
```

---

### 13.5 `deleteReport` (Mutation)

```graphql
mutation DeleteReport($id: ID!) {
  deleteReport(id: $id) {
    id
  }
}
```

- **Auth:** Own report OR `ADMIN`+

---

# 14 — Subscriptions (Real-time)

All subscriptions use **WebSocket** at `ws://localhost:4000/graphql` with `graphql-ws` protocol.

Pass auth token in connection params:

```json
{ "Authorization": "Bearer <token>" }
```

### 14.1 `notificationReceived` ⭐

```graphql
subscription NotificationReceived {
  notificationReceived {
    id
    message
    isRead
    createdAt
    metadata
    user {
      id
      name
    }
  }
}
```

- Fires when `logActivity`, `checkDeadlines`, `respondToQuery`, or `postAnnouncement` creates a notification
- Only delivers to the authenticated user

---

### 14.2 `newActivityLogged`

```graphql
subscription NewActivityLogged {
  newActivityLogged {
    id
    type
    timestamp
    status
    user {
      id
      name
    }
  }
}
```

- Fires when any new activity is logged

---

### 14.3 `newStudentQuery`

```graphql
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
```

- Optionally filter by `courseId`
- Useful for instructors to receive real-time student questions

---

### 14.4 `newQueryResponse`

```graphql
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
```

- Fires when an instructor responds to a specific query
- Useful for students waiting for an answer

---

# 15 — Object Types

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  role: Role!
}

type Role {
  id: ID!
  name: String! # "SUPER_ADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT" | "VIEWER"
}

type Course {
  id: ID!
  title: String!
  code: String! # unique, e.g. "CS101"
  description: String
  credits: Int!
  semester: String # e.g. "Spring 2026"
  schedule: String # e.g. "Mon/Wed 10:00-11:30 AM"
  enrolledStudentCount: Int!
  instructor: User # nullable — may be unassigned
  assignments: [Assignment!]
  announcements: [CourseAnnouncement!]
  studentQueries: [StudentQuery!]
  enrollments: [Enrollment!]
  createdAt: String!
  updatedAt: String!
}

type Enrollment {
  id: ID!
  course: Course!
  student: User!
  enrolledAt: String! # ISO 8601
  grade: String # A, A-, B+, B, B-, C+, C, C-, D, F or null
  attendance: Float! # 0-100 percentage
}

type StudentQuery {
  id: ID!
  course: Course!
  student: User!
  subject: String!
  message: String!
  status: String! # "Open" | "Answered" | "Closed"
  priority: String! # "Low" | "Normal" | "High" | "Urgent"
  category: String! # "General" | "Assignment" | "Exam" | "Technical" | "Other"
  createdAt: String!
  updatedAt: String!
  responses: [InstructorResponse!]
}

type InstructorResponse {
  id: ID!
  query: StudentQuery!
  instructor: User!
  message: String!
  createdAt: String!
}

type CourseAnnouncement {
  id: ID!
  course: Course!
  instructor: User!
  title: String!
  content: String!
  priority: String! # "Low" | "Normal" | "High" | "Urgent"
  createdAt: String!
}

type Assignment {
  id: ID!
  course: Course!
  title: String!
  description: String
  dueDate: String! # ISO 8601
  totalMarks: Int!
  status: String! # "Active" | "Closed" | "Graded"
  submissions: Int!
  createdAt: String!
}

type InstructorDashboard {
  totalCourses: Int!
  totalStudents: Int!
  openQueries: Int!
  pendingAssignments: Int!
  averageAttendance: Float!
  courseBreakdown: [CourseStats!]!
  recentQueries: [StudentQuery!]!
  upcomingDeadlines: [Assignment!]!
}

type CourseStats {
  courseId: ID!
  courseTitle: String!
  courseCode: String!
  studentCount: Int!
  openQueries: Int!
  averageAttendance: Float!
  assignmentsDue: Int!
}

type Activity {
  id: ID!
  user: User!
  type: String!
  timestamp: String! # ISO 8601
  status: String! # "Completed" | "Pending" | "In Progress" | "Overdue"
  metadata: JSON
}

type Notification {
  id: ID!
  user: User!
  message: String!
  isRead: Boolean!
  createdAt: String!
  metadata: JSON
}

type Report {
  id: ID!
  user: User!
  start_date: String!
  end_date: String!
  type: String!
  content: JSON
}

type DashboardStats {
  totalActivities: Int!
  completedActivities: Int!
  pendingActivities: Int!
  perType: [ActivityTypeCount!]!
}

type ActivityTypeCount {
  type: String!
  count: Int!
}

type AuthPayload {
  token: String!
  user: User!
}

type DeadlineCheckResult {
  processed: Int!
  notificationsSent: Int!
}
```

---

# 16 — Input Types

```graphql
input LoginInput {
  email: String!
  password: String!
}

input RegisterInput {
  name: String!
  email: String!
  password: String!
  roleName: String!
}

input LogActivityInput {
  userId: ID!
  type: String!
  metadata: JSON
}

input ActivityInput {
  userId: ID!
  type: String!
  status: String # "Completed" | "Pending" | "In Progress" | "Overdue"
  metadata: JSON
}

input CreateUserInput {
  name: String!
  email: String!
  password: String!
  roleName: String!
}

input UpdateUserInput {
  name: String
  email: String
  password: String
  roleName: String
}

input CreateCourseInput {
  title: String!
  code: String!
  description: String
  credits: Int
  semester: String
  schedule: String
  instructorId: ID
}

input UpdateCourseInput {
  title: String
  description: String
  credits: Int
  semester: String
  schedule: String
}

input RespondToQueryInput {
  queryId: ID!
  message: String!
}

input PostAnnouncementInput {
  courseId: ID!
  title: String!
  content: String!
  priority: String # "Low" | "Normal" | "High" | "Urgent" — defaults to "Normal"
}

input CreateAssignmentInput {
  courseId: ID!
  title: String!
  description: String
  dueDate: String!
  totalMarks: Int # defaults to 100
}

input UpdateAssignmentInput {
  title: String
  description: String
  dueDate: String
  totalMarks: Int
  status: String # "Active" | "Closed" | "Graded"
}

input UpdateEnrollmentGradeInput {
  enrollmentId: ID!
  grade: String! # A, A-, B+, B, B-, C+, C, C-, D, F
}

input CreateReportInput {
  userId: ID!
  startDate: String!
  endDate: String!
  type: String!
}

input UpdateReportInput {
  startDate: String!
  endDate: String!
  type: String!
}

input SubmitQueryInput {
  courseId: ID!
  subject: String!
  message: String!
  priority: String # "Low" | "Normal" (default) | "High" | "Urgent"
  category: String # "General" (default) | "Assignment" | "Exam" | "Technical" | "Other"
}
```

---

# 17 — Error Reference

| Message                                        | Cause                                                |
| ---------------------------------------------- | ---------------------------------------------------- |
| `Not authenticated`                            | Missing or expired JWT                               |
| `Forbidden`                                    | Role too low for the operation                       |
| `Must be an instructor`                        | Tried instructor-only query without INSTRUCTOR role  |
| `You are not the instructor for this course`   | Tried to manage a course not assigned to you         |
| `Forbidden to log for other users`             | Logging activity for a different user without ADMIN  |
| `Invalid credentials`                          | Wrong email or password                              |
| `Not found`                                    | Resource with given ID does not exist                |
| `Student query not found`                      | Invalid student query ID                             |
| `Assignment not found`                         | Invalid assignment ID                                |
| `Enrollment not found`                         | Invalid enrollment ID for grading                    |
| `Course not found`                             | Invalid course ID                                    |
| `Query not found`                              | Invalid student query ID                             |
| `Invalid grade`                                | Grade not in: A, A-, B+, B, B-, C+, C, C-, D, F      |
| `Cannot delete role: N user(s) still assigned` | Attempted to delete a role with active users         |
| `Notification not found`                       | `markNotificationRead` given bad ID                  |
| `You are not enrolled in this course`          | Student tried to submit query for unenrolled course  |
| `This course has no assigned instructor`       | Student submitted query but course has no instructor |

All errors follow standard GraphQL format:

```json
{
  "errors": [
    {
      "message": "Not authenticated",
      "extensions": { "code": "INTERNAL_SERVER_ERROR" }
    }
  ],
  "data": null
}
```

---

# 18 — Environment Variables

| Variable       | Description                     | Default        |
| -------------- | ------------------------------- | -------------- |
| `DATABASE_URL` | PostgreSQL connection string    | —              |
| `JWT_SECRET`   | Secret used to sign JWT tokens  | `secret_dev`   |
| `PORT`         | HTTP server port                | `4000`         |
| `NODE_ENV`     | `development` \| `production`   | `development`  |
| `CORS_ORIGINS` | Comma-separated allowed origins | localhost list |
| `AUTO_SEED`    | Auto-seed default admin on boot | `false`        |

---

# 19 — Seed & Demo Data

```bash
# Basic roles + admin user
npm run seed

# Full demo data (instructors, students, courses, queries, assignments, etc.)
npm run seed:demo

# Both together
npm run seed:all

# Generate LMS activity logs to file
npm run generate:lms

# Seed LMS activities into DB
npm run seed:lms

# Generate 1000 logs over 180 days
npm run generate:lms:full
```

### Demo Login Credentials

| Role       | Email                           | Password      |
| ---------- | ------------------------------- | ------------- |
| Admin      | `admin@example.com`             | `adminpass`   |
| Instructor | `sarah.thompson@university.edu` | `password123` |
| Instructor | `james.wilson@university.edu`   | `password123` |
| Instructor | `amina.yousaf@university.edu`   | `password123` |
| Instructor | `michael.chen@university.edu`   | `password123` |
| Instructor | `nadia.rashid@university.edu`   | `password123` |

### Demo Data Summary

| Data                 | Count                                               |
| -------------------- | --------------------------------------------------- |
| Roles                | 5 (SUPER_ADMIN, ADMIN, INSTRUCTOR, STUDENT, VIEWER) |
| Instructors          | 5                                                   |
| Students             | 30                                                  |
| Courses              | 8                                                   |
| Enrollments          | ~193 (with grades & attendance)                     |
| Assignments          | 32 (4 per course)                                   |
| Student Queries      | ~65                                                 |
| Instructor Responses | ~54                                                 |
| Announcements        | ~33                                                 |
| Activity Logs        | ~181                                                |
| Notifications        | ~33                                                 |

---

## Frontend Quick-Start Checklist

```
1.  POST /graphql  →  mutation login  →  store token
2.  Attach header: Authorization: Bearer <token>
3.  Instructor Dashboard:
    - query instructorDashboard        (stat cards + overview)
    - query myCourses                  (course cards with nested data)
    - query courseStudentQueries       (student Q&A inbox)
    - query courseEnrollments          (student roster + grades)
    - query courseAssignments          (assignment list)
    - query courseAnnouncements        (announcement feed)
4.  Activity Dashboard:
    - query getDashboardStats          (activity stat cards)
    - query getActivities(userId, 50)  (activity log table)
5.  Notifications:
    - query notifications(limit:10)    (notification bell)
    - subscribe notificationReceived   (live WebSocket updates)
6.  Actions:
    - mutation respondToQuery          (answer student question)
    - mutation postAnnouncement        (post to course)
    - mutation createAssignment        (create assignment)
    - mutation updateEnrollmentGrade   (grade a student)
    - mutation checkDeadlines          (call on login)
    - mutation logActivity             (log instructor work)
    - mutation createReport            (generate analytics report)
```
