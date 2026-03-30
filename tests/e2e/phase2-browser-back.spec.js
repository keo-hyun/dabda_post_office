import { expect, test } from '@playwright/test';

test('phase2: browser back from a letter returns to the mailbox grid', async ({ page }) => {
  await page.goto('/?phase=PHASE_2');
  await page.getByLabel('입장 코드').fill('DABDA2026');
  await page.getByRole('button', { name: '입장하기' }).click();

  await expect(page.getByRole('heading', { name: '우체통 둘러보기' })).toBeVisible();
  await expect(page.locator('[data-letter-id]')).toHaveCount(1);

  await page.locator('[data-letter-id]').first().click();
  await expect(page.locator('.letter-paper-stage')).toBeVisible();
  await expect(page.getByRole('heading', { name: '댓글' })).toBeVisible();

  await page.goBack();

  await expect(page.getByRole('heading', { name: '우체통 둘러보기' })).toBeVisible();
  await expect(page.locator('[data-letter-id]')).toHaveCount(1);
});
