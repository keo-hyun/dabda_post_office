# Email Collection Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add email capture to letter submission and persist it to the `Letters` sheet while removing unused image-storage fields.

**Architecture:** Keep the existing compose flow and extend the payload with a validated `email` field. Update the shared `Letters` schema and GAS route to store `email`, and delete `image_file_id`/Drive upload handling from the letter creation path so the frontend and backend contracts stay aligned.

**Tech Stack:** Vanilla JS, HTML, CSS, Apps Script, Vitest

---

### Task 1: Lock the contract with failing tests

**Files:**
- Modify: `tests/unit/schema.test.js`
- Modify: `tests/unit/frontendApiClient.test.js`
- Modify: `tests/unit/authorOnlySubmission.test.js`
- Modify: `tests/unit/appsScriptRouteCaching.test.js`

**Step 1: Write the failing test**
- Assert `SHEETS.LETTERS.columns` contains `email` and no longer contains `image_file_id`.
- Assert frontend submit payloads keep `email`.
- Assert `createLetterRoute` returns/stores `email` and no longer includes `image_file_id`.

**Step 2: Run test to verify it fails**
Run: `npm run test:unit -- tests/unit/schema.test.js tests/unit/frontendApiClient.test.js tests/unit/authorOnlySubmission.test.js tests/unit/appsScriptRouteCaching.test.js`
Expected: FAIL because the current contract does not include `email` and still includes `image_file_id`.

**Step 3: Write minimal implementation**
- Update the shared schema and route object shape.

**Step 4: Run test to verify it passes**
Run the same command and expect PASS.

**Step 5: Commit**
```bash
git add tests/unit/schema.test.js tests/unit/frontendApiClient.test.js tests/unit/authorOnlySubmission.test.js tests/unit/appsScriptRouteCaching.test.js src/shared/schema.js apps-script/routes/letters.js
git commit -m "feat: persist email for letters"
```

### Task 2: Add compose UI and payload wiring

**Files:**
- Modify: `web/views/composeView.js`
- Modify: `web/styles.css`
- Modify: `web/api.js`

**Step 1: Write the failing test**
- Add/adjust frontend test coverage to require `email` in the submit payload.

**Step 2: Run test to verify it fails**
Run: `npm run test:unit -- tests/unit/frontendApiClient.test.js`
Expected: FAIL until the payload includes `email`.

**Step 3: Write minimal implementation**
- Add an email input between content and visibility using the existing line-input design.
- Include `email` in mock and real submit payloads.

**Step 4: Run test to verify it passes**
Run the same command and expect PASS.

**Step 5: Commit**
```bash
git add web/views/composeView.js web/styles.css web/api.js
git commit -m "feat: add compose email field"
```

### Task 3: Remove image-storage remnants and verify locally

**Files:**
- Modify: `apps-script/lib/core.js`
- Modify: `tests/unit/scriptProps.test.js`
- Modify: `tests/unit/driveGateway.test.js`

**Step 1: Write the failing test**
- Update property/contract tests so Drive image config is no longer required for letters.

**Step 2: Run test to verify it fails**
Run: `npm run test:unit -- tests/unit/scriptProps.test.js tests/unit/driveGateway.test.js`
Expected: FAIL until image-storage assumptions are removed from the active contract.

**Step 3: Write minimal implementation**
- Remove only the actively used image-storage contract pieces from letter creation and required props.
- Keep unrelated Drive helper code only if still referenced by tests or code.

**Step 4: Run test to verify it passes**
Run the same command and expect PASS.

**Step 5: Commit**
```bash
git add apps-script/lib/core.js tests/unit/scriptProps.test.js tests/unit/driveGateway.test.js
git commit -m "refactor: remove letter image storage contract"
```
