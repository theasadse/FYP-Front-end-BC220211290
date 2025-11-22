# FYP Admin Panel (Frontend)

This is a frontend application for the FYP Admin Panel, built with **Vite**, **React**, **TypeScript**, and **Ant Design**. It provides a comprehensive interface for managing users, roles, activities, and reports, featuring role-based access control (RBAC) for Admins, Users, and Viewers.

## Features

*   **Role-Based Access Control (RBAC)**: tailored dashboards and permissions for:
    *   **Admin**: Full access to manage users, roles, activities, and reports.
    *   **User**: Personal dashboard to view and manage own activities.
    *   **Viewer**: Read-only access to dashboards and reports.
*   **Authentication**: Secure login and signup flows with JWT-based authentication (mocked or GraphQL integrated).
*   **User Management**: Create, read, update, and delete (CRUD) operations for users.
*   **Role Management**: Dynamic creation and management of user roles.
*   **Activity Logging**: Track and manage system activities.
*   **Reporting**: Generate and view reports based on user activities.
*   **Responsive Design**: Built with Ant Design for a modern and responsive UI.

## Tech Stack

*   **Frontend Framework**: React
*   **Build Tool**: Vite
*   **Language**: TypeScript
*   **UI Library**: Ant Design
*   **Routing**: React Router (HashRouter)
*   **State Management / Data Fetching**: Apollo Client (GraphQL) & React Context API
*   **Styling**: CSS Modules & Ant Design Theme

## Getting Started

### Prerequisites

*   Node.js (v14 or higher recommended)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running Development Server

To start the development server with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or another port if 3000 is busy).

### Building for Production

To build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Previewing Production Build

To locally preview the production build:

```bash
npm run preview
```

## Project Structure

```
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components (e.g., MainLayout)
│   ├── contexts/        # React Contexts (e.g., AuthContext)
│   ├── graphql/         # GraphQL setup, schema, and operations
│   │   ├── operations/  # GraphQL queries and mutations
│   │   ├── apolloClient.ts # Apollo Client configuration
│   │   └── mockSchema.ts   # Mock data for local development
│   ├── pages/           # Application pages (Dashboards, Login, etc.)
│   ├── services/        # API services (e.g., Mock API)
│   ├── App.tsx          # Main application component and routing
│   ├── main.tsx         # Entry point
│   └── styles.css       # Global styles
├── index.html           # HTML entry point
├── server.js            # Express server for production serving
├── vite.config.ts       # Vite configuration
└── package.json         # Project dependencies and scripts
```

## CI/CD and Deployment

This repository is configured for automated deployment to the **DigitalOcean App Platform**.

### GitHub Actions

The workflow at `.github/workflows/deploy.yml` handles:
1.  **Build**: Installs dependencies and builds the project on every push to `main`.
2.  **Deploy**: Triggers a deployment on DigitalOcean if the build is successful.

**Required Secrets:**
*   `DO_API_TOKEN`: DigitalOcean API token with write access.
*   `DO_APP_ID`: The App ID of your DigitalOcean App.

### Manual Deployment

You can also manually deploy the built artifacts using the included `server.js`:

```bash
node server.js
```

This starts an Express server serving the `dist` folder on port 8080 (or `process.env.PORT`).

## Documentation

The codebase is fully documented using JSDoc/TSDoc. You can inspect the source code to see detailed descriptions of functions, components, and types.

## Contributing

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/my-feature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/my-feature`).
5.  Open a Pull Request.
