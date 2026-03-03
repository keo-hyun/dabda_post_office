# Dabda Post Office Backend-First + UI/UX Integration Design

## Context
- Priority order: backend integration first, then UI/UX improvements, then balanced follow-up.
- Deployment target: Apps Script Web App serves frontend and API from the same origin.
- External resources already prepared:
  - Drive folder ID: `1tB_M5qd_9c0-hmikoy5pqSr3QlV7Pwbr`
  - Spreadsheet ID: `1GSKuJm9NyQYHWhB4SuZSqWe6CHEswFX5RGnEYZKnpI0`

## Goals
- Replace current mock-style data behavior with real Google Sheets/Drive persistence via Apps Script.
- Keep existing phase-based user flow (ENTRY -> COMPOSE/TRANSITION/MAILBOX/LETTER) while wiring real APIs.
- Make operational setup explicit and repeatable (`clasp`, script properties, deployment steps).

## Architecture
- Keep core business logic in pure JS modules under `src/backend/core` and `src/shared` for local testability.
- Use `apps-script/Code.js` and route modules as thin adapters that:
  - parse request shape,
  - call core logic,
  - read/write Sheets/Drive,
  - return normalized JSON responses.
- Serve frontend from Apps Script Web App to avoid CORS complexity and environment mismatch.

## API Contract
- Base response shape:
  - success: `{ ok: true, data?: object, message?: string, metric?: object }`
  - failure: `{ ok: false, message: string, code?: string }`
- Endpoints:
  - `POST /api/enter`
  - `POST /api/register-or-login`
  - `GET /api/phase`
  - `POST /api/letters`
  - `GET /api/mailboxes`
  - `GET /api/letters/:id`
  - `POST /api/comments`
  - `PATCH /api/comments/:id`
  - `DELETE /api/comments/:id`
  - `DELETE /api/admin/comments/:id`
  - `POST /api/admin/report-action`

## Data Model and Persistence
- Google Sheets tabs:
  - `Users(user_id, nickname, password_hash, created_at, last_login_at)`
  - `Letters(letter_id, user_id, nickname, content, image_file_id, visibility, phase_created, created_at)`
  - `Comments(comment_id, letter_id, nickname, password_hash, content, created_at, updated_at, deleted_at)`
  - `AuditLogs(log_id, type, target_id, reason, created_at, actor)`
  - `Metrics(event_id, event_name, user_id, meta_json, created_at)`
- Drive usage:
  - uploaded letter images stored in configured folder,
  - store `image_file_id` in `Letters`.

## Security and Policy
- No plain-text password storage in Sheets.
- Use hash comparison for user and admin auth paths.
- Enforce visibility:
  - `PRIVATE`: owner or admin only,
  - `PUBLIC`: exposed through mailbox in phase 2.
- Preserve soft-delete policy for comments (`deleted_at` set, row retained).

## Phase and UX Behavior
- Phase resolver remains date-driven with optional script property override.
- Frontend behavior:
  - phase 1: compose experience,
  - transition: locked notice,
  - phase 2: mailbox browse + letter detail + comments.
- Improve UX after backend stabilization:
  - explicit loading states,
  - clearer submit/success/failure feedback,
  - empty and error state copy consistency.

## Operational Setup
- Tooling:
  - install and login `clasp`,
  - keep `apps-script/` as deployment source,
  - set script properties before web app deploy:
    - `ENTRY_CODE`
    - `PHASE_MODE`
    - `SPREADSHEET_ID`
    - `DRIVE_FOLDER_ID`
    - `ADMIN_PASSWORD_HASH`
- Deployment:
  - push script code with `clasp`,
  - deploy new web app version,
  - verify phase 1/transition/phase 2 and admin routes.

## Testing Strategy
- Continue strict TDD for each change:
  - failing test first,
  - minimal implementation,
  - pass verification.
- Unit tests:
  - core contracts and policy checks.
- E2E tests:
  - phase 1 submit path,
  - phase 2 mailbox + comment path.
- Manual QA:
  - Apps Script deployment-level smoke checks and moderation flow.

## Risks and Mitigations
- Risk: Apps Script request path handling differences from local assumptions.
  - Mitigation: central route parser + request fixtures in tests.
- Risk: flaky E2E due to local server race.
  - Mitigation: single worker Playwright config and fixed web server command.
- Risk: inconsistent sheet schema in production.
  - Mitigation: schema verification routine during initialization.
