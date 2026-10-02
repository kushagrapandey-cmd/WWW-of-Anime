import { randomUUID } from 'node:crypto';
import { createAttempt, answerAttempt, advanceAttempt, finishAttempt, scoreAttempt } from '../src/quiz/engine.js';
import { applyQuizResult } from '../src/quiz/profileResult.js';
import { challengeDate } from '../src/quiz/date.js';
import { createSession, answerRound, advanceRound, revealClue, scoreSession, correctChoice, applyMiniResult } from '../src/minigames/engine.js';
import { questions, miniRoster } from './catalog.js';
import { fail } from './security.js';
const clientActivityErrors = new Set([
  'Unknown quiz settings.','Not enough questions for those settings.','This question is already answered.','Time is up.',
  'Choose an available answer.','Answer this question first.','This quiz is still in progress.','Invalid mini-game settings.',
  'No further clue available.','This round is already answered.','That name matches several fighters. Use a full name.',
  'Enter a character name.','Choose Higher or Lower.','Choose an available fighter.','Answer this round first.'
]);
function clientActivity(operation) {
  try { return operation(); }
  catch (error) { if (clientActivityErrors.has(error?.message)) fail(400,error.message); throw error; }
}
export function activityView(kind,state) {
  const next = structuredClone(state); next.online = true;
  if (kind === 'quiz') {
    next.result = scoreAttempt(state);
    next.questions = next.questions.map((question,index) => {
      if (state.status === 'complete' || index < state.answers.length) return question;
      const { answerIndex, explanation, ...publicQuestion } = question;
      return publicQuestion;
    });
  } else {
    next.result = scoreSession(state);
    next.seed = ''; next.lexicon = [];
    next.correctChoices = state.answers.map((_,index) => correctChoice(state,index));
    next.rounds = next.rounds.map((round,index) => {
      if (index < state.answers.length || state.status === 'complete') return round;
      if (index !== state.cursor) return {};
      if (state.settings.mode === 'power') return { pair: [round.pair[0],
        { id:round.pair[1].id, name:round.pair[1].name, anime:round.pair[1].anime,
          formName:round.pair[1].formName, image:round.pair[1].image, rarity:'Hidden', role:round.pair[1].role }] };
      const { stats,abilityTags,clues } = round.target;
      return { options:round.options, moves:round.moves, target:state.settings.mode === 'clue'
        ? { clues:clues.slice(0,state.hints) } : { stats,abilityTags } };
    });
  }
  // Quiz seed can reconstruct answers from the public bank, so keep it private too.
  next.seed = ''; return next;
}
export async function activityRoute(db,user,kind,action,data) {
  if (!['quiz','mini'].includes(kind)) fail(404,'Unknown activity.');
  if (action === 'list') {
    const { rows } = await db.query('SELECT state FROM app_activities WHERE user_id=$1 AND kind=$2 ORDER BY created_at DESC LIMIT 30',[user.id,kind]);
    return rows.map(row=>activityView(kind,row.state));
  }
  return db.transaction(async client => {
    // Account lock serializes daily creation and profile completion across sessions/devices.
    const { rows:users } = await client.query('SELECT profile FROM app_users WHERE id=$1 FOR UPDATE',[user.id]);
    const profile = users[0].profile;
    let state;
    if (action === 'start') {
      const date = kind === 'quiz' && data.settings?.mode === 'daily' ? challengeDate() : null;
      if (date) {
        const { rows } = await client.query('SELECT state FROM app_activities WHERE user_id=$1 AND daily_date=$2',[user.id,date]);
        if (rows.length) return activityView(kind,rows[0].state);
      }
      const options = { id:`${kind==='quiz'?'quiz':'mini'}-${randomUUID()}`,ownerId:user.id,seed:randomUUID(),now:Date.now() };
      state = clientActivity(() => kind==='quiz' ? createAttempt(questions,data.settings??{},options) : createSession(miniRoster,data.settings??{},options));
      await client.query('INSERT INTO app_activities(id,user_id,kind,daily_date,state) VALUES($1,$2,$3,$4,$5)',[state.id,user.id,kind,date,JSON.stringify(state)]);
    } else {
      const { rows } = await client.query('SELECT state FROM app_activities WHERE user_id=$1 AND id=$2 AND kind=$3 FOR UPDATE',[user.id,data.id,kind]);
      if (!rows.length) fail(404,'Activity not found.'); state = rows[0].state;
      if (action==='view' || action==='save') return activityView(kind,state);
      if (!Number.isInteger(data.revision) || data.revision!==state.revision) fail(409,'Progress changed in another tab. Load the latest attempt.');
      const now=Date.now();
      if (kind==='quiz') {
        if (state.status==='active' && state.deadline!==null && now>=state.deadline) state=finishAttempt(state,now);
        else if (action==='answer') state=clientActivity(() => answerAttempt(state,data.input,now));
        else if (action==='next') state=clientActivity(() => advanceAttempt(state,now));
        else if (action==='timeout') fail(409,'The server timer has not expired yet.');
        else fail(400,'Unknown quiz operation.');
      } else {
        if (action==='answer' || action==='timeout') state=clientActivity(() => answerRound(state,action==='timeout'?null:data.input,now));
        else if (action==='next') state=clientActivity(() => advanceRound(state,now));
        else if (action==='clue') state=clientActivity(() => revealClue(state,now));
        else fail(400,'Unknown game operation.');
      }
      if (state.status==='complete' && !state.saved) {
        const updates=kind==='quiz'?applyQuizResult(profile,state):applyMiniResult(profile,state);
        const { result,...changes }=updates;
        await client.query('UPDATE app_users SET profile=$2 WHERE id=$1',[user.id,JSON.stringify({...profile,...changes})]);
        state.saved=true;
      }
      await client.query('UPDATE app_activities SET state=$3 WHERE user_id=$1 AND id=$2',[user.id,state.id,JSON.stringify(state)]);
    }
    return activityView(kind,state);
  });
}
