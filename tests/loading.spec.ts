import { expect, test } from '@playwright/test'
import { loadPrototype } from './utils'

test('Editor prototype should load', async ({ page }) => {
  await loadPrototype(page)

  await expect(page.getByText(/This is an example/).first()).toBeVisible()
})
