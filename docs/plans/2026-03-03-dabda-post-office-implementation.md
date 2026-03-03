# Dabda Post Office Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build and ship the Dabda Post Office event web app for 2026-03-25 to 2026-04-24, including entry/auth, letter submission, mailbox viewing, comments, moderation, and KPI tracking.

**Architecture:** Use a static frontend (HTML/CSS/JS) and a Google Apps Script Web App backend. Store structured data in Google Sheets and image files in Google Drive. Keep business logic in pure JS modules so it can be tested locally with Vitest before connecting to Apps Script handlers.

**Tech Stack:** Vanilla HTML/CSS/JS, Google Apps Script, Google Sheets, Google Drive, Node.js, Vitest, Playwright, clasp

---

## Ground Rules

- Follow @superpowers:test-driven-development on every task.
- Run checks before claiming done via @superpowers:verification-before-completion.
- Keep scope YAGNI: only features in v4 spec.

### Task 1: Project Bootstrap and Test Harness

**Files:**
- Create: `package.json`
- Create: `vitest.config.js`
- Create: `playwright.config.js`
- Create: `README.md`
- Create: `.gitignore`
- Create: `web/index.html`
- Create: `tests/unit/smoke.test.js`

**Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest';

describe('smoke', () => {
  it('runs test harness', () => {
    expect(true).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails (before dependencies)**

Run: `npm test -- tests/unit/smoke.test.js`
Expected: FAIL with `npm ERR! missing script: test`.

**Step 3: Write minimal implementation**

- Add scripts/deps in `package.json` (`test`, `test:unit`, `test:e2e`).
- Configure Vitest and Playwright minimal configs.

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/smoke.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add package.json vitest.config.js playwright.config.js README.md .gitignore web/index.html tests/unit/smoke.test.js
git commit -m "chore: bootstrap project and test harness"
```

### Task 2: Data Schema and Environment Contracts

**Files:**
- Create: `docs/data-model.md`
- Create: `src/shared/schema.js`
- Create: `src/shared/config.js`
- Test: `tests/unit/schema.test.js`

**Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest';
import { SHEETS, REQUIRED_SCRIPT_PROPS } from '../../src/shared/schema.js';

describe('schema contract', () => {
  it('defines required sheets and script properties', () => {
    expect(SHEETS.LETTERS.columns).toContain('visibility');
    expect(REQUIRED_SCRIPT_PROPS).toContain('ENTRY_CODE');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/schema.test.js`
Expected: FAIL with `Cannot find module '../../src/shared/schema.js'`.

**Step 3: Write minimal implementation**

- Define sheet contracts:
  - `Users(user_id, nickname, password_hash, created_at, last_login_at)`
  - `Letters(letter_id, user_id, nickname, content, image_file_id, visibility, phase_created, created_at)`
  - `Comments(comment_id, letter_id, nickname, password_hash, content, created_at, updated_at, deleted_at)`
  - `AuditLogs(log_id, type, target_id, reason, created_at, actor)`
  - `Metrics(event_id, event_name, user_id, meta_json, created_at)`
- Define script properties contract:
  - `ENTRY_CODE`, `PHASE_MODE`, `SPREADSHEET_ID`, `DRIVE_FOLDER_ID`, `ADMIN_PASSWORD_HASH`.

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/schema.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add docs/data-model.md src/shared/schema.js src/shared/config.js tests/unit/schema.test.js
git commit -m "docs: define spreadsheet schema and environment contract"
```

### Task 3: Auth and Entry Gate APIs (Apps Script Core)

**Files:**
- Create: `src/backend/core/authCore.js`
- Create: `apps-script/Code.js`
- Create: `apps-script/routes/auth.js`
- Test: `tests/unit/authCore.test.js`

**Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest';
import { validateEntryCode } from '../../src/backend/core/authCore.js';

describe('entry code validation', () => {
  it('accepts only exact configured code', () => {
    expect(validateEntryCode('DABDA2026', 'DABDA2026')).toBe(true);
    expect(validateEntryCode('WRONG', 'DABDA2026')).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/authCore.test.js`
Expected: FAIL with missing module/function.

**Step 3: Write minimal implementation**

- Implement pure functions:
  - `validateEntryCode(input, expected)`
  - `hashPassword(plain)`
  - `verifyPassword(plain, hash)`
- Add Apps Script route wrappers:
  - `POST /api/enter` (entry code check)
  - `POST /api/register-or-login` (nickname + password)

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/authCore.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/backend/core/authCore.js apps-script/Code.js apps-script/routes/auth.js tests/unit/authCore.test.js
git commit -m "feat: add entry gate and nickname-password auth core"
```

### Task 4: Phase Control and Feature Gating

**Files:**
- Create: `src/shared/phase.js`
- Modify: `apps-script/routes/auth.js`
- Create: `apps-script/routes/phase.js`
- Test: `tests/unit/phase.test.js`

**Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest';
import { resolvePhase } from '../../src/shared/phase.js';

describe('phase resolver', () => {
  it('returns PHASE_1 on 2026-03-25 and TRANSITION on 2026-04-10', () => {
    expect(resolvePhase(new Date('2026-03-25T09:00:00+09:00'))).toBe('PHASE_1');
    expect(resolvePhase(new Date('2026-04-10T09:00:00+09:00'))).toBe('TRANSITION');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/phase.test.js`
Expected: FAIL with missing module/function.

**Step 3: Write minimal implementation**

- Implement `resolvePhase(date)` with fixed windows:
  - `2026-03-25 ~ 2026-04-08`: `PHASE_1`
  - `2026-04-09 ~ 2026-04-12`: `TRANSITION`
  - `2026-04-13 ~ 2026-04-24`: `PHASE_2`
  - otherwise `CLOSED`
- Expose `GET /api/phase` route.

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/phase.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/shared/phase.js apps-script/routes/auth.js apps-script/routes/phase.js tests/unit/phase.test.js
git commit -m "feat: add date-based phase gating"
```

### Task 5: Letter Submission and Visibility Rules

**Files:**
- Create: `src/backend/core/lettersCore.js`
- Create: `apps-script/routes/letters.js`
- Create: `src/shared/validators.js`
- Test: `tests/unit/lettersCore.test.js`

**Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest';
import { validateLetterPayload, canViewLetter } from '../../src/backend/core/lettersCore.js';

describe('letter rules', () => {
  it('rejects content over 1000 chars and hides private letters from list', () => {
    expect(validateLetterPayload({ content: 'a'.repeat(1001) }).ok).toBe(false);
    expect(canViewLetter({ visibility: 'PRIVATE' }, { isOwner: false, isAdmin: false })).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/lettersCore.test.js`
Expected: FAIL with missing module/function.

**Step 3: Write minimal implementation**

- `validateLetterPayload`:
  - `content <= 1000`
  - `image <= 5MB`
  - `visibility in ['PUBLIC', 'PRIVATE']`
- `canViewLetter`:
  - `PUBLIC`: everyone in phase 2
  - `PRIVATE`: owner or admin only
- Add routes:
  - `POST /api/letters`
  - `GET /api/mailboxes` (public only)
  - `GET /api/letters/:id` (auth + visibility checks)

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/lettersCore.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/backend/core/lettersCore.js apps-script/routes/letters.js src/shared/validators.js tests/unit/lettersCore.test.js
git commit -m "feat: implement letter submission and visibility rules"
```

### Task 6: Comment CRUD and Moderation APIs

**Files:**
- Create: `src/backend/core/commentsCore.js`
- Create: `apps-script/routes/comments.js`
- Create: `apps-script/routes/admin.js`
- Test: `tests/unit/commentsCore.test.js`

**Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest';
import { canEditComment } from '../../src/backend/core/commentsCore.js';

describe('comment permissions', () => {
  it('allows edit/delete only with correct writer password or admin', () => {
    const comment = { password_hash: 'hash123' };
    expect(canEditComment(comment, { passwordOk: false, isAdmin: false })).toBe(false);
    expect(canEditComment(comment, { passwordOk: true, isAdmin: false })).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/commentsCore.test.js`
Expected: FAIL with missing module/function.

**Step 3: Write minimal implementation**

- Routes:
  - `POST /api/comments`
  - `PATCH /api/comments/:id`
  - `DELETE /api/comments/:id`
  - `DELETE /api/admin/comments/:id` (admin moderation)
  - `POST /api/admin/report-action` (copyright/privacy action log)
- Soft-delete comments (`deleted_at` set).

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/commentsCore.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/backend/core/commentsCore.js apps-script/routes/comments.js apps-script/routes/admin.js tests/unit/commentsCore.test.js
git commit -m "feat: add comment auth and moderation endpoints"
```

### Task 7: Frontend Screens and API Integration

**Files:**
- Create: `web/styles.css`
- Create: `web/app.js`
- Create: `web/api.js`
- Create: `web/state.js`
- Create: `web/views/entryView.js`
- Create: `web/views/composeView.js`
- Create: `web/views/transitionView.js`
- Create: `web/views/mailboxView.js`
- Create: `web/views/letterView.js`
- Test: `tests/unit/frontendState.test.js`

**Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest';
import { reduceAppState } from '../../web/state.js';

describe('state transitions', () => {
  it('moves from ENTRY to COMPOSE after successful auth', () => {
    const next = reduceAppState({ screen: 'ENTRY' }, { type: 'AUTH_OK', phase: 'PHASE_1' });
    expect(next.screen).toBe('COMPOSE');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/frontendState.test.js`
Expected: FAIL with missing module/function.

**Step 3: Write minimal implementation**

- Render screens by phase:
  - Entry
  - Compose (phase 1 only)
  - Transition notice
  - Mailbox list (phase 2)
  - Letter detail + comments
- API client handles non-200 with user-friendly error messages.

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/frontendState.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add web/styles.css web/app.js web/api.js web/state.js web/views/entryView.js web/views/composeView.js web/views/transitionView.js web/views/mailboxView.js web/views/letterView.js tests/unit/frontendState.test.js
git commit -m "feat: implement frontend flows for phase 1 and phase 2"
```

### Task 8: KPI Logging and Export Readiness

**Files:**
- Create: `src/backend/core/metricsCore.js`
- Modify: `apps-script/routes/auth.js`
- Modify: `apps-script/routes/letters.js`
- Modify: `apps-script/routes/comments.js`
- Create: `docs/kpi-report-template.md`
- Test: `tests/unit/metricsCore.test.js`

**Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest';
import { buildMetricEvent } from '../../src/backend/core/metricsCore.js';

describe('metric events', () => {
  it('normalizes event payload', () => {
    const event = buildMetricEvent('LETTER_SUBMITTED', { userId: 'u1' });
    expect(event.event_name).toBe('LETTER_SUBMITTED');
    expect(event.user_id).toBe('u1');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/metricsCore.test.js`
Expected: FAIL with missing module/function.

**Step 3: Write minimal implementation**

- Log events:
  - `ENTRY_SUCCESS`
  - `LETTER_SUBMITTED`
  - `MAILBOX_VIEW`
  - `COMMENT_CREATED`
  - `COMMENT_UPDATED`
  - `COMMENT_DELETED`
- Add KPI template for final reporting.

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/metricsCore.test.js`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/backend/core/metricsCore.js apps-script/routes/auth.js apps-script/routes/letters.js apps-script/routes/comments.js docs/kpi-report-template.md tests/unit/metricsCore.test.js
git commit -m "feat: add KPI event logging and report template"
```

### Task 9: End-to-End QA Scenarios (Playwright + Manual Ops)

**Files:**
- Create: `tests/e2e/phase1-submit-public-letter.spec.js`
- Create: `tests/e2e/phase2-mailbox-comment.spec.js`
- Create: `docs/qa/manual-test-cases.md`

**Step 1: Write the failing e2e test**

```js
import { test, expect } from '@playwright/test';

test('phase1: user can submit public letter', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('입장 코드').fill('DABDA2026');
  await page.getByRole('button', { name: '입장하기' }).click();
  await expect(page.getByText('편지 보내기')).toBeVisible();
});
```

**Step 2: Run e2e to verify it fails**

Run: `npm run test:e2e -- tests/e2e/phase1-submit-public-letter.spec.js`
Expected: FAIL until UI/API wiring is complete.

**Step 3: Write minimal implementation to satisfy e2e path**

- Fix selectors, loading states, and API mock/stub configuration.

**Step 4: Run e2e to verify it passes**

Run: `npm run test:e2e`
Expected: PASS on both scenario specs.

**Step 5: Commit**

```bash
git add tests/e2e/phase1-submit-public-letter.spec.js tests/e2e/phase2-mailbox-comment.spec.js docs/qa/manual-test-cases.md
git commit -m "test: add e2e and manual QA regression scenarios"
```

## Final Verification Checklist

Run in order:

1. `npm ci`
2. `npm run test:unit`
3. `npm run test:e2e`
4. `npm run lint` (if configured)
5. `clasp push`
6. Deploy Apps Script Web App and verify:
   - Phase 1 create flow
   - Transition lock behavior
   - Phase 2 mailbox/comment flow
   - Admin delete/report action

Expected:
- All unit/e2e tests pass.
- No plain-text password stored in Sheets.
- Private letters never appear in public mailbox list.

## Deployment Notes

- Script Properties must be set before production deploy:
  - `ENTRY_CODE`
  - `PHASE_MODE` (optional override; default by date)
  - `SPREADSHEET_ID`
  - `DRIVE_FOLDER_ID`
  - `ADMIN_PASSWORD_HASH`
- Keep production entry code rotation procedure in `docs/ops/runbook.md`.

Plan complete and saved to `docs/plans/2026-03-03-dabda-post-office-implementation.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
