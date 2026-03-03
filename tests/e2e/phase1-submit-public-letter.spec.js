import { test, expect } from '@playwright/test';

test('phase1: user can submit public letter', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('입장 코드').fill('DABDA2026');
  await page.getByRole('button', { name: '입장하기' }).click();
  await expect(page.getByText('편지 보내기')).toBeVisible();
});
