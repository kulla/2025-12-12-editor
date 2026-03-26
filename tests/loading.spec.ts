import { expect, test } from '@playwright/test'
import { EditorName } from '../src/cdrt/types'
import { loadPrototype } from './utils'

test('Editor prototype should load', async ({ page }) => {
  await loadPrototype(page)

  await expect(
    page.getByLabel(EditorName.Editor1).getByText(/This is an example/),
  ).toBeVisible()
})
