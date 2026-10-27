import { useRef, useState } from 'react';
import { api } from '../services/ApiClient';
import Button from './Button';
export default function ContactFooter() {
  const [busy, setBusy] = useState(false), [status, setStatus] = useState(''), [error, setError] = useState('');
  const pending = useRef(false), requestId = useRef(crypto.randomUUID());
  async function submit(event) {
    event.preventDefault();
    if (pending.current) return;
    const form = event.currentTarget;
    pending.current = true; setBusy(true); setError(''); setStatus('');
    try {
      await api('contact/feedback', { ...Object.fromEntries(new FormData(form)), requestId: requestId.current });
      form.reset(); requestId.current = crypto.randomUUID(); setStatus('Feedback sent. Thank you!');
    } catch (reason) { setError(reason.message); }
    finally { pending.current = false; setBusy(false); }
  }
  return <section className="contact-footer container" aria-labelledby="contact-heading"><div><span className="eyebrow">BUILT BY KUSHAGRA PANDEY</span><h2 id="contact-heading">CONTACT <span>ME.</span></h2><p>Found a bug or have an idea for the next arc? Send it my way.</p><div className="contact-links"><a href="https://www.linkedin.com/in/kushagra-pandey-353b71175/" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="https://github.com/kushagrapandey-cmd" target="_blank" rel="noopener noreferrer">GitHub</a><a href="mailto:kushagrapandey102@gmail.com">kushagrapandey102@gmail.com</a></div></div><form onSubmit={submit} className="feedback-form"><h3>SEND FEEDBACK</h3><label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={80} /></label><label>Your email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label><label>Feedback<textarea name="message" required minLength={10} maxLength={3000} rows={4} /></label><label className="feedback-trap" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label><p>Your message and email go directly to Kushagra so he can reply.</p><Button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send feedback'}</Button><p role="status">{status}</p>{error && <p role="alert">{error} You can also use the email link.</p>}</form></section>;
}
