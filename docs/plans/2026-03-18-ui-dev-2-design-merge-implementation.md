# UI Dev 2 Design Merge Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Merge the `ui_dev_2` visual refresh into the current frontend without regressing deployed audio behavior or mobile entry-code input stability.

**Architecture:** Keep the current runtime code as the source of truth, then selectively transplant `ui_dev_2` templates, styles, and image assets. Protect the existing audio path and entry typing behavior with tests before merging markup changes, then mirror the verified result to `gh-pages`.

**Tech Stack:** Vanilla JS, HTML, CSS, Vitest, Playwright, GitHub Pages

---

### Task 1: Protect runtime invariants with failing tests

**Files:**
- Modify: `tests/unit/frontendAssetCleanup.test.js`
- Test: `tests/e2e/entry-code-focus.spec.js`

**Step 1: Write the failing test**
- Assert all required design/runtime assets exist after the merge, including `audio_1.mp3` and newly referenced image assets.
- Keep the entry input focus test asserting the same DOM node survives continuous typing.

**Step 2: Run test to verify it fails**
Run: `npm run test:unit -- tests/unit/frontendAssetCleanup.test.js`
Expected: FAIL until new design assets are added to `web/assets`

**Step 3: Write minimal implementation**
- Copy only the referenced `ui_dev_2` image assets into `web/assets`
- Do not replace `audio_1.mp3`

**Step 4: Run test to verify it passes**
Run: `npm run test:unit -- tests/unit/frontendAssetCleanup.test.js`
Expected: PASS

**Step 5: Commit**
```bash
git add tests/unit/frontendAssetCleanup.test.js web/assets
git commit -m "test: protect ui dev 2 asset merge"
```

### Task 2: Merge view and style changes without regressing behavior

**Files:**
- Modify: `web/index.html`
- Modify: `web/styles.css`
- Modify: `web/views/entryView.js`
- Modify: `web/views/composeView.js`
- Modify: `web/views/letterView.js`
- Modify: `web/views/mailboxView.js`
- Modify: `web/views/transitionView.js`
- Modify: `web/app.js`

**Step 1: Write the failing test**
- Re-run the entry typing E2E after applying `ui_dev_2` markup expectations.

**Step 2: Run test to verify it fails**
Run: `npm run test:e2e -- tests/e2e/entry-code-focus.spec.js`
Expected: FAIL if the merge reintroduces full rerendering or removes mobile-friendly input attributes.

**Step 3: Write minimal implementation**
- Port `ui_dev_2` visual markup and styles.
- Keep current `app.js` entry update logic and current `audio.js` behavior.
- Retain `entryView` input attributes and no-rerender input handling.

**Step 4: Run test to verify it passes**
Run: `npm run test:e2e -- tests/e2e/entry-code-focus.spec.js`
Expected: PASS

**Step 5: Commit**
```bash
git add web/index.html web/styles.css web/views web/app.js
git commit -m "feat: merge ui dev 2 design refresh"
```

### Task 3: Verify and deploy

**Files:**
- Modify: `.worktrees/gh-pages-publish/index.html`
- Modify: `.worktrees/gh-pages-publish/styles.css`
- Modify: `.worktrees/gh-pages-publish/views/*`
- Modify: `.worktrees/gh-pages-publish/app.js`
- Modify: `.worktrees/gh-pages-publish/assets/*`

**Step 1: Run verification**
Run: `npm run test:unit -- tests/unit/frontendAssetCleanup.test.js tests/unit/frontendState.test.js tests/unit/frontendApiState.test.js`
Expected: PASS

**Step 2: Run UI verification**
Run: `npm run test:e2e -- tests/e2e/entry-code-focus.spec.js`
Expected: PASS

**Step 3: Mirror to `gh-pages`**
- Copy verified frontend files to the `gh-pages` worktree.
- Keep the deployed `assets/audio_1.mp3` untouched.

**Step 4: Verify `gh-pages` locally**
- Serve the `gh-pages` worktree and confirm the entry input still keeps the same DOM node while typing.

**Step 5: Commit**
```bash
git -C .worktrees/gh-pages-publish add index.html styles.css app.js views assets
git -C .worktrees/gh-pages-publish commit -m "feat: apply ui dev 2 design refresh"
git -C .worktrees/gh-pages-publish push origin gh-pages
```
