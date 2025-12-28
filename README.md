# Oscov Codabot

Oscov Codabot is a coding marathon management platform designed for Vedas-OSCOV. It enables administrators to manage open-source issues and challenges, while participants can submit solutions (Pull Requests) to earn points and climb the leaderboard. The system features an AI-assisted verification workflow using Google Gemini to analyze code quality before manual moderation.

## Features

- **Public Landing Page**: Minimalist design showcasing marathon stats.
- **Issue Browser**: Participants can view and filter active coding challenges fetched from GitHub.
- **Submission System**: Users submit PR links, which are automatically analyzed by AI.
- **Admin Dashboard**: A comprehensive control center to manage issues and review submissions.
- **AI-Powered Verification**: Google Gemini analyzes PR diffs for quality, bugs, and requirements.
- **Leaderboard**: Real-time ranking of top contributors based on accrued points.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Vanilla CSS (CSS Modules)
- **Authentication**: NextAuth.js (GitHub OAuth)
- **AI**: Google Generative AI SDK (Gemini)

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL Database
- GitHub OAuth App credentials
- Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd oscov-codabot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Copy the example file and fill in your credentials.
   ```bash
   cp .env.example .env
   ```
   **Required Variables**:
   - `DATABASE_URL`: Connection string for your PostgreSQL database.
   - `GITHUB_ID` & `GITHUB_SECRET`: From your GitHub OAuth App.
   - `GEMINI_API_KEY`: For AI analysis features.
   - `NEXTAUTH_SECRET`: A random string for session security.

4. Initialize the Database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the Development Server:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

## Architecture

See `docs/architecture.md` for a detailed breakdown of the system design and component interaction.

## Authors

See `docs/authors.md`.
