import { test, expect } from '@playwright/test';

test('entry input keeps focus while typing continuously', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('다브다 우체국')).toBeVisible();
  await expect(page.getByRole('heading', { name: '우체국 문을 열어주세요.' })).toBeVisible();
  await expect(page.getByText('입장 코드를 입력해 우체국 문을 열어주세요.')).toHaveCount(0);

  const entryInput = page.getByLabel('입장 코드');
  await entryInput.click();
  const originalNode = await entryInput.elementHandle();
  await page.keyboard.type('DABDA2026');

  await expect(entryInput).toHaveValue('DABDA2026');
  await expect(page.evaluate(() => document.activeElement?.id)).resolves.toBe('entryCode');
  await expect(page.evaluate((node) => node === document.querySelector('#entryCode'), originalNode)).resolves.toBe(true);
});
