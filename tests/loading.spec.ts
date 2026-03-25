import { expect, test } from '@playwright/test'
import { loadPrototype } from './utils'

test('Editor prototype should load', async ({ page }) => {
  await loadPrototype(page)

  const firstParagraphText =
    'This is an example of educational content with various types of items.'

  await expect(page.getByText(firstParagraphText).first()).toBeVisible()
})
