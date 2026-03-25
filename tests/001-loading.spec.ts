import { expect, test } from '@playwright/test'

test('Editor prototype should load', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.waitForSelector('.ProseMirror')

  await expect(
    page
      .getByText(
        'This is an example of educational content with various types of items.',
      )
      .first(),
  ).toBeVisible()
})
