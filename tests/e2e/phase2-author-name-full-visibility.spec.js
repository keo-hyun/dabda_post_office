import { expect, test } from '@playwright/test';

test('phase2: read view keeps author right-aligned and fully visible on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.sessionStorage.clear();
  });
  await page.goto('/?phase=PHASE_2');
  await page.getByLabel('입장 코드').fill('DABDA2026');
  await page.getByRole('button', { name: '입장하기' }).click();

  await expect(page.locator('.mailbox-post-button').first()).toBeVisible();
  await page.locator('.mailbox-post-button').first().click();
  await expect(page.locator('.letter-read-stage .compose-author-readonly')).toBeVisible();

  await page.locator('.letter-read-stage .compose-author-readonly').evaluate((element) => {
    element.textContent = '아주아주긴작성자이름테스트아주아주긴작성자이름테스트';
  });

  const result = await page.locator('.letter-read-stage').evaluate((stage) => {
    const author = stage.querySelector('.compose-author-readonly');
    const group = stage.querySelector('.compose-from-group');
    const fromImage = stage.querySelector('.compose-from-image');
    const stageRect = stage.getBoundingClientRect();
    const groupRect = group.getBoundingClientRect();
    const fromRect = fromImage.getBoundingClientRect();
    const authorRect = author.getBoundingClientRect();
    const computed = getComputedStyle(author);
    return {
      widthRatio: groupRect.width / stageRect.width,
      fromLeftOfAuthor: fromRect.left < authorRect.left,
      authorRightAnchored: Math.abs(groupRect.right - authorRect.right) <= 1,
      whiteSpace: computed.whiteSpace,
      textOverflow: computed.textOverflow,
      overflowX: computed.overflowX,
      overflowWrap: computed.overflowWrap,
      textAlign: computed.textAlign
    };
  });

  expect(result.widthRatio).toBeGreaterThanOrEqual(0.5);
  expect(result.fromLeftOfAuthor).toBe(true);
  expect(result.authorRightAnchored).toBe(true);
  expect(result.whiteSpace).not.toBe('nowrap');
  expect(result.textOverflow).not.toBe('ellipsis');
  expect(result.overflowX).not.toBe('hidden');
  expect(result.overflowWrap).toBe('anywhere');
  expect(result.textAlign).toBe('right');
});
