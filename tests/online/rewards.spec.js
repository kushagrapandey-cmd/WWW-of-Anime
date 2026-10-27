import {test,expect} from '@playwright/test';
const emptyProfile = () => ({id:'browser-test-player',username:'CoinTester',avatar:'leaf',createdAt:new Date().toISOString(),achievements:[],battleStats:{wins:0,losses:0,winStreak:0,bestStreak:0,rankPoints:0},quizStats:{quizzesPlayed:0,bestScore:0,xp:0,dailyStreak:0,bestDailyStreak:0}});
test('guest footer contact links, feedback validation and delivery states',async({page})=>{
 await page.goto('/');
 await expect(page.locator('.coin-nav')).toHaveText('Log in to earn coins');
 const footer=page.locator('.contact-footer');
 await expect(footer.getByRole('link',{name:'LinkedIn'})).toHaveAttribute('href','https://www.linkedin.com/in/kushagra-pandey-353b71175/');
 await expect(footer.getByRole('link',{name:'GitHub'})).toHaveAttribute('href','https://github.com/kushagrapandey-cmd');
 await footer.getByLabel('Your name').fill('Visitor');
 await footer.getByLabel('Your email').fill('visitor@example.com');
 await footer.getByLabel('Feedback',{exact:true}).fill('Please add more anime worlds.');
 await page.route('**/api/index?route=contact%2Ffeedback',route=>route.fulfill({status:503,json:{error:'Email service is unavailable.'}}));
 await footer.getByRole('button',{name:'Send feedback'}).click();
 await expect(footer.getByRole('alert')).toContainText('email link');
 await expect(footer.getByLabel('Feedback',{exact:true})).toHaveValue('Please add more anime worlds.');
 await page.unroute('**/api/index?route=contact%2Ffeedback');
 await page.route('**/api/index?route=contact%2Ffeedback',route=>route.fulfill({json:{data:{sent:true}}}));
 await footer.getByRole('button',{name:'Send feedback'}).click();
 await expect(footer.getByRole('status')).toHaveText('Feedback sent. Thank you!');
 await expect(footer.getByLabel('Feedback',{exact:true})).toHaveValue('');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('profile ledger, one-time milestone modals, disabled redemption and account isolation',async({page})=>{
 let profile=emptyProfile();
 profile.coins={streak:4,shownMilestones:[],ledger:[{id:'earned',userId:profile.id,amount:1000,reason:'win',matchId:'test-match',timestamp:new Date().toISOString()}]};
 await page.route('**/api/index?route=auth%2Fme',route=>route.fulfill({json:{data:profile}}));
 await page.route('**/api/index?route=profile%2Fmilestone',async route=>{
  profile.coins.shownMilestones.push(route.request().postDataJSON().milestone);
  await route.fulfill({json:{data:profile}});
 });
 await page.goto('/profile');
 for (const milestone of [100,500,1000]) {
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText(`${milestone} COINS EARNED!`);
  await expect(page.getByRole('dialog')).toContainText('Keep earning, your coins are saved!');
  await page.getByRole('button',{name:'Keep earning',exact:true}).click();
 }
 await expect(page.getByRole('dialog')).not.toBeVisible();
 await expect(page.locator('.coin-nav')).toHaveText('1000 coins · 4 streak');
 await expect(page.getByRole('button',{name:'Redeem (Coming Soon)'})).toBeDisabled();
 await expect(page.locator('.coin-history li')).toHaveCount(1);
 await page.reload();await expect(page.getByRole('dialog')).not.toBeVisible();
 profile={...emptyProfile(),id:'other-account'};
 await page.reload();await expect(page.locator('.coin-nav')).toHaveText('0 coins · 0 streak');
 await expect(page.locator('.coin-history li')).toHaveCount(0);
});
