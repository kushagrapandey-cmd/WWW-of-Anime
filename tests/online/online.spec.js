import {test,expect} from '@playwright/test';
async function signup(page,name){
 await page.goto('/signup');await page.getByLabel('Username',{exact:true}).fill(name);
 await page.getByLabel('Password',{exact:true}).fill('browser secure password 2026');
 await page.getByLabel('Confirm password',{exact:true}).fill('browser secure password 2026');
 await page.getByRole('button',{name:'Create my profile',exact:true}).click();await expect(page).toHaveURL(/profile/);
}
async function draft(page){for(let i=1;i<=5;i++)await page.getByRole('button',{name:`Reveal fighter ${i}`,exact:true}).click();await page.getByRole('button',{name:'Keep team',exact:true}).click();await expect(page.getByRole('button',{name:'Lock lineup',exact:true})).toBeVisible();}
test('two separate accounts accept an invite, keep private teams and receive one shared result',async({browser,page},info)=>{
 const suffix=Date.now().toString().slice(-8)+info.project.name.slice(-3);
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await signup(page,`Host${suffix}`);await page.goto('/battle');
 await page.getByRole('button',{name:'Create match',exact:true}).click();
 const invite=page.getByLabel('Private invite link');await expect(invite).toBeVisible();const link=await invite.inputValue();
 const rivalContext=await browser.newContext({viewport:info.project.use.viewport});const rival=await rivalContext.newPage();
 await rival.goto(link);await expect(rival).toHaveURL(/login/);
 await rival.getByRole('link',{name:'Create account',exact:true}).click();
 await expect(rival.getByRole('heading',{name:'CHOOSE YOUR PLAYER NAME'})).toBeVisible();
 await rival.getByLabel('Username',{exact:true}).fill(`Rival${suffix}`);
 await rival.getByLabel('Password',{exact:true}).fill('browser secure password 2026');
 await rival.getByLabel('Confirm password',{exact:true}).fill('browser secure password 2026');
 await rival.getByRole('button',{name:'Create my profile',exact:true}).click();
 await expect(rival.getByRole('button',{name:'Reveal fighter 1',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Reveal fighter 1',exact:true})).toBeVisible({timeout:10000});
 await draft(page);await page.getByRole('button',{name:'Lock lineup',exact:true}).click();
 await expect(page.getByRole('heading',{name:'YOUR LINEUP IS LOCKED.'})).toBeVisible();
 await expect(rival.getByRole('button',{name:'Reveal fighter 1',exact:true})).toBeVisible();
 await draft(rival);await rival.getByRole('button',{name:'Lock lineup',exact:true}).click();
 await expect(rival.locator('.arena-results')).toBeVisible();await expect(page.locator('.arena-results')).toBeVisible({timeout:10000});
 const score=await page.locator('.result-score').innerText();expect(await rival.locator('.result-score').innerText()).toEqual(score);
 expect(errors).toEqual([]);
 const widths=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);expect(widths[0]).toBeLessThanOrEqual(widths[1]);
 await page.reload();await expect(page.locator('.arena-results')).toBeVisible();
 await rivalContext.close();
});
test('same-account tabs do not replay a stale draft action',async({page},info)=>{
 await signup(page,`Tabs${Date.now().toString().slice(-8)}${info.project.name.slice(-3)}`);
 await page.goto('/battle');
 await page.getByLabel('Opponent').selectOption('cpu');
 await page.getByRole('button',{name:'Create match',exact:true}).click();
 await expect(page.getByRole('button',{name:'Reveal fighter 1',exact:true})).toBeVisible();
 const mirror=await page.context().newPage();await mirror.goto(page.url());
 await expect(mirror.getByRole('button',{name:'Reveal fighter 1',exact:true})).toBeVisible();
 await Promise.all([
  page.getByRole('button',{name:'Reveal fighter 1',exact:true}).click(),
  mirror.getByRole('button',{name:'Reveal fighter 1',exact:true}).click(),
 ]);
 await page.reload();
 await expect(page.getByRole('button',{name:'Reveal fighter 2',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Reveal fighter 3',exact:true})).toHaveCount(0);
 await mirror.close();
});
test('server quizzes and guessing games resume without browser-owned scores',async({page},info)=>{
 await signup(page,`Scholar${Date.now().toString().slice(-8)}${info.project.name.slice(-3)}`);
 await page.goto('/quizzes');await page.getByRole('button',{name:'Start quiz',exact:true}).click();
 await expect(page.locator('.quiz-question-title')).toBeVisible();await page.locator('.quiz-option').first().click();
 await expect(page.locator('.quiz-feedback')).toBeVisible();await page.getByRole('button',{name:'Next question',exact:true}).click();
 await page.reload();await expect(page.getByRole('button',{name:'Resume',exact:true}).first()).toBeVisible();
 await page.getByRole('button',{name:'Resume',exact:true}).first().click();await expect(page.locator('.quiz-count')).toContainText('QUESTION 2');
 for(let i=2;i<=10;i++){await page.locator('.quiz-option').first().click();await expect(page.locator('.quiz-feedback')).toBeVisible();await page.getByRole('button',{name:i===10?'View results':'Next question',exact:true}).click();}
 await expect(page.locator('.quiz-results')).toBeVisible();await expect(page.getByText(/Progress saved to/)).toBeVisible();
 await page.goto('/games');await page.getByRole('button',{name:'Start game',exact:true}).click();
 await expect(page.locator('.mini-question-title')).toBeVisible();await page.locator('.mini-options button').first().click();
 await expect(page.locator('.mini-feedback')).toBeVisible();await page.getByRole('button',{name:'Next round',exact:true}).click();
 await page.reload();await page.getByRole('button',{name:'Resume',exact:true}).first().click();await expect(page.locator('.mini-game-meta')).toContainText('ROUND 2');
 for(let i=2;i<=10;i++){await page.locator('.mini-options button').first().click();await expect(page.locator('.mini-feedback')).toBeVisible();await page.getByRole('button',{name:i===10?'View results':'Next round',exact:true}).click();}
 await expect(page.locator('.mini-result-title')).toBeVisible();
 await page.goto('/profile');await expect(page.locator('.profile-stats').filter({has:page.getByText('Quizzes played',{exact:true})}).locator('dd').first()).toHaveText('1');
 await expect(page.locator('.profile-stats').filter({has:page.getByText('Games played',{exact:true})}).locator('dd').first()).toHaveText('1');
});
test('world details and Home avoid external font and roster requests',async({page})=>{
 const requests=[];page.on('request',request=>requests.push(request.url()));await page.goto('/');
 await expect(page.locator('.portal-facts')).toHaveCount(3);
 expect(requests.some(url=>url.includes('fonts.googleapis'))).toBe(false);
 expect(requests.some(url=>url.includes('onepiece-'))).toBe(false);
 await page.screenshot({path:`/tmp/online-home-${test.info().project.name}.png`,fullPage:true});
 await page.locator('.portal-naruto').click();await expect(page.getByText('700 chapters · 72 volumes',{exact:true})).toBeVisible();
 const widths=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);expect(widths[0]).toBeLessThanOrEqual(widths[1]);
});
