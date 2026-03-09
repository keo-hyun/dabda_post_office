import { expect, test } from '@playwright/test';

test('phase1: mobile author input shifts slightly left', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.sessionStorage.clear();
  });
  await page.goto('/');
  await page.getByLabel('입장 코드').fill('DABDA2026');
  await page.getByRole('button', { name: '입장하기' }).click();
  await expect(page.locator('.compose-paper .compose-author-input')).toBeVisible();

  const shiftX = await page.locator('.compose-paper .compose-author-input').evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    if (!transform || transform === 'none') return 0;
    return new DOMMatrixReadOnly(transform).m41;
  });

  expect(shiftX).toBe(-4);
});
