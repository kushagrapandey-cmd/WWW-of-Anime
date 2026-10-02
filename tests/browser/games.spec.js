import { test, expect } from '@playwright/test';
import { checkPage, noErrors } from './helpers.js';
const storeKey = 'www-of-anime:minigames:v1:guest';
const snapshot = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)).records[0], storeKey);
async function next(page, round) { await page.getByRole('button', { name: round === 9 ? 'View results' : 'Next round', exact: true }).click(); }
test('hard typed Move Match, resume and completed power/clue games', async ({ page }, testInfo) => {
  const verifyErrors = await noErrors(page);
  await page.goto('/games'); await checkPage(page);
  await page.getByLabel('Answer style').selectOption('typed'); await page.getByLabel('Hard mode').check();
  await page.getByRole('button', { name: 'Start game', exact: true }).click();
  await expect(page.locator('.mini-question-title')).toBeFocused();
  await expect(page.locator('.game-shell .character-avatar')).toHaveCount(0);
  await expect(page.locator('.anonymous-stats [role=progressbar]')).toHaveCount(8);
  await page.getByLabel('Character name').fill('Uchiha'); await page.getByRole('button', { name: 'Submit guess' }).click();
  await expect(page.getByRole('alert')).toContainText('full name'); expect((await snapshot(page)).answers).toHaveLength(0);
  const original = await snapshot(page); await page.getByRole('button', { name: 'Save and leave' }).click();
  await page.reload(); await page.getByRole('button', { name: 'Resume', exact: true }).click();
  expect((await snapshot(page)).deadline).toBe(original.deadline);
  for (let round = 0; round < 10; round++) {
    const record = await snapshot(page); expect(await page.locator('.game-shell').innerText()).not.toContain(record.rounds[round].target.name);
    await page.getByLabel('Character name').fill(record.rounds[round].target.name); await page.getByRole('button', { name: 'Submit guess' }).click();
    if (round === 0) await checkPage(page); await next(page, round);
  }
  await expect(page.getByRole('status')).toContainText('Result and high score saved.'); await checkPage(page);
  expect((await page.evaluate(key => JSON.parse(localStorage.getItem(key)).highScores, storeKey))['move:all:hard:typed']).toBe(1500);
  await page.getByRole('button', { name: 'Choose another game' }).click();
  await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption('power'); await page.getByRole('button', { name: 'Start game', exact: true }).click();
  for (let round = 0; round < 10; round++) {
    const [reference, challenger] = (await snapshot(page)).rounds[round].pair;
    await expect(page.locator('.power-fighter').nth(1).locator('strong')).toHaveText('? power');
    if (round === 0) { await checkPage(page); await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: testInfo.outputPath('power.png'), fullPage: true }); }
    await page.getByRole('button', { name: challenger.powerScore > reference.powerScore ? 'Higher ↑' : 'Lower ↓', exact: true }).click(); await next(page, round);
  }
  await expect(page.getByRole('status')).toContainText('Result and high score saved.');
  expect((await snapshot(page)).settings.mode).toBe('power'); await checkPage(page);
  await page.getByRole('button', { name: 'Choose another game' }).click(); await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption('clue');
  await page.getByRole('button', { name: 'Start game', exact: true }).click();
  for (let round = 0; round < 10; round++) {
    for (let clue = 0; clue < Math.min(round, 2); clue++) await page.getByRole('button', { name: 'Reveal next clue', exact: true }).click();
    if (round === 2) await expect(page.getByRole('button', { name: 'Reveal next clue' })).toBeDisabled();
    const target = (await snapshot(page)).rounds[round].target;
    await page.getByRole('button', { name: target.name, exact: true }).click(); if (round === 0) await checkPage(page); await next(page, round);
  }
  await expect(page.getByRole('status')).toContainText('Result and high score saved.'); await checkPage(page); verifyErrors();
});
test('optional avatar images display and broken sources return to the monogram', async ({ page }) => {
  await page.route('**/characters/qa-valid.svg', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="120"><rect width="100" height="120" fill="#252035"/></svg>' }));
  await page.route('**/characters/qa-missing.svg', route => route.fulfill({ status: 404, body: '' }));
  await page.goto('/games'); await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption('power'); await page.getByRole('button', { name: 'Start game', exact: true }).click();
  await page.getByRole('button', { name: 'Save and leave' }).click();
  await page.evaluate(key => {
    const store = JSON.parse(localStorage.getItem(key)); store.records[0].rounds[0].pair[0].image = '/characters/qa-missing.svg'; store.records[0].rounds[0].pair[1].image = '/characters/qa-valid.svg'; localStorage.setItem(key, JSON.stringify(store));
  }, storeKey);
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  const missing = page.locator('.power-fighter').first(), valid = page.locator('.power-fighter').nth(1);
  await expect(missing.locator('img')).toHaveCount(0); await expect(missing.locator('.avatar-monogram')).toBeVisible();
  await valid.scrollIntoViewIfNeeded(); await expect(valid.locator('img')).toBeVisible(); expect(await valid.locator('img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  await checkPage(page);
});
