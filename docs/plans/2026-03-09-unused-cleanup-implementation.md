# Unused Code/Asset Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** `codex/uiux-polish`와 `gh-pages`에서 미사용 코드/에셋을 제거하고, 정리 결과를 `main`에 동기화한다.

**Architecture:** `codex/uiux-polish`를 소스 정본으로 삼아 참조 기반 정리를 수행한다. 먼저 보호 테스트를 추가해 미사용 에셋 제거가 런타임/테스트를 깨지 않도록 고정한 뒤, 동일 정리를 `gh-pages`에 반영하고 마지막에 `main`을 동기화한다. 모든 Task는 TDD(실패 확인 → 최소 구현 → 통과 확인)로 수행한다.

**Tech Stack:** JavaScript (ESM), Vitest, Playwright, Git worktrees (`codex/uiux-polish`, `gh-pages`)

---

### Task 1: Add Cleanup Guard Test In `codex/uiux-polish`

**Files:**
- Create: `tests/unit/frontendAssetCleanup.test.js`
- Test: `tests/unit/frontendAssetCleanup.test.js`

**Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const WEB_DIR = path.resolve(process.cwd(), 'web');
const ASSET_DIR = path.join(WEB_DIR, 'assets');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

describe('frontend asset cleanup guards', () => {
  it('does not reference legacy image assets', () => {
    const files = [
      path.join(WEB_DIR, 'styles.css'),
      path.join(WEB_DIR, 'views', 'composeView.js'),
      path.join(WEB_DIR, 'views', 'mailboxView.js'),
      path.join(WEB_DIR, 'views', 'letterView.js')
    ];

    const content = files.map(read).join('\n');
    expect(content).not.toContain('letter-paper.png');
    expect(content).not.toContain('post.png');
    expect(content).not.toContain('post_2.png');
  });

  it('keeps required production assets', () => {
    ['Dear_Hope.png', 'From.png', 'post_3.png', 'audio_1.mp3'].forEach((name) => {
      expect(fs.existsSync(path.join(ASSET_DIR, name))).toBe(true);
    });
  });

  it('removes legacy image files from web/assets', () => {
    ['letter-paper.png', 'post.png', 'post_2.png'].forEach((name) => {
      expect(fs.existsSync(path.join(ASSET_DIR, name))).toBe(false);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/frontendAssetCleanup.test.js`
Expected: FAIL at `removes legacy image files from web/assets` (legacy files still exist)

**Step 3: Write minimal implementation**

No production code changes yet. Keep failing test as red baseline for cleanup.

**Step 4: Re-run to confirm red state is stable**

Run: `npm run test:unit -- tests/unit/frontendAssetCleanup.test.js`
Expected: FAIL consistently for legacy files

**Step 5: Commit**

```bash
git add tests/unit/frontendAssetCleanup.test.js
git commit -m "test: add frontend asset cleanup guard"
```

---

### Task 2: Remove Unused Assets In `codex/uiux-polish`

**Files:**
- Delete: `web/assets/letter-paper.png`
- Delete: `web/assets/post.png`
- Delete: `web/assets/post_2.png`
- Test: `tests/unit/frontendAssetCleanup.test.js`

**Step 1: Keep failing test as regression target**

Run: `npm run test:unit -- tests/unit/frontendAssetCleanup.test.js`
Expected: FAIL before deletion

**Step 2: Write minimal implementation**

Run:

```bash
rm web/assets/letter-paper.png web/assets/post.png web/assets/post_2.png
```

**Step 3: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/frontendAssetCleanup.test.js`
Expected: PASS

**Step 4: Run focused regression tests**

Run: `npm run test:unit -- tests/unit/frontendApiClient.test.js tests/unit/frontendState.test.js tests/unit/commentPersistence.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add -A web/assets tests/unit/frontendAssetCleanup.test.js
git commit -m "chore: remove unused frontend legacy assets"
```

---

### Task 3: Verify No Unused Frontend Functionality Is Accidentally Removed

**Files:**
- Modify (if needed): `tests/e2e/phase2-mailbox-comment.spec.js`
- Modify (if needed): `tests/e2e/phase1-submit-public-letter.spec.js`
- Test: `tests/e2e/phase1-submit-public-letter.spec.js`
- Test: `tests/e2e/phase2-mailbox-comment.spec.js`

**Step 1: Write/adjust failing expectation (if missing)**

Ensure tests assert these still work:
- Phase 1 letter submit success transition
- Phase 2 mailbox open and comment submit/render

(If assertion is missing, add one strict expectation first so it can fail when behavior breaks.)

**Step 2: Run E2E subset to verify baseline behavior**

Run:

```bash
npm run test:e2e -- tests/e2e/phase1-submit-public-letter.spec.js tests/e2e/phase2-mailbox-comment.spec.js
```

Expected: PASS (or FAIL only if assertion tightened and behavior mismatch found)

**Step 3: Write minimal implementation (only if Step 2 fails)**

Apply smallest fix needed in:
- `web/app.js`
- `web/views/composeView.js`
- `web/views/letterView.js`
- `web/views/mailboxView.js`

**Step 4: Re-run E2E subset**

Run same command as Step 2.
Expected: PASS

**Step 5: Commit**

```bash
git add tests/e2e web
git commit -m "test: lock core phase1/phase2 flows after cleanup"
```

(If no test file changed, skip commit for this task and note "no code change required" in execution log.)

---

### Task 4: Sync Cleanup To `gh-pages` And Validate

**Files:**
- Delete: `assets/letter-paper.png`
- Delete: `assets/post.png`
- Delete: `assets/post_2.png`
- Verify: `views/composeView.js`, `views/mailboxView.js`, `views/letterView.js`, `styles.css`

**Step 1: Run failing shell checks on `gh-pages`**

Run in `gh-pages` worktree:

```bash
test ! -f assets/letter-paper.png
test ! -f assets/post.png
test ! -f assets/post_2.png
```

Expected: FAIL before deletion

**Step 2: Write minimal implementation**

Run:

```bash
rm assets/letter-paper.png assets/post.png assets/post_2.png
```

**Step 3: Run pass checks + reference checks**

Run:

```bash
test ! -f assets/letter-paper.png
test ! -f assets/post.png
test ! -f assets/post_2.png
rg -n "letter-paper\.png|post_2\.png|post\.png" views styles.css app.js api.js || true
```

Expected:
- all `test ! -f` pass
- `rg` finds no runtime reference to removed assets

**Step 4: Commit and push**

```bash
git add -A
git commit -m "chore: remove unused legacy assets from gh-pages"
git push origin gh-pages
```

---

### Task 5: Sync `codex/uiux-polish` Cleanup Result To `main`

**Files:**
- Sync target: `web/**`, `tests/**`, `docs/plans/2026-03-09-unused-cleanup-*.md`

**Step 1: Create failing check on `main`**

Run on `main`:

```bash
test -f web/assets/letter-paper.png && echo "legacy exists"
```

Expected: Either file exists (fail target) or path mismatch; if mismatch, note that `main` is outdated and needs full sync.

**Step 2: Write minimal implementation (sync from source branch)**

Preferred (full branch sync):

```bash
git checkout main
git merge --no-ff codex/uiux-polish
```

If merge conflicts are excessive, fallback:

```bash
git checkout main
git checkout codex/uiux-polish -- web tests docs/plans
```

**Step 3: Run verification tests on `main`**

Run:

```bash
npm run test:unit
npm run test:e2e -- tests/e2e/phase1-submit-public-letter.spec.js tests/e2e/phase2-mailbox-comment.spec.js
```

Expected: PASS

**Step 4: Commit and push `main`**

```bash
git add -A
git commit -m "chore: sync cleaned uiux source into main"
git push origin main
```

---

### Task 6: Final Verification Before Completion (@superpowers/verification-before-completion)

**Files:**
- No code change required

**Step 1: Run final verification matrix**

Run in `codex/uiux-polish`:

```bash
npm run test:unit
npm run test:e2e
```

Run in `gh-pages`:

```bash
rg -n "letter-paper\.png|post_2\.png|post\.png" . -g '!*.map' || true
```

Run in `main`:

```bash
npm run test:unit
npm run test:e2e -- tests/e2e/phase1-submit-public-letter.spec.js tests/e2e/phase2-mailbox-comment.spec.js
```

**Step 2: Verify branch states**

Run:

```bash
git -C /Users/keohyunnoh/Desktop/Dabda\ Post\ Office/.worktrees/uiux-polish log -1 --oneline
git -C /Users/keohyunnoh/Desktop/Dabda\ Post\ Office/.worktrees/gh-pages-publish log -1 --oneline
git -C /Users/keohyunnoh/Desktop/Dabda\ Post\ Office log -1 --oneline
```

Expected: 각 브랜치 최신 커밋이 정리 결과를 반영

**Step 3: Completion report**

Include:
- 삭제된 미사용 코드/에셋 목록
- 브랜치별 커밋 SHA
- 테스트 결과(명령 + pass/fail)
- 남은 리스크(있다면)
