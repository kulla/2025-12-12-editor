import type { Page } from 'playwright/test'

export async function loadPrototype(page: Page) {
  await page.goto('http://localhost:3000')
  await page.waitForSelector('.ProseMirror')
}
