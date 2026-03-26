import type { Page } from 'playwright/test'

export async function loadPrototype(page: Page) {
  await page.goto('http://localhost:3000')

  // Wait for the editor to load
  await page.waitForSelector('.ProseMirror')
}
