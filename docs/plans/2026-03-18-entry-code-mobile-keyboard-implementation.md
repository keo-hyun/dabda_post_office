# Entry Code Mobile Keyboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 모바일 입장 코드 입력에서 입력창 재생성을 제거하고 입력 속성을 정리해 키보드 리셋 현상을 완화한다.

**Architecture:** `ENTRY` 화면은 입력 중 전체 리렌더 대신 부분 상태 업데이트를 사용한다. `entryCode`는 메모리 상태와 DOM value를 동기화하되, 화면 전환/요청 상태 변경에만 전체 렌더를 유지한다.

**Tech Stack:** Vanilla JS, Vitest, Playwright

---

### Task 1: Add Regression Test For Stable Entry Input

**Files:**
- Modify: `tests/e2e/entry-code-focus.spec.js`
- Test: `tests/e2e/entry-code-focus.spec.js`

**Step 1: Write the failing test**

기존 테스트에 아래 검증을 추가한다:
- 타이핑 후에도 `document.activeElement.id === 'entryCode'`
- 입력 요소 핸들이 타이핑 전후 동일 DOM 노드인지 확인

예시:

```js
const handle = await entryInput.elementHandle();
await page.keyboard.type('DABDA2026');
await expect(entryInput).toHaveValue('DABDA2026');
await expect(page.evaluate(() => document.activeElement?.id)).resolves.toBe('entryCode');
await expect(await entryInput.elementHandle()).toBe(handle);
```

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/entry-code-focus.spec.js`

Expected:
- FAIL because the input DOM node is recreated during typing

**Step 3: Write minimal implementation**

No production change yet.

**Step 4: Re-run test to confirm failure is real**

Run: `npm run test:e2e -- tests/e2e/entry-code-focus.spec.js`

Expected:
- Same failure reproduces

**Step 5: Commit**

```bash
git add tests/e2e/entry-code-focus.spec.js
git commit -m "test: cover stable entry input during typing"
```

---

### Task 2: Stop Re-Rendering Entry Screen On Every Keystroke

**Files:**
- Modify: `web/app.js`
- Modify: `web/views/entryView.js`
- Test: `tests/e2e/entry-code-focus.spec.js`
- Test: `tests/unit/frontendState.test.js`

**Step 1: Keep the failing test as the guard**

Run: `npm run test:e2e -- tests/e2e/entry-code-focus.spec.js`

Expected:
- FAIL before implementation

**Step 2: Write minimal implementation**

Implement:
- In `web/app.js`, replace `onEntryCodeChange: (value) => dispatch({ type: 'SET_ENTRY_CODE', value })`
  with a non-rendering state update path for `ENTRY`
- Keep full `dispatch()` for submit/loading/error/screen changes
- In `web/views/entryView.js`, add:
  - `autocapitalize="characters"`
  - `autocorrect="off"`
  - `spellcheck="false"`
  - `inputmode="text"`

**Step 3: Run test to verify it passes**

Run: `npm run test:e2e -- tests/e2e/entry-code-focus.spec.js`

Expected:
- PASS

**Step 4: Run focused unit tests**

Run:

```bash
npm run test:unit -- tests/unit/frontendState.test.js tests/unit/frontendApiState.test.js
```

Expected:
- PASS

**Step 5: Commit**

```bash
git add web/app.js web/views/entryView.js tests/e2e/entry-code-focus.spec.js tests/unit/frontendState.test.js tests/unit/frontendApiState.test.js
git commit -m "fix: stabilize entry input on mobile"
```

---

### Task 3: Sync To Deployed Frontend

**Files:**
- Modify: `.worktrees/gh-pages-publish/app.js`
- Modify: `.worktrees/gh-pages-publish/views/entryView.js`

**Step 1: Apply the same minimal runtime changes to `gh-pages`**

Mirror the source branch changes without altering unrelated design files.

**Step 2: Verify locally against the `gh-pages` worktree**

Run a local static server and execute a browser check that:
- focuses `#entryCode`
- types `DABDA2026`
- confirms input value stays intact

**Step 3: Commit and push**

```bash
git -C .worktrees/gh-pages-publish add app.js views/entryView.js
git -C .worktrees/gh-pages-publish commit -m "fix: stabilize mobile entry input"
git -C .worktrees/gh-pages-publish push origin gh-pages
```

---

### Task 4: Final Verification (@superpowers/verification-before-completion)

**Files:**
- No code changes

**Step 1: Run final verification**

Run:

```bash
npm run test:unit
npm run test:e2e -- tests/e2e/entry-code-focus.spec.js
```

Run for deployed branch:

```bash
git -C .worktrees/gh-pages-publish status --short
```

Expected:
- unit tests pass
- focused E2E passes
- `gh-pages` worktree is clean after push

**Step 2: Report limits clearly**

State explicitly:
- numeric keypad persistence cannot be guaranteed on all mobile browsers
- DOM stability fix and input attribute tuning were applied
