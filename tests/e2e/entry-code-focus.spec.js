import { test, expect } from '@playwright/test';

test('entry input keeps focus while typing continuously', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('2026 New Single [Dear Hope]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dabda PostOffice' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'house' })).toBeVisible();

  const entryInput = page.getByLabel('입장 코드');
  await entryInput.click();
  const originalNode = await entryInput.elementHandle();
  await page.keyboard.type('DABDA2026');

  await expect(entryInput).toHaveValue('DABDA2026');
  await expect(page.evaluate(() => document.activeElement?.id)).resolves.toBe('entryCode');
  await expect(page.evaluate((node) => node === document.querySelector('#entryCode'), originalNode)).resolves.toBe(true);
});

test('entry input does not force uppercase keyboard hint and accepts lowercase code', async ({ page }) => {
  await page.goto('/');

  const entryInput = page.getByLabel('입장 코드');
  await expect(entryInput).toHaveAttribute('autocapitalize', 'none');

  await entryInput.fill('dabda2026');
  await expect(entryInput).toHaveValue('dabda2026');
  await page.getByRole('button', { name: '입장하기' }).click();

  await expect(page.locator('#composeForm')).toBeVisible();
});
