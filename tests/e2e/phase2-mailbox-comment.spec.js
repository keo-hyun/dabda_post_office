import { test, expect } from '@playwright/test';

test('phase2: user can read mailbox and write comment', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?phase=PHASE_2');
  await page.getByLabel('입장 코드').fill('DABDA2026');
  await page.getByRole('button', { name: '입장하기' }).click();

  await expect(page.getByText('우체통 둘러보기')).toBeVisible();
  await expect(page.getByText('PHASE 2')).toHaveCount(0);
  const gridColumns = await page.locator('.mailbox-list').evaluate((element) => {
    return getComputedStyle(element).gridTemplateColumns;
  });
  expect(gridColumns.split(' ').length).toBeGreaterThanOrEqual(2);

  await expect(page.locator('.mailbox-post-button').first()).toBeVisible();
  await expect(page.locator('.mailbox-post-image').first()).toHaveAttribute('src', /post_3\.png$/);
  await expect(page.locator('.mailbox-post-from-image')).toHaveCount(0);
  await expect(page.locator('.mailbox-post-author').first()).toBeVisible();
  const placement = await page.locator('.mailbox-post-button').first().evaluate((button) => {
    const image = button.querySelector('.mailbox-post-image');
    const author = button.querySelector('.mailbox-post-author');
    const cardRect = button.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    const authorRect = author.getBoundingClientRect();
    const authorStyle = getComputedStyle(author);
    return (
      {
        inImage:
          authorRect.left >= imageRect.left &&
          authorRect.right <= imageRect.right &&
          authorRect.top >= imageRect.top &&
          authorRect.bottom <= imageRect.bottom,
        borderBottomWidth: authorStyle.borderBottomWidth,
        cardRatio: cardRect.height / cardRect.width,
        authorXRatio: (authorRect.left - imageRect.left) / imageRect.width,
        authorMidXRatio: ((authorRect.left + authorRect.width / 2) - imageRect.left) / imageRect.width,
        authorYRatio: (authorRect.top - imageRect.top) / imageRect.height
      }
    );
  });
  expect(placement.inImage).toBe(true);
  expect(placement.borderBottomWidth).toBe('0px');
  expect(placement.cardRatio).toBeLessThanOrEqual(1.15);
  expect(placement.authorMidXRatio).toBeGreaterThanOrEqual(0.45);
  expect(placement.authorMidXRatio).toBeLessThanOrEqual(0.55);
  expect(placement.authorYRatio).toBeGreaterThanOrEqual(0.5);
  expect(placement.authorYRatio).toBeLessThanOrEqual(0.8);
  await page.locator('.mailbox-post-button').first().click();

  await expect(page.locator('.letter-read-stage')).toBeVisible();
  await expect(page.locator('.letter-read-stage .compose-dear-image')).toBeVisible();
  await expect(page.locator('.letter-read-stage .compose-from-image')).toBeVisible();
  await expect(page.locator('.letter-paper-content-readonly')).toBeVisible();
  await expect(page.getByRole('heading', { name: '댓글' })).toBeVisible();
  await page.getByLabel('작성자').fill('테스터');
  await page.getByLabel('댓글', { exact: true }).fill('반가워요');
  await page.getByRole('button', { name: '댓글 남기기' }).click();

  await expect(page.getByText('반가워요')).toBeVisible();
});
