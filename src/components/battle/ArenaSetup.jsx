import { useState } from 'react';
import { animeConfig } from '../../data/anime';
import Button from '../Button';
import Card from '../Card';
export default function ArenaSetup({ user, onStart, history, historyError, onReplay }) {
  const [mode, setMode] = useState('cpu');
  const [player1, setPlayer1] = useState('Player 1'), [player2, setPlayer2] = useState('Player 2');
  const [anime, setAnime] = useState('all'), [variants, setVariants] = useState(false);
  return <div className="arena-setup"><Card className="arena-panel"><span className="eyebrow">BUILD YOUR SHOWDOWN</span><h2>YOUR NEXT RIVAL.</h2>
    <form onSubmit={event => { event.preventDefault(); onStart({ mode, anime, variants, names: [user?.username ?? (player1.trim() || 'Player 1'), mode === 'cpu' ? 'CPU' : (player2.trim() || 'Player 2')] }); }}>
      {user ? <p>Playing as <strong>{user.username}</strong></p> : <label>Your name<input maxLength={24} value={player1} onChange={event => setPlayer1(event.target.value)} /></label>}
      <fieldset><legend>Opponent</legend><label className="arena-choice"><input type="radio" name="opponent" value="cpu" checked={mode === 'cpu'} onChange={() => setMode('cpu')} />CPU</label><label className="arena-choice"><input type="radio" name="opponent" value="friend" checked={mode === 'friend'} onChange={() => setMode('friend')} />Local friend</label></fieldset>
      {mode === 'friend' && <label>Friend’s name<input maxLength={24} value={player2} onChange={event => setPlayer2(event.target.value)} /></label>}
      <label>Fighter pool<select value={anime} onChange={event => setAnime(event.target.value)}><option value="all">All three worlds</option>{animeConfig.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className="arena-choice"><input type="checkbox" checked={variants} onChange={event => setVariants(event.target.checked)} />Include form variants</label>
      <p className="arena-note">{variants ? 'Peak records plus authored variants. Characters without variants use their peak. Each drawn form stays locked.' : 'Peak rated forms only. Switch on variants before drafting to include earlier forms.'}</p>
      <Button type="submit">Start draft</Button>
    </form></Card><Card className="arena-panel"><h2>FIVE ROUNDS. ONE WINNER.</h2><ol className="arena-rules"><li>Reveal five fighters. Rarity weights favour common pulls.</li><li>Use one reroll. No identity can appear twice across teams.</li><li>Lock your secret Round 1–5 order.</li><li>Power × matchup × synergy × seeded luck decides each round.</li></ol><p className="arena-note">Three teammates sharing an anime or faction earn +5% once. Tag counters cap at ±10%; luck ranges from −8% to +8%. Ties use speed, then a seeded tiebreak. These are game rules, not canon verdicts.</p><p className="arena-note">Only the signed-in player’s record changes. CPU has 300 rating; a local friend uses your starting rating. Guest matches save history without rank points.</p></Card>
    <Card className="arena-panel arena-history"><h2>RECENT BATTLES</h2><p className="arena-note">Last 20 on this device, shown for the current player. Replays never count again.</p>{historyError && <p role="alert">{historyError}</p>}{!history.length && <p>No battles yet. Your next arc starts here.</p>}<ul>{history.map(record => <li key={record.id}><div><strong>{record.names.join(' vs ')}</strong><span>{new Date(record.createdAt).toLocaleString()} · {record.saved ? 'Saved' : 'Profile save pending'}</span></div><Button variant="secondary" onClick={() => onReplay(record)}>{record.saved ? 'Replay' : 'Finish saving'}</Button></li>)}</ul></Card>
  </div>;
}
