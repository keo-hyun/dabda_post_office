import { expect, test } from '@playwright/test';

test('phase1: compose loading copy uses the pink accent color inside card layout', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('입장 코드').fill('DABDA2026');
  await page.getByRole('button', { name: '입장하기' }).click();
  await expect(page.locator('#composeForm')).toBeVisible();

  const color = await page.locator('.card_letter').evaluate((card) => {
    const p = document.createElement('p');
    p.className = 'muted compose-loading';
    p.textContent = '편지를 전송하고 있어요...';
    card.appendChild(p);
    return getComputedStyle(p).color;
  });

  expect(color).toBe('rgb(255, 190, 254)');
});
