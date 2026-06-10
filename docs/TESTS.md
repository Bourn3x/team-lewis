# Tests

This document explains the test suite for the Smile Score application.

## Overview

The project uses two testing frameworks:

- **Vitest** for unit and integration tests (`npm test`)
- **Playwright** for end-to-end browser tests (`npm run test:e2e`)

## Test Infrastructure

### Configuration

| File | Purpose |
|------|---------|
| `vitest.config.ts` | Vitest configuration — node environment, global setup/teardown, path aliases, test database URL |
| `playwright.config.ts` | Playwright configuration — targets `./e2e` directory, auto-starts dev server on port 3000 |

### Setup Files

| File | Purpose |
|------|---------|
| `tests/global-setup.ts` | Runs once before all tests. Resets the test database via `prisma db push --force-reset` using `prisma/test.db`. |
| `tests/setup.ts` | Runs before each test file. Clears the `upload` and `user` tables via Prisma `deleteMany()` and disconnects the client after all tests. |

### Test Database

Unit/integration tests use a separate SQLite database (`prisma/test.db`) configured via the `DATABASE_URL` env var in `vitest.config.ts`. The database schema is force-reset before each test run to ensure a clean state.

---

## Unit Tests

### `tests/lib/validation.test.ts` — File Validation

Tests the `validateFile` function and its associated constants (`ALLOWED_TYPES`, `MAX_FILE_SIZE`).

| Test | What it verifies |
|------|-----------------|
| Accepts valid JPEG under 5MB | Happy path for JPEG uploads |
| Accepts valid PNG under 5MB | Happy path for PNG uploads |
| Accepts valid WebP under 5MB | Happy path for WebP uploads |
| Rejects non-image file type | PDF and other non-image MIME types are rejected |
| Rejects file over 5MB | Files exceeding the size limit return an error |
| Rejects file at exactly 5MB + 1 byte | Boundary condition — off-by-one check |
| Accepts file at exactly 5MB | Boundary condition — max allowed size |
| ALLOWED_TYPES contains jpeg, png, webp | Constants are correctly defined |
| MAX_FILE_SIZE is 5MB | Size limit constant equals `5 * 1024 * 1024` |

### `tests/services/score-provider.test.ts` — Score Provider

Tests the `MockScoreProvider` class and its conformance to the `ScoreProvider` interface.

| Test | What it verifies |
|------|-----------------|
| Implements ScoreProvider interface | `MockScoreProvider` satisfies the `ScoreProvider` type contract |
| Returns a score between 0 and 100 | Output is within the valid range |
| Returns an integer | Score is a whole number, not a float |
| Returns a number (not NaN) | Guards against `NaN` edge cases |
| Simulates processing delay | `score()` takes at least 100ms, simulating real processing |

### `tests/services/file-service.test.ts` — File Service

Tests the `FileService` class for file storage and retrieval. Uses a temporary directory (`os.tmpdir()`) that is created before and cleaned up after each test.

| Test | What it verifies |
|------|-----------------|
| Writes file to disk and returns filename | File is persisted and the returned name ends with the correct extension |
| Generates unique filenames | Two files with the same original name get different stored names |
| Preserves the file extension | `.jpg`, `.png`, `.webp` extensions are maintained |
| Creates upload directory if missing | Nested directories are auto-created via `mkdir -p` behavior |
| Reads a stored file back | Round-trip: store then read returns identical buffer |
| Throws when file does not exist | Reading a nonexistent filename rejects with an error |

---

## Integration Tests

### `tests/api/uploads.test.ts` — Upload API Route

Tests the `POST /api/uploads` route handler directly. Mocks `next/headers` (cookies) and `@/lib/services` (fileService, scoreProvider) while using a real test database for Prisma operations.

**Mocks:**
- `cookies()` — simulates session authentication via a `userId` cookie
- `fileService.store` — returns `"test-uuid.jpg"`
- `scoreProvider.score` — returns `75`

| Test | What it verifies |
|------|-----------------|
| Returns 401 when no session cookie | Unauthenticated requests are rejected |
| Returns 400 when no file is provided | Missing file in form data is handled |
| Returns 400 for invalid file type | Non-image files (e.g., PDF) are rejected with a descriptive error |
| Returns 400 for file over 5MB | Oversized files are rejected with a size-related error message |
| Stores file, generates score, creates DB record | Happy path — verifies the response body, mock calls, and that a database record is created with the correct score and filename |

---

## End-to-End Tests

### `tests/e2e/smile-score.spec.ts` — Full Application Flow

Playwright browser tests that exercise the complete user journey. The dev server is started automatically before tests run (configured in `playwright.config.ts`).

**Fixtures:** `tests/e2e/fixtures/test-image.jpg` — a test image used for upload tests.

| Test | What it verifies |
|------|-----------------|
| Full flow: register, upload image, see score | Visits `/` (redirects to `/register`), fills in name and email, submits, lands on `/dashboard`, uploads an image, and verifies a smile score (0–100) appears |
| Shows validation error for non-image file | Registers a user, attempts to upload a `.txt` file, and verifies a validation error mentioning JPEG/PNG/WebP is shown |
| Register page redirects if already logged in | After registering, revisiting `/register` redirects back to `/dashboard` |

---

## Running Tests

```bash
# Run all unit + integration tests
npm test

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests (starts dev server automatically)
npm run test:e2e
```
