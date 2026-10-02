import { test,before,after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { PGlite } from '@electric-sql/pglite';
import { createHandler } from '../../server/handler.js';
import { sessionCookie,hashPassword,verifyPassword } from '../../server/security.js';
import { newMatch,changeMatch,matchView } from '../../server/matchEngine.js';
import { questions,miniRoster } from '../../server/catalog.js';
import { createAttempt } from '../../src/quiz/engine.js';
import { createSession } from '../../src/minigames/engine.js';
import { activityView } from '../../server/activities.js';
let db,server,origin,alice,bob,charlie;
const password='a correct horse battery staple';
async function client(name){
 let cookie='';
 const call=async(route,data={},method='POST',extra={})=>{
  const url=new URL('/api/index',origin);url.searchParams.set('route',route);
  if(method==='GET')for(const [key,value] of Object.entries(data))url.searchParams.set(key,value);
  const response=await fetch(url,{method,headers:{...(cookie?{Cookie:cookie}:{}),...(method==='GET'?{}:{Origin:origin,'Content-Type':'application/json'}),...extra},body:method==='GET'?undefined:JSON.stringify(data)});
  const next=response.headers.get('set-cookie');if(next)cookie=next.split(';')[0];
  return {status:response.status,body:await response.json(),cookie:next};
 };
 const signup=await call('auth/signup',{username:name,password});assert.equal(signup.status,200);
 return {call,user:signup.body.data,cookie:()=>cookie};
}
before(async()=>{
 db=new PGlite();await db.exec(readFileSync(new URL('../../server/schema.sql',import.meta.url),'utf8'));
 server=createServer((req,res)=>handler(req,res));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 origin=`http://127.0.0.1:${server.address().port}`;
 globalThis.handler=createHandler({database:db,origin,secret:'s'.repeat(48),secure:false,logger:{error(){}}});
 alice=await client('OnlineAlice');bob=await client('OnlineBob');charlie=await client('OnlineCharlie');
});
after(async()=>{await new Promise(resolve=>server.close(resolve));await db.close();});
test('password hashes, opaque cookies and profiles never expose credentials',async()=>{
 const {rows}=await db.query('SELECT password_hash FROM app_users WHERE id=$1',[alice.user.id]);
 assert(!rows[0].password_hash.includes(password));assert(await verifyPassword(password,rows[0].password_hash));
 assert.notEqual(await hashPassword(password),rows[0].password_hash);
 assert.equal((await alice.call('auth/me',{},'GET')).body.data.username,'OnlineAlice');
 const encoded=JSON.stringify((await alice.call('auth/me',{},'GET')).body);
 assert(!encoded.includes('password_hash'));assert(!encoded.includes('token_hash'));
 assert.match(sessionCookie('x',true),/__Host-aniclash=x.*HttpOnly.*Secure/);
});
test('account validation handles duplicate names, case-insensitive login and malformed JSON bodies',async()=>{
 const duplicate=await alice.call('auth/signup',{username:'onlinealice',password});assert.equal(duplicate.status,409);
 assert.equal((await alice.call('auth/login',{username:'ONLINEALICE',password:'wrong password'})).status,401);
 assert.equal((await alice.call('auth/login',{username:'onlinealice',password})).status,200);
 const malformed=await fetch(`${origin}/api/index?route=auth/signup`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'null'});
 assert.equal(malformed.status,400);assert.equal((await malformed.json()).error,'Invalid request.');
});
test('cross-origin writes, missing cookies, arbitrary profile changes and wrong methods fail',async()=>{
 assert.equal((await alice.call('match/create',{},'POST',{Origin:'https://evil.example'})).status,403);
 assert.equal((await alice.call('auth/signup',{},'GET')).status,405);
 assert.equal((await alice.call('profile/stats',{rankPoints:99999})).status,404);
 const response=await fetch(`${origin}/api/index?route=match/list`);assert.equal(response.status,401);
 assert.equal((await alice.call('profile/avatar',{avatar:'pirate'})).body.data.avatar,'pirate');
});
test('invites require a second account and outsiders cannot inspect or change a match',async()=>{
 const created=await alice.call('match/create',{mode:'friend'});const match=created.body.data;
 assert.equal((await alice.call('match/join',{invite:match.invite})).status,409);
 assert.equal((await bob.call('match/join',{invite:match.invite})).status,200);
 assert.equal((await charlie.call('match/join',{invite:match.invite})).status,409);
 assert.equal((await charlie.call('match/view',{id:match.id},'GET')).status,404);
 assert.equal((await charlie.call('match/draw',{id:match.id,revision:1})).status,404);
});
test('drafts stay private, player IDs cannot spoof turns, stale writes fail and results credit once',async()=>{
 let a=(await alice.call('match/create',{mode:'friend',variants:true})).body.data;
 let b=(await bob.call('match/join',{invite:a.invite})).body.data;
 for(let i=0;i<5;i++){
  a=(await alice.call('match/view',{id:a.id},'GET')).body.data;
  const draw=await alice.call('match/draw',{id:a.id,revision:a.revision,player:1});assert.equal(draw.status,200);a=draw.body.data;
  assert.equal(a.team.length,i+1);assert.equal(a.opponent.count,i);
  const stale=await alice.call('match/draw',{id:a.id,revision:a.revision-1});assert.equal(stale.status,409);
  b=(await bob.call('match/view',{id:a.id},'GET')).body.data;
  assert.equal(b.team.length,i);assert(!JSON.stringify(b).includes(a.team.at(-1).id));assert.equal(b.seed,undefined);
  b=(await bob.call('match/draw',{id:a.id,revision:b.revision})).body.data;
 }
 a=(await alice.call('match/view',{id:a.id},'GET')).body.data;
 a=(await alice.call('match/keep',{id:a.id,revision:a.revision})).body.data;
 b=(await bob.call('match/view',{id:a.id},'GET')).body.data;
 b=(await bob.call('match/keep',{id:a.id,revision:b.revision})).body.data;
 a=(await alice.call('match/view',{id:a.id},'GET')).body.data;
 const order=a.team.map(card=>card.id);
 assert.equal((await alice.call('match/lock',{id:a.id,revision:a.revision,order:b.team.map(card=>card.id)})).status,400);
 a=(await alice.call('match/lock',{id:a.id,revision:a.revision,order})).body.data;
 assert.equal(a.stage,'draft');assert.equal(a.record,undefined);
 b=(await bob.call('match/view',{id:a.id},'GET')).body.data;
 b=(await bob.call('match/lock',{id:a.id,revision:b.revision,order:b.team.map(card=>card.id).reverse()})).body.data;
 assert.equal(b.stage,'complete');assert.equal(b.outcome.rounds.length,5);
 const before=(await alice.call('auth/me',{},'GET')).body.data.battleStats;
 assert.equal(before.wins+before.losses,1);
 await alice.call('match/view',{id:a.id},'GET');
 await bob.call('match/lock',{id:a.id,revision:b.revision-1,order:[]});
 assert.deepEqual((await alice.call('auth/me',{},'GET')).body.data.battleStats,before);
});
test('quiz answers and reconstruction seed stay private, results persist across sessions exactly once',async()=>{
 let state=(await alice.call('activity/start',{kind:'quiz',settings:{mode:'classic'}})).body.data;
 assert.equal(state.questions[0].answerIndex,undefined);assert.equal(state.questions[0].explanation,undefined);assert.equal(state.seed,'');
 assert.equal((await bob.call('activity/view',{kind:'quiz',id:state.id},'GET')).status,404);
 for(let i=0;i<10;i++){
  const answer=await alice.call('activity/answer',{kind:'quiz',id:state.id,revision:state.revision,input:0});assert.equal(answer.status,200);state=answer.body.data;
  assert.equal(typeof state.questions[i].answerIndex,'number');
  state=(await alice.call('activity/next',{kind:'quiz',id:state.id,revision:state.revision})).body.data;
 }
 assert.equal(state.status,'complete');assert.equal(state.saved,true);
 const before=(await alice.call('auth/me',{},'GET')).body.data.quizStats;
 assert.equal(before.quizzesPlayed,1);
 await alice.call('activity/save',{kind:'quiz',id:state.id});
 assert.deepEqual((await alice.call('auth/me',{},'GET')).body.data.quizStats,before);
 const fresh=await alice.call('auth/login',{username:'OnlineAlice',password});assert.equal(fresh.status,200);
 assert.equal((await alice.call('activity/list',{kind:'quiz'},'GET')).body.data[0].id,state.id);
});
test('daily attempts are unique, server-owned and resumable',async()=>{
 const first=(await alice.call('activity/start',{kind:'quiz',settings:{mode:'daily'}})).body.data;
 const second=(await alice.call('activity/start',{kind:'quiz',settings:{mode:'daily'}})).body.data;
 assert.equal(first.id,second.id);assert.equal(first.deadline,second.deadline);
 assert.equal((await alice.call('activity/answer',{kind:'quiz',id:first.id,revision:0,input:9})).status,400);
});
test('mini games hide targets and challenger scores in actual API data',async()=>{
 const move=(await bob.call('activity/start',{kind:'mini',settings:{mode:'move',anime:'all',hard:true,answerMode:'choice',streak:false}})).body.data;
 assert.equal(move.rounds[0].target.id,undefined);assert.equal(move.rounds[0].target.name,undefined);assert.deepEqual(move.rounds[1],{});
 const power=(await bob.call('activity/start',{kind:'mini',settings:{mode:'power',anime:'all',hard:false,answerMode:'choice',streak:true}})).body.data;
 assert.equal(power.rounds[0].pair[1].powerScore,undefined);assert.equal(power.rounds[0].pair[1].stats,undefined);assert.equal(power.seed,'');
 const result=await bob.call('activity/answer',{kind:'mini',id:power.id,revision:power.revision,input:'higher'});
 assert.equal(result.status,200);assert.equal(typeof result.body.data.rounds[0].pair[1].powerScore,'number');
});
test('expired invites and unfinished matches are rejected while history marks them expired',async()=>{
 const match=(await bob.call('match/create',{mode:'friend'})).body.data;
 await db.query("UPDATE app_matches SET expires_at=now()-interval '1 second' WHERE id=$1",[match.id]);
 assert.equal((await charlie.call('match/join',{invite:match.invite})).status,410);
 assert.equal((await bob.call('match/view',{id:match.id},'GET')).status,410);
 const history=(await bob.call('match/list',{},'GET')).body.data;
 assert.equal(history.find(item=>item.id===match.id).stage,'expired');
 const old=bob.cookie();await bob.call('auth/logout');
 const response=await fetch(`${origin}/api/index?route=auth/me`,{headers:{Cookie:old}});
 assert.equal((await response.json()).data,null);
});
test('database-backed login limits reject repeated attempts',async()=>{
 for(let i=0;i<12;i++)await charlie.call('auth/login',{username:'AbsentUser',password:'bad'});
 assert.equal((await charlie.call('auth/login',{username:'AbsentUser',password:'bad'})).status,429);
});

test('password changes and global logout revoke every existing session',async()=>{
 const account=await client('SecureAccount');
 const old=account.cookie();
 assert.equal((await account.call('profile/password',{currentPassword:'incorrect',newPassword:'another secure password'})).status,401);
 const changed=await account.call('profile/password',{currentPassword:password,newPassword:'another secure password'});assert.equal(changed.status,200);
 const revoked=await fetch(`${origin}/api/index?route=auth/me`,{headers:{Cookie:old}});assert.equal((await revoked.json()).data,null);
 assert.equal((await account.call('auth/login',{username:'SecureAccount',password})).status,401);
 assert.equal((await account.call('auth/login',{username:'SecureAccount',password:'another secure password'})).status,200);
 assert.equal((await account.call('profile/sessions')).status,200);
 assert.equal((await account.call('auth/me',{},'GET')).body.data,null);
});
test('CPU drafts and simultaneous commands use server state and grant one additional result',async()=>{
 const before=(await alice.call('auth/me',{},'GET')).body.data.battleStats;
 let state=(await alice.call('match/create',{mode:'cpu',anime:'naruto'})).body.data;
 const [first,second]=await Promise.all([alice.call('match/draw',{id:state.id,revision:state.revision}),alice.call('match/draw',{id:state.id,revision:state.revision})]);
 assert.deepEqual([first.status,second.status].sort(),[200,409]);
 state=(await alice.call('match/view',{id:state.id},'GET')).body.data;
 while(state.team.length<5)state=(await alice.call('match/draw',{id:state.id,revision:state.revision})).body.data;
 state=(await alice.call('match/reroll',{id:state.id,revision:state.revision})).body.data;assert.equal(state.rerolls,0);
 state=(await alice.call('match/keep',{id:state.id,revision:state.revision})).body.data;
 state=(await alice.call('match/lock',{id:state.id,revision:state.revision,order:state.team.map(card=>card.id)})).body.data;
 assert.equal(state.stage,'complete');assert.equal(new Set(state.record.teams.flat().map(card=>card.id)).size,10);
 const after=(await alice.call('auth/me',{},'GET')).body.data.battleStats;
 assert.equal(after.wins+after.losses,before.wins+before.losses+1);
});
