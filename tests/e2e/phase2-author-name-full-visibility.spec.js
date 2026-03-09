import { expect, test } from '@playwright/test';

test('phase2: read view author name allows wrapping instead of ellipsis', async ({ page }) => {
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

  const style = await page.locator('.letter-read-stage .compose-author-readonly').evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      whiteSpace: computed.whiteSpace,
      textOverflow: computed.textOverflow,
      overflowX: computed.overflowX,
      overflowWrap: computed.overflowWrap
    };
  });

  expect(style.whiteSpace).not.toBe('nowrap');
  expect(style.textOverflow).not.toBe('ellipsis');
  expect(style.overflowX).not.toBe('hidden');
  expect(style.overflowWrap).toBe('anywhere');
});
