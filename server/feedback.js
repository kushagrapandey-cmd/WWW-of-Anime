import { createHash } from 'node:crypto';
import { fail } from './security.js';
const recipient = 'kushagrapandey102@gmail.com';
export async function sendFeedbackEmail(message) {
  if (!process.env.RESEND_API_KEY) fail(503, 'Email service is not configured.');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(15000),
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `anime-feedback/${message.requestId}/${createHash('sha256').update(JSON.stringify(message)).digest('hex')}` },
    body: JSON.stringify({
      from: process.env.FEEDBACK_FROM || 'WWW-of-Anime <onboarding@resend.dev>',
      to: [recipient], reply_to: message.email,
      subject: 'WWW-of-Anime website feedback',
      text: `From: ${message.name} <${message.email}>\n\n${message.message}`,
    }),
  });
  if (!response.ok) fail(502, 'Could not send feedback. Please retry later or email directly.');
}
export async function feedbackRoute(data, send = sendFeedbackEmail) {
  if (data.website) return { sent: true };
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const message = typeof data.message === 'string' ? data.message.trim() : '';
  if (name.length < 2 || name.length > 80 || /[\r\n]/.test(name) || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10 || message.length > 3000) fail(400, 'Enter a name, valid email and feedback of 10–3000 characters.');
  const requestId = typeof data.requestId === 'string' && /^[a-zA-Z0-9-]{16,64}$/.test(data.requestId) ? data.requestId : createHash('sha256').update(JSON.stringify({name,email,message})).digest('hex');
  await send({ name, email, message, requestId });
  return { sent: true };
}
