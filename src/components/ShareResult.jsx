import { useState } from 'react';
import Button from './Button';

export default function ShareResult({ title, score, detail, path = '/' }) {
  const [status, setStatus] = useState(''), [fallback, setFallback] = useState('');
  // Only public routes are shared: no match IDs, invites, session tokens or account IDs.
  const url = new URL(path, window.location.origin).href;
  const text = `${title}\n${score}\n${detail}\nPlay WWW-of-Anime: ${url}`;
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: 'WWW-of-Anime', text });
      else await navigator.clipboard.writeText(text);
      setStatus(navigator.share ? 'Share sheet opened.' : 'Result copied.'); setFallback('');
    } catch (error) {
      if (error.name === 'AbortError') return;
      setFallback(text); setStatus('Select and copy your result below.');
    }
  }
  async function download() {
    try {
      await document.fonts.ready;
      const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 630;
      const ctx = canvas.getContext('2d');
      const background = ctx.createLinearGradient(0, 0, 1200, 630); background.addColorStop(0, '#20252b'); background.addColorStop(1, '#0c0b13'); ctx.fillStyle = background; ctx.fillRect(0, 0, 1200, 630);
      ctx.strokeStyle = '#c7ff41'; ctx.lineWidth = 3; ctx.strokeRect(35, 35, 1130, 560);
      ctx.fillStyle = '#c7ff41'; ctx.font = 'bold 24px sans-serif'; ctx.fillText('WWW-of-Anime / PLAYER RESULT', 75, 105);
      function fit(value, size, y, color = '#f5f3ff') {
        ctx.fillStyle = color; ctx.font = `bold ${size}px sans-serif`;
        while (ctx.measureText(value).width > 1030 && size > 16) { size -= 2; ctx.font = `bold ${size}px sans-serif`; }
        ctx.fillText(value, 75, y);
      }
      fit(title, 52, 215); fit(String(score), 78, 335, '#c7ff41'); fit(detail, 28, 410); fit(new URL(url).host, 25, 530, '#b9b6cc');
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Could not create image');
      const objectUrl = URL.createObjectURL(blob), link = document.createElement('a'); link.href = objectUrl; link.download = 'www-of-anime-result.png'; link.click(); setTimeout(() => URL.revokeObjectURL(objectUrl), 1000); setStatus('Result card downloaded.');
    } catch { setStatus('Image download unavailable. You can still share the text result.'); }
  }
  return <div className="share-panel"><Button variant="secondary" onClick={share}>Share result</Button><Button variant="secondary" onClick={download}>Download result card</Button>{status && <p role="status">{status}</p>}{fallback && <textarea aria-label="Shareable result" readOnly value={fallback} onFocus={event => event.target.select()} />}</div>;
}
