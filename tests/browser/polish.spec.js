import { test, expect } from '@playwright/test';
import { checkPage, noErrors } from './helpers.js';
test('public routes, keyboard navigation, reduced motion and sound preference', async ({ page }, testInfo) => {
  const verifyErrors = await noErrors(page);
  await page.goto('/'); await checkPage(page);
  await page.keyboard.press('Tab'); await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page.locator('#main')).toBeFocused();
  expect(await page.locator('.hero').evaluate(node => getComputedStyle(node, '::before').animationName)).toBe('none');
  await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
  if (testInfo.project.name === 'mobile-360') {
    const menu = page.getByRole('button', { name: 'Open menu' });
    await menu.click(); await page.getByRole('navigation').getByRole('link', { name: 'Games', exact: true }).focus();
    await page.keyboard.press('Escape'); await expect(menu).toBeFocused(); await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await menu.click();
  }
  await page.getByRole('navigation').getByRole('link', { name: 'Games', exact: true }).click();
  await expect(page.locator('#main')).toBeFocused(); await checkPage(page);
  if (testInfo.project.name === 'mobile-360') await expect(page.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
  const sound = page.getByRole('button', { name: 'Sound effects', exact: true });
  await expect(sound).toHaveAttribute('aria-pressed', 'false'); await sound.click(); await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await page.reload(); await expect(sound).toHaveAttribute('aria-pressed', 'true'); await sound.click(); await expect(sound).toHaveAttribute('aria-pressed', 'false');
  for (const route of ['/characters', '/quizzes', '/login', '/signup', '/anime/naruto', '/anime/onepiece', '/anime/bleach', '/anime/unknown', '/missing']) {
    await page.goto(route); await checkPage(page);
    if (route === '/characters') {
      await page.getByRole('combobox', { name: 'Character', exact: true }).selectOption('naruto-uzumaki');
      await page.getByRole('combobox', { name: 'Form', exact: true }).selectOption({ index: 0 });
      await expect(page.locator('.guide-rating h3')).toContainText('Naruto'); await checkPage(page);
      await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: testInfo.outputPath('characters.png'), fullPage: true });
    }
  }
  verifyErrors();
});
test('lazy-route failure retains navigation and can recover after reload', async ({ page }) => {
  await page.route('**/assets/Games-*.js', route => route.abort());
  await page.goto('/games'); await expect(page.getByRole('heading', { name: 'THIS ARC DIDN’T LOAD.' })).toBeVisible();
  await expect(page.getByRole('navigation', { includeHidden: true })).toBeAttached();
  await page.unroute('**/assets/Games-*.js'); await page.getByRole('button', { name: 'Reload page' }).click();
  await expect(page.getByRole('button', { name: 'Start game' })).toBeVisible(); await checkPage(page);
});
test('corrupt game storage is preserved and explains the failure', async ({ page }) => {
  await page.goto('/games'); await page.evaluate(() => localStorage.setItem('www-of-anime:minigames:v1:guest', '{broken'));
  await page.reload(); await expect(page.getByRole('alert')).toContainText('Existing data has been preserved');
  await page.getByRole('button', { name: 'Start game' }).click();
  expect(await page.evaluate(() => localStorage.getItem('www-of-anime:minigames:v1:guest'))).toBe('{broken');
  await checkPage(page);
});
