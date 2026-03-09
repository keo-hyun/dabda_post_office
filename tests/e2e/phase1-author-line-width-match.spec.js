import { expect, test } from '@playwright/test';

test('phase1: mobile author line right edge matches letter content right edge', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.sessionStorage.clear();
  });
  await page.goto('/');
  await page.getByLabel('입장 코드').fill('DABDA2026');
  await page.getByRole('button', { name: '입장하기' }).click();

  await expect(page.locator('.compose-paper .compose-author-input')).toBeVisible();
  await expect(page.locator('.compose-paper .letter-paper-content')).toBeVisible();

  const rightDiff = await page.locator('.compose-paper').evaluate((paper) => {
    const authorInput = paper.querySelector('.compose-author-input');
    const letterContent = paper.querySelector('.letter-paper-content');
    const authorRect = authorInput.getBoundingClientRect();
    const contentRect = letterContent.getBoundingClientRect();
    return Math.abs(authorRect.right - contentRect.right);
  });

  expect(rightDiff).toBeLessThanOrEqual(2);
});
