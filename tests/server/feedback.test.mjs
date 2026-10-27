import { test } from 'node:test';
import assert from 'node:assert/strict';
import { feedbackRoute, sendFeedbackEmail } from '../../server/feedback.js';
test('feedback validates input, ignores honeypots and sends only normalized visitor data', async () => {
 let sent;
 const send = async data => { sent = data; };
 await assert.rejects(feedbackRoute({name:'X',email:'bad',message:'short'},send), {status:400});
 assert.equal(sent,undefined);
 await feedbackRoute({website:'spam'},send);
 assert.equal(sent,undefined);
 assert.deepEqual(await feedbackRoute({name:' Visitor ',email:'visitor@example.com',message:' A useful suggestion. ',to:'attacker@example.com'},send),{sent:true});
 const {requestId,...content}=sent;
 assert.deepEqual(content,{name:'Visitor',email:'visitor@example.com',message:'A useful suggestion.'});
 assert.equal(requestId.length,64);
 await assert.rejects(feedbackRoute({name:'Visitor',email:'visitor@example.com',message:'A useful suggestion.'},async()=>{throw new Error('provider unavailable');}),/provider unavailable/);
});
test('missing email config fails honestly without claiming delivery', async()=>{
 const previous=process.env.RESEND_API_KEY;
 delete process.env.RESEND_API_KEY;
 try { await assert.rejects(sendFeedbackEmail({}), {status:503}); }
 finally { if(previous!==undefined)process.env.RESEND_API_KEY=previous; }
});
