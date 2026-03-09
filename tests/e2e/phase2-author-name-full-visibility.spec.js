import { expect, test } from '@playwright/test';

test('phase2: read view author area is wide enough on mobile and avoids ellipsis', async ({ page }) => {
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

  const result = await page.locator('.letter-read-stage').evaluate((stage) => {
    const author = stage.querySelector('.compose-author-readonly');
    const group = stage.querySelector('.compose-from-group');
    const stageRect = stage.getBoundingClientRect();
    const groupRect = group.getBoundingClientRect();
    const computed = getComputedStyle(author);
    return {
      widthRatio: groupRect.width / stageRect.width,
      whiteSpace: computed.whiteSpace,
      textOverflow: computed.textOverflow,
      overflowX: computed.overflowX,
      overflowWrap: computed.overflowWrap
    };
  });

  expect(result.widthRatio).toBeGreaterThanOrEqual(0.45);
  expect(result.whiteSpace).not.toBe('nowrap');
  expect(result.textOverflow).not.toBe('ellipsis');
  expect(result.overflowX).not.toBe('hidden');
  expect(result.overflowWrap).toBe('anywhere');
});
