import { test, expect } from '@playwright/test';

test('phase1: user can submit public letter', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('입장 코드').fill('DABDA2026');
  await page.getByRole('button', { name: '입장하기' }).click();
  await expect(page.getByText('편지 보내기')).toBeVisible();

  await page.getByLabel('작성자').fill('다답이');
  await page.getByLabel('편지 내용').fill('테스트 편지');
  await page.getByRole('button', { name: '우체통에 넣기' }).click();
  await expect(page.getByText('전송 완료')).toBeVisible();
});
