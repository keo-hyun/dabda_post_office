import { test, expect } from '@playwright/test';

test('phase2: user can read mailbox and write comment', async ({ page }) => {
  await page.goto('/?phase=PHASE_2');
  await page.getByLabel('입장 코드').fill('DABDA2026');
  await page.getByRole('button', { name: '입장하기' }).click();

  await expect(page.getByText('우체통 둘러보기')).toBeVisible();
  await page.locator('.letter-button').first().click();

  await expect(page.getByRole('heading', { level: 2 })).toContainText('님의 편지');
  await expect(page.getByRole('heading', { name: '댓글' })).toBeVisible();
  await page.getByLabel('닉네임').fill('테스터');
  await page.getByLabel('댓글').fill('반가워요');
  await page.getByRole('button', { name: '댓글 남기기' }).click();

  await expect(page.getByText('반가워요')).toBeVisible();
});
