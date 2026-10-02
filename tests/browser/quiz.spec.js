import { test, expect } from '@playwright/test';
import { signup, checkPage, noErrors } from './helpers.js';
test('Classic quiz saves once, resumes feedback and restores the local account', async ({ page }) => {
  const verifyErrors = await noErrors(page); await signup(page);
  await page.goto('/quizzes'); await page.getByRole('combobox', { name: 'Anime', exact: true }).selectOption('naruto'); await page.getByLabel('Difficulty').selectOption('easy');
  await page.getByRole('button', { name: 'Start quiz', exact: true }).click(); await checkPage(page);
  for (let index = 0; index < 10; index++) {
    const attempt = await page.evaluate(() => {
      const user = JSON.parse(localStorage.getItem('www-of-anime:accounts:v1'))[0];
      return JSON.parse(localStorage.getItem(`www-of-anime:quizzes:v1:${user.id}`))[0];
    });
    await expect(page.locator('.quiz-question-title')).toBeFocused();
    await page.locator('.quiz-option').nth(attempt.questions[index].answerIndex).click();
    if (index === 0) {
      await checkPage(page); await page.getByRole('button', { name: 'Save and leave' }).click(); await page.reload();
      await page.getByRole('button', { name: 'Resume', exact: true }).click(); await expect(page.locator('.quiz-feedback')).toContainText('CORRECT!');
    }
    await page.getByRole('button', { name: index === 9 ? 'View results' : 'Next question', exact: true }).click();
  }
  await expect(page.locator('.quiz-results')).toContainText('Progress saved to BrowserNinja.'); await checkPage(page);
  const userBefore = await page.evaluate(() => JSON.parse(localStorage.getItem('www-of-anime:accounts:v1'))[0]);
  expect(userBefore.quizStats.xp).toBe(100);
  await page.getByRole('button', { name: 'Choose another quiz' }).click(); await page.getByRole('button', { name: 'View result', exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('www-of-anime:accounts:v1'))[0].quizStats)).toEqual(userBefore.quizStats);
  await page.goto('/profile'); await checkPage(page); await page.reload(); await expect(page).toHaveURL(/\/profile$/); verifyErrors();
});
