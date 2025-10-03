# FYP Admin Panel (Frontend)

This is a Vite + React + TypeScript starter for the FYP admin panel with Ant Design. It includes a sidebar layout and a role-based login (admin, user, viewer) plus mock data APIs.

To run:

1. npm install
2. npm run dev
# FYP-Front-end-BC220211290

## CI/CD and DigitalOcean App Platform

This repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that will:

- Install dependencies and build the app on pushes to `main` (or when manually triggered).
- If the build succeeds, trigger a deployment on DigitalOcean App Platform via the DigitalOcean API.

Required GitHub secrets (set these in your repo settings -> Secrets):

- `DO_API_TOKEN` — A DigitalOcean API token with `write` access to Apps.
- `DO_APP_ID` — The numeric ID of your DigitalOcean App (find this in the App Platform dashboard or API).

Notes on auto-deploy in DigitalOcean:

- If DigitalOcean's "Auto Deploy on Push" is enabled, App Platform will try to build and deploy on every push. This may result in failing deploys if your code needs the CI build step to pass first.
- Recommendation: disable "Auto Deploy on Push" in the DigitalOcean App settings and let this GitHub Action trigger deployments. That way, only builds that pass CI will cause a production deploy.

If you prefer to keep auto-deploy enabled, you can still use this workflow for an additional safety build; however, double deployments or conflicting builds may occur.

If you want the workflow to wait and poll for the DigitalOcean deployment status, or to upload build artifacts into a custom deployment, I can extend the workflow to do that (requires a slightly more complex API call).
