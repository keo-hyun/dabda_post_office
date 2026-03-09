import { expect, test } from '@playwright/test';

test('phase2: keeps mailbox screen after reload once entry code is accepted', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?phase=PHASE_2');
  await page.getByLabel('입장 코드').fill('DABDA2026');
  await page.getByRole('button', { name: '입장하기' }).click();

  await expect(page.getByText('우체통 둘러보기')).toBeVisible();

  await page.reload();

  await expect(page.getByText('우체통 둘러보기')).toBeVisible();
  await expect(page.getByLabel('입장 코드')).toHaveCount(0);
});
