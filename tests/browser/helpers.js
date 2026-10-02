import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
export async function checkPage(page) {
  await expect(page.locator('h1')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('main h1, main h2, main h3').evaluateAll(nodes => nodes.filter(node => node.getClientRects().length && node.scrollWidth > node.clientWidth + 1).map(node => node.textContent))).toEqual([]);
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(violations.map(({ id, nodes }) => ({ id, elements: nodes.map(node => ({ target: node.target, summary: node.failureSummary })) }))).toEqual([]);
}
export async function signup(page) {
  await page.goto('/signup');
  await page.getByLabel('Username', { exact: true }).fill('BrowserNinja');
  await page.getByLabel('Password', { exact: true }).fill('Prototype-pass-123');
  await page.getByLabel('Confirm password', { exact: true }).fill('Prototype-pass-123');
  await page.getByRole('button', { name: 'Create my profile', exact: true }).click();
  await expect(page).toHaveURL(/\/profile$/);
}
export async function noErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Optional hero images intentionally 404; fonts use the CSS fallback if unavailable.
  return () => expect(errors).toEqual([]);
}
