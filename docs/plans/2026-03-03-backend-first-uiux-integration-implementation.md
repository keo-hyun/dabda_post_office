# Backend-First UI/UX Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Connect the existing Dabda Post Office app to real Apps Script + Sheets + Drive persistence first, then improve UI/UX behavior on top of the real backend.

**Architecture:** Keep business logic in testable core modules and add Apps Script adapters for I/O. Use script properties for runtime configuration. Serve frontend and API from the same Apps Script Web App endpoint to keep same-origin behavior.

**Tech Stack:** Vanilla JS, Google Apps Script, Google Sheets, Google Drive, Vitest, Playwright, clasp

---

## Ground Rules

- Follow @superpowers:test-driven-development on every task.
- If any route or test fails unexpectedly, stop and apply @superpowers:systematic-debugging.
- Before claiming completion, run @superpowers:verification-before-completion.
- Keep commits frequent and task-scoped.

### Task 1: Apps Script Project Bootstrap (clasp + manifest)

**Files:**
- Create: `.clasp.json`
- Create: `apps-script/appsscript.json`
- Modify: `README.md`
- Test: `tests/unit/claspConfig.test.js`

**Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

describe('clasp config', () => {
  it('has clasp and manifest files', () => {
    expect(fs.existsSync('.clasp.json')).toBe(true);
    expect(fs.existsSync('apps-script/appsscript.json')).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/claspConfig.test.js`  
Expected: FAIL because files do not exist.

**Step 3: Write minimal implementation**

```json
{
  "scriptId": "REPLACE_WITH_CLASP_SCRIPT_ID",
  "rootDir": "apps-script"
}
```

```json
{
  "timeZone": "Asia/Seoul",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "access": "ANYONE",
    "executeAs": "USER_DEPLOYING"
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/claspConfig.test.js`  
Expected: PASS.

**Step 5: Commit**

```bash
git add .clasp.json apps-script/appsscript.json README.md tests/unit/claspConfig.test.js
git commit -m "chore: add clasp bootstrap and apps script manifest"
```

### Task 2: Script Properties and Environment Contract for Production IDs

**Files:**
- Modify: `src/shared/config.js`
- Modify: `src/shared/schema.js`
- Create: `tests/unit/scriptProps.test.js`
- Modify: `docs/data-model.md`

**Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest';
import { validateScriptProperties } from '../../src/shared/config.js';

describe('script properties', () => {
  it('requires spreadsheet and drive ids', () => {
    const result = validateScriptProperties({
      ENTRY_CODE: 'DABDA2026'
    });
    expect(result.ok).toBe(false);
    expect(result.missing).toContain('SPREADSHEET_ID');
    expect(result.missing).toContain('DRIVE_FOLDER_ID');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/scriptProps.test.js`  
Expected: FAIL if contract check is incomplete.

**Step 3: Write minimal implementation**

```js
const REQUIRED_SCRIPT_PROPS = [
  'ENTRY_CODE',
  'PHASE_MODE',
  'SPREADSHEET_ID',
  'DRIVE_FOLDER_ID',
  'ADMIN_PASSWORD_HASH'
];
```

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/scriptProps.test.js`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/shared/config.js src/shared/schema.js tests/unit/scriptProps.test.js docs/data-model.md
git commit -m "chore: enforce production script property contract"
```

### Task 3: Sheets Gateway (Users/Letters/Comments/AuditLogs/Metrics)

**Files:**
- Create: `apps-script/lib/sheetsGateway.js`
- Create: `tests/unit/sheetsGateway.test.js`
- Modify: `apps-script/routes/auth.js`
- Modify: `apps-script/routes/letters.js`
- Modify: `apps-script/routes/comments.js`

**Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest';
import { mapHeaderRow } from '../../apps-script/lib/sheetsGateway.js';

describe('sheets gateway', () => {
  it('maps row array by headers', () => {
    const row = mapHeaderRow(['user_id', 'nickname'], ['u1', 'keo']);
    expect(row.user_id).toBe('u1');
    expect(row.nickname).toBe('keo');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/sheetsGateway.test.js`  
Expected: FAIL with missing module.

**Step 3: Write minimal implementation**

```js
function mapHeaderRow(headers, values) {
  return headers.reduce((acc, key, idx) => ({ ...acc, [key]: values[idx] ?? '' }), {});
}
```

Add gateway functions:
- `appendRow(sheetName, payload)`
- `findRowBy(sheetName, column, value)`
- `updateRowBy(sheetName, column, value, patch)`

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/sheetsGateway.test.js`  
Expected: PASS.

**Step 5: Commit**

```bash
git add apps-script/lib/sheetsGateway.js tests/unit/sheetsGateway.test.js apps-script/routes/auth.js apps-script/routes/letters.js apps-script/routes/comments.js
git commit -m "feat: add sheets gateway and wire core routes"
```

### Task 4: Drive Image Upload Flow for Letters

**Files:**
- Create: `apps-script/lib/driveGateway.js`
- Modify: `apps-script/routes/letters.js`
- Create: `tests/unit/driveGateway.test.js`

**Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest';
import { normalizeBase64Image } from '../../apps-script/lib/driveGateway.js';

describe('drive gateway', () => {
  it('normalizes data uri payload', () => {
    const normalized = normalizeBase64Image('data:image/png;base64,AAAA');
    expect(normalized.mimeType).toBe('image/png');
    expect(normalized.base64).toBe('AAAA');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/driveGateway.test.js`  
Expected: FAIL with missing module.

**Step 3: Write minimal implementation**

```js
function normalizeBase64Image(dataUri) {
  const [meta, base64] = dataUri.split(',');
  const mimeType = meta.replace('data:', '').replace(';base64', '');
  return { mimeType, base64 };
}
```

Add `uploadImageToDrive(dataUri, folderId, filename)` and use returned file id in `POST /api/letters`.

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/driveGateway.test.js`  
Expected: PASS.

**Step 5: Commit**

```bash
git add apps-script/lib/driveGateway.js apps-script/routes/letters.js tests/unit/driveGateway.test.js
git commit -m "feat: add drive upload integration for letter images"
```

### Task 5: Real Auth Persistence and Login Update

**Files:**
- Modify: `apps-script/routes/auth.js`
- Modify: `src/backend/core/authCore.js`
- Create: `tests/unit/authPersistence.test.js`

**Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest';
import { buildUserInsert } from '../../src/backend/core/authCore.js';

describe('auth persistence shape', () => {
  it('creates users row payload with hashed password', () => {
    const row = buildUserInsert('keo', 'secret');
    expect(row.nickname).toBe('keo');
    expect(row.password_hash).not.toBe('secret');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/authPersistence.test.js`  
Expected: FAIL with missing function.

**Step 3: Write minimal implementation**

```js
function buildUserInsert(nickname, password) {
  return {
    user_id: `u_${Date.now()}`,
    nickname,
    password_hash: hashPassword(password),
    created_at: new Date().toISOString(),
    last_login_at: new Date().toISOString()
  };
}
```

Wire `register-or-login` to `Users` sheet:
- insert if nickname not found,
- verify hash + update `last_login_at` if found.

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/authPersistence.test.js`  
Expected: PASS.

**Step 5: Commit**

```bash
git add apps-script/routes/auth.js src/backend/core/authCore.js tests/unit/authPersistence.test.js
git commit -m "feat: persist user auth to sheets"
```

### Task 6: Comments and Admin Moderation Persistence

**Files:**
- Modify: `apps-script/routes/comments.js`
- Modify: `apps-script/routes/admin.js`
- Create: `tests/unit/commentPersistence.test.js`

**Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest';
import { buildSoftDeletePatch } from '../../src/backend/core/commentsCore.js';

describe('comment persistence', () => {
  it('builds soft delete patch with timestamp', () => {
    const patch = buildSoftDeletePatch(new Date('2026-03-25T00:00:00Z'));
    expect(patch.deleted_at).toContain('2026-03-25');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/commentPersistence.test.js`  
Expected: FAIL with missing function.

**Step 3: Write minimal implementation**

```js
function buildSoftDeletePatch(now = new Date()) {
  return { deleted_at: now.toISOString() };
}
```

Wire Sheets updates and `AuditLogs` inserts for admin actions.

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/commentPersistence.test.js`  
Expected: PASS.

**Step 5: Commit**

```bash
git add apps-script/routes/comments.js apps-script/routes/admin.js src/backend/core/commentsCore.js tests/unit/commentPersistence.test.js
git commit -m "feat: persist comments and moderation actions"
```

### Task 7: Frontend API Real Integration + Loading/Error UX States

**Files:**
- Modify: `web/api.js`
- Modify: `web/app.js`
- Modify: `web/state.js`
- Modify: `web/views/entryView.js`
- Modify: `web/views/composeView.js`
- Modify: `web/views/mailboxView.js`
- Modify: `web/views/letterView.js`
- Create: `tests/unit/frontendApiState.test.js`

**Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest';
import { reduceAppState } from '../../web/state.js';

describe('frontend async state', () => {
  it('stores loading and clears it on success', () => {
    let state = reduceAppState({ loading: false }, { type: 'REQUEST_START' });
    state = reduceAppState(state, { type: 'REQUEST_SUCCESS' });
    expect(state.loading).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/frontendApiState.test.js`  
Expected: FAIL because reducer does not support actions.

**Step 3: Write minimal implementation**

```js
case 'REQUEST_START':
  return { ...state, loading: true, error: '' };
case 'REQUEST_SUCCESS':
  return { ...state, loading: false };
case 'REQUEST_ERROR':
  return { ...state, loading: false, error: action.message };
```

Use real API mode by default when `window.__DABDA_USE_REAL_API__ !== false`, keep mock fallback flag for local testing.

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/frontendApiState.test.js`  
Expected: PASS.

**Step 5: Commit**

```bash
git add web/api.js web/app.js web/state.js web/views/entryView.js web/views/composeView.js web/views/mailboxView.js web/views/letterView.js tests/unit/frontendApiState.test.js
git commit -m "feat: wire real api client and request-state ux"
```

### Task 8: Apps Script Route Entry and Static Web Serving

**Files:**
- Modify: `apps-script/Code.js`
- Create: `apps-script/routes/static.js`
- Create: `tests/unit/routeDispatch.test.js`

**Step 1: Write the failing test**

```js
import { describe, expect, it } from 'vitest';
import { resolvePath } from '../../apps-script/routes/static.js';

describe('route dispatch', () => {
  it('resolves root to index path', () => {
    expect(resolvePath('/')).toBe('/index.html');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/routeDispatch.test.js`  
Expected: FAIL with missing module.

**Step 3: Write minimal implementation**

```js
function resolvePath(pathname = '/') {
  return pathname === '/' ? '/index.html' : pathname;
}
```

Update `doGet` and `doPost` path parsing so both API and static paths are deterministic.

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/routeDispatch.test.js`  
Expected: PASS.

**Step 5: Commit**

```bash
git add apps-script/Code.js apps-script/routes/static.js tests/unit/routeDispatch.test.js
git commit -m "feat: normalize route dispatch for api and static paths"
```

### Task 9: End-to-End Real-Flow Validation and Deployment Runbook

**Files:**
- Modify: `tests/e2e/phase1-submit-public-letter.spec.js`
- Modify: `tests/e2e/phase2-mailbox-comment.spec.js`
- Create: `docs/ops/apps-script-deploy-runbook.md`
- Modify: `README.md`

**Step 1: Write the failing e2e assertion**

```js
await expect(page.getByText('전송 완료')).toBeVisible();
```

Add this assertion where current UI does not yet show success to force a RED cycle.

**Step 2: Run e2e to verify it fails**

Run: `npm run test:e2e`  
Expected: FAIL on missing success message or real-flow mismatch.

**Step 3: Write minimal implementation**

- Add explicit UI success/error text for submit and comment operations.
- Document exact `clasp` deploy steps and required script properties.

**Step 4: Run tests to verify pass**

Run:
- `npm run test:unit`
- `npm run test:e2e`

Expected: PASS.

**Step 5: Commit**

```bash
git add tests/e2e/phase1-submit-public-letter.spec.js tests/e2e/phase2-mailbox-comment.spec.js docs/ops/apps-script-deploy-runbook.md README.md
git commit -m "docs: add deployment runbook and finalize real-flow validation"
```

## Final Verification Checklist

Run in order:

1. `npm ci`
2. `npm run test:unit`
3. `npm run test:e2e`
4. `npm run lint` (if configured)
5. `clasp push`
6. Deploy new Apps Script Web App version and verify:
   - entry code flow
   - register/login sheet persistence
   - letter creation with optional drive image
   - phase 2 mailbox + comments
   - admin moderation + audit logs
   - metrics rows appended

Expected:
- Unit/e2e suites pass.
- Sheets rows created/updated with expected columns.
- Drive uploads produce valid `image_file_id`.
- Private letters are never exposed through mailbox list.
