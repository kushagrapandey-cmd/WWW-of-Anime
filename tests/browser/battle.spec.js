import { test, expect } from '@playwright/test';
import { signup, checkPage, noErrors } from './helpers.js';
test('account completes CPU draft, lineup, five rounds, saved replay and profile', async ({ page }, testInfo) => {
  const verifyErrors = await noErrors(page);
  await signup(page); await checkPage(page);
  await page.goto('/battle'); await checkPage(page);
  await page.getByRole('button', { name: 'Start draft', exact: true }).click();
  for (let index = 1; index <= 5; index++) {
    await page.getByRole('button', { name: `Reveal fighter ${index}`, exact: true }).click();
    if (index === 1) {
      await page.getByRole('button', { name: 'Reroll latest (1 left)', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Reroll latest (0 left)' })).toBeDisabled();
      await checkPage(page);
    }
  }
  await page.getByRole('button', { name: 'Keep team', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'SET YOUR ROUND ORDER.' })).toBeFocused();
  const before = await page.locator('.lineup-list .fighter-mini strong').allTextContents();
  await page.getByRole('button', { name: /^Move .* later$/ }).first().focus();
  await page.keyboard.press('Enter');
  const after = await page.locator('.lineup-list .fighter-mini strong').allTextContents();
  expect(after.slice(0, 2)).toEqual([before[1], before[0]]);
  await checkPage(page);
  await page.getByRole('button', { name: 'Lock lineup', exact: true }).click();
  for (let round = 1; round <= 5; round++) {
    await expect(page.locator('.arena-rounds > .eyebrow')).toHaveText(`ROUND ${round} / 5`);
    if (round === 1) { await checkPage(page); await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: testInfo.outputPath('battle-round.png'), fullPage: true }); }
    await page.getByRole('button', { name: round === 5 ? 'View results' : 'Next round', exact: true }).click();
  }
  await expect(page.locator('.arena-results')).toContainText('Saved ·');
  await checkPage(page);
  const count = () => page.evaluate(() => JSON.parse(localStorage.getItem('www-of-anime:accounts:v1'))[0].battleStats);
  const stats = await count(); expect(stats.wins + stats.losses).toBe(1);
  await page.getByRole('button', { name: 'New draft', exact: true }).click();
  await page.getByRole('button', { name: 'Replay', exact: true }).click();
  for (let round = 1; round <= 5; round++) await page.getByRole('button', { name: round === 5 ? 'View results' : 'Next round', exact: true }).click();
  await expect(page.locator('.arena-results')).toContainText('Replay only. Profile statistics are unchanged.');
  expect(await count()).toEqual(stats);
  await page.reload(); await page.getByRole('button', { name: 'Replay', exact: true }).click();
  await expect(page.locator('.arena-rounds > .eyebrow')).toContainText('REPLAY');
  await page.goto('/profile'); await checkPage(page); verifyErrors();
});
test('local friend keeps drafts and lineups private through device handoffs', async ({ page }) => {
  const verifyErrors = await noErrors(page); await signup(page); await page.goto('/battle');
  await page.getByLabel('Local friend', { exact: true }).check(); await page.getByLabel('Friend’s name').fill('Friend');
  await page.getByLabel('Include form variants').check(); await page.getByRole('button', { name: 'Start draft' }).click();
  for (let player = 0; player < 2; player++) {
    for (let index = 1; index <= 5; index++) await page.getByRole('button', { name: `Reveal fighter ${index}`, exact: true }).click();
    await expect(page.locator('.draft-roster .fighter-mini')).toHaveCount(5);
    await page.getByRole('button', { name: 'Keep team', exact: true }).click();
    await expect(page.locator('.pass-device')).toBeVisible(); await expect(page.locator('.fighter-mini')).toHaveCount(0); await checkPage(page);
    await page.getByRole('button', { name: 'I’m ready', exact: true }).click();
  }
  for (let player = 0; player < 2; player++) {
    await expect(page.locator('.lineup-list .fighter-mini')).toHaveCount(5);
    await page.getByRole('button', { name: 'Lock lineup', exact: true }).click();
    await expect(page.locator('.fighter-mini')).toHaveCount(0); await page.getByRole('button', { name: 'I’m ready', exact: true }).click();
  }
  for (let round = 1; round <= 5; round++) await page.getByRole('button', { name: round === 5 ? 'View results' : 'Next round', exact: true }).click();
  await expect(page.locator('.arena-results')).toContainText('Saved ·'); await checkPage(page);
  expect(await page.evaluate(() => { const user = JSON.parse(localStorage.getItem('www-of-anime:accounts:v1'))[0]; return user.battleStats.wins + user.battleStats.losses; })).toBe(1);
  verifyErrors();
});
