import { expect, test } from '@playwright/test';

test('phase1: mobile author input starts right after from image', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.sessionStorage.clear();
  });
  await page.goto('/');
  await page.getByLabel('입장 코드').fill('DABDA2026');
  await page.getByRole('button', { name: '입장하기' }).click();
  await expect(page.locator('.compose-paper .compose-author-input')).toBeVisible();

  const gap = await page.locator('.compose-paper .compose-from-group').evaluate((group) => {
    const fromImage = group.querySelector('.compose-from-image');
    const authorInput = group.querySelector('.compose-author-input');
    const imageRect = fromImage.getBoundingClientRect();
    const inputRect = authorInput.getBoundingClientRect();
    return inputRect.left - imageRect.right;
  });

  expect(gap).toBeLessThanOrEqual(0);
});
