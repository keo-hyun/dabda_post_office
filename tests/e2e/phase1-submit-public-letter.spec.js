import { test, expect } from '@playwright/test';

test('phase1: user can submit public letter', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('입장 코드').fill('DABDA2026');
  await page.getByRole('button', { name: '입장하기' }).click();
  await expect(page.getByText('PHASE 1')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '편지 보내기' })).toHaveCount(0);
  await expect(page.locator('.compose-paper')).toBeVisible();
  await expect(page.locator('.compose-dear-image')).toBeVisible();
  await expect(page.locator('.compose-from-image')).toBeVisible();
  await expect(page.locator('.letter-paper-image')).toHaveCount(0);
  const fromLayout = await page.locator('.compose-from-group').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      marginTop: style.marginTop,
      gap: style.columnGap || style.gap
    };
  });
  expect(fromLayout.marginTop).toBe('44px');
  expect(fromLayout.gap).toBe('0px');

  const lineStyle = await page.locator('.compose-author-input').evaluate((element) => {
    const style = getComputedStyle(element);
    return style.borderBottomColor;
  });
  const contentLineStyle = await page.locator('.letter-paper-content').evaluate((element) => {
    const style = getComputedStyle(element);
    return style.backgroundImage;
  });
  expect(lineStyle).toContain('rgba');
  expect(contentLineStyle).toContain('linear-gradient');

  const overflowCheck = await page.locator('.compose-paper').evaluate((paper) => {
    const dear = paper.querySelector('.compose-dear-image');
    const fromGroup = paper.querySelector('.compose-from-group');
    const input = paper.querySelector('.compose-author-input');
    const dearRect = dear.getBoundingClientRect();
    const fromRect = fromGroup.getBoundingClientRect();
    const paperRect = paper.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();
    const intersects =
      !(dearRect.right <= fromRect.left || dearRect.left >= fromRect.right || dearRect.bottom <= fromRect.top || dearRect.top >= fromRect.bottom);

    return {
      inputInPaper: inputRect.right <= paperRect.right + 0.5,
      noOverlap: !intersects
    };
  });
  expect(overflowCheck.inputInPaper).toBe(true);
  expect(overflowCheck.noOverlap).toBe(true);

  const lineBackground = await page.locator('.letter-paper-content').evaluate((element) => {
    return getComputedStyle(element).backgroundImage;
  });
  expect(lineBackground).toContain('linear-gradient');

  await page.getByLabel('작성자').fill('다답이');
  await page.getByLabel('편지 내용').fill('테스트 편지');
  await page.getByRole('button', { name: '우체통에 넣기' }).click();
  await expect(page.getByText('전송 완료')).toBeVisible();
});
