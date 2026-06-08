# Smile Score

A Next.js web application that lets users register, upload images, and receive a "smile score."

## Quick Start

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Running Tests

```bash
# Unit + integration tests
npm test

# E2E tests (starts dev server automatically)
npm run test:e2e
```

## Architecture

### Layered Structure

```
app/            Pages and API routes (thin orchestration layer)
services/       Business logic (ScoreProvider, FileService)
components/     UI components (shadcn/ui based)
lib/            Shared utilities, DB client, service composition
prisma/         Database schema
tests/          Unit and integration tests
e2e/            Playwright end-to-end tests
```

### Key Design Decisions

- **ScoreProvider interface** -- Scoring logic is behind an interface (`ScoreProvider`) with a `MockScoreProvider` implementation. Swapping to a real ML model (e.g., TensorFlow.js, Azure Face API) requires only a new implementation -- no changes to the upload pipeline.

- **Service composition root** (`lib/services.ts`) -- Service instances are created in one place, making dependency injection and testing straightforward.

- **Server-side file handling** -- Images are uploaded to the server, stored in `/uploads`, and served via a dedicated API route. This demonstrates the full upload pipeline while keeping the architecture realistic.

- **Cookie-based sessions** -- Lightweight HTTP-only cookies identify users. No auth library overhead, but the pattern mirrors production session management.

- **SQLite + Prisma** -- Zero-config database that reviewers can run without Docker. Prisma provides typed queries and a schema file that doubles as data model documentation.

- **Testing pyramid** -- Unit tests (Vitest) for services and validation, integration tests for API routes against a real test database, and E2E tests (Playwright) for the full user flow.

### Assumptions

- This is a demo application -- user registration uses email-based upsert without passwords or authentication tokens.
- The mock score provider returns random integers 0-100 with a simulated delay to exercise loading states.
- Images are stored on the local filesystem. This works for local development but would need cloud storage (S3, etc.) in production.
- SQLite is used for simplicity. A production deployment would use PostgreSQL or similar.

### What I Would Do Differently With More Time

- **Real ML scoring** -- Integrate face-api.js or TensorFlow.js (client or server-side) for actual smile detection.
- **Production auth** -- Add proper authentication with password hashing, JWT/session tokens, and protected routes (e.g., NextAuth.js).
- **Cloud storage** -- Use S3 or similar for image storage instead of local filesystem.
- **Image optimization** -- Use Next.js `Image` component and Sharp for thumbnails/responsive images.
- **Real-time feedback** -- WebSocket or SSE for live score updates while processing.
- **Accessibility audit** -- Full WCAG compliance, keyboard navigation, screen reader testing.
- **CI/CD pipeline** -- GitHub Actions running lint, type-check, unit tests, integration tests, and E2E on every PR.
- **Error boundaries** -- React error boundaries for graceful failure handling.
- **Rate limiting** -- Protect the upload endpoint from abuse.
