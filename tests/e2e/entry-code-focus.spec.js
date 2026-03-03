import { test, expect } from '@playwright/test';

test('entry input keeps focus while typing continuously', async ({ page }) => {
  await page.goto('/');

  const entryInput = page.getByLabel('입장 코드');
  await entryInput.click();
  await page.keyboard.type('DABDA2026');

  await expect(entryInput).toHaveValue('DABDA2026');
});
