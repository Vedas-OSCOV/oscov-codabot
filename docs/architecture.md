# System Architecture

## Overview

Oscov Codabot is built as a monolithic web application using the Next.js App Router architecture. It heavily leverages Server Actions for data mutations and Server Components for data fetching, reducing the need for client-side API calls and state management.

## Core Components

### 1. Database Layer (Prisma + PostgreSQL)
The application uses a relational schema defined in `prisma/schema.prisma`.
- **User**: Stores profile info and total score. Linked to GitHub identity.
- **Issue**: Represents a coding challenge. Contains metadata fetched from GitHub (Repo URL, Issue Number, Title, Description).
- **Submission**: Links a User to an Issue via a Pull Request URL. Stores the verification status (`PENDING_AI`, `PENDING_MODERATOR`, `APPROVED`, `REJECTED`) and AI analysis results.

### 2. Authentication (NextAuth.js)
Authentication is handled via `next-auth` with the Prisma Adapter.
- **Provider**: GitHub OAuth is the sole provider, ensuring all users have valid GitHub handles.
- **Session**: Sessions are database-persisted. The user's role (`ADMIN` or `USER`) is stored in the session token for route protection.

### 3. Verification Workflow (The "Hybrid" Engine)
This is the core business logic, implemented in `src/app/actions`.

1.  **Submission**: A user submits a PR URL via the client form.
2.  **Validation**: `fetchPRDetails` (GitHub Service) verifies the PR exists and is open/merged.
3.  **Diff Extraction**: `fetchPRDiff` retrieves the raw code changes.
4.  **AI Analysis**: The diff is sent to Google Gemini (Gemini Pro model). The prompt asks for a JSON response containing a summary, quality score (0-100), and critical issues.
5.  **Persistence**: The submission is saved to the DB with status `PENDING_MODERATOR` and the AI feedback attached.
6.  **Manual Review**: An Admin views the submission in the dashboard.
7.  **Final Decision**:
    - **Reject**: Updates status to `REJECTED`.
    - **Approve**: atomic transaction updates status to `APPROVED`, calculates score (Base Points + 10 if merged), and increments `User.score`.

### 4. Admin Dashboard
Located at `/admin`, this section is protected by middleware/layout checks.
- **Manage Issues**: Input: GitHub Issue URL. Logic: Fetches title/body from GitHub API -> Saves to DB.
- **Review**: Displays a list of submissions enriched with User and Issue data. Uses `SubmissionActions` client component for interactivity.

### 5. Frontend Architecture
- **Tech**: React Server Components (RSC) by default.
- **Styling**: CSS Modules with a custom "Glassmorphism" design system defined in `globals.css`.
- **Design Principles**: Minimalist, high-whitespace, blur effects, system fonts. Low visual noise.

## External Services

- **GitHub API**: Used for `issues` and `pulls` endpoints. Authenticated via `GITHUB_TOKEN` (optional but recommended for rate limits).
- **Google Generative AI**: Used for static code analysis. Requires `GEMINI_API_KEY`.
