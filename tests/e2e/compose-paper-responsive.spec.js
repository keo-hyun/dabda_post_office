import { expect, test } from '@playwright/test';

async function getLineStep(page, width, height) {
  await page.setViewportSize({ width, height });
  await page.goto('/');
  await page.getByLabel('입장 코드').fill('DABDA2026');
  await page.getByRole('button', { name: '입장하기' }).click();
  await expect(page.locator('.letter-paper-stage')).toBeVisible();

  return page.locator('.letter-paper-stage').evaluate((element) => {
    return getComputedStyle(element).getPropertyValue('--line-step').trim();
  });
}

test('compose paper line-step is tuned per mobile breakpoint', async ({ page }) => {
  const step360 = await getLineStep(page, 360, 740);
  const step390 = await getLineStep(page, 390, 844);
  const step412 = await getLineStep(page, 412, 915);

  expect(step360).not.toBe(step390);
  expect(step390).not.toBe(step412);
});
