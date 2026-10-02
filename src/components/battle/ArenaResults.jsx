import { useState } from 'react';
import CharacterCard from '../CharacterCard';
import Button from '../Button';
export default function ArenaResults({ record, outcome, replay, saveState, onSave, onRematch, onNew }) {
  const [copyState, setCopyState] = useState(''), [fallback, setFallback] = useState('');
  const summary = `${record.names[outcome.winner]} wins ${outcome.score[outcome.winner]}–${outcome.score[1 - outcome.winner]}! ${record.names.join(' vs ')} · MVP: ${outcome.mvp.name} (${outcome.mvp.formName}) · Seed: ${record.seed}`;
  async function copy() {
    try { await navigator.clipboard.writeText(summary); setCopyState('Result copied.'); setFallback(''); }
    catch { setCopyState('Select and copy the result below.'); setFallback(summary); }
  }
  return <section className="arena-panel arena-results"><span className="eyebrow">{replay ? 'SAVED REPLAY' : 'SHOWDOWN COMPLETE'}</span><h2 tabIndex={-1}>{record.names[outcome.winner]} WINS!</h2><p className="result-score">{record.names[0]} <strong>{outcome.score.join(' : ')}</strong> {record.names[1]}</p><div className="result-layout"><div><h3>MVP · LARGEST WINNING MARGIN</h3><CharacterCard character={outcome.mvp} /><p className="locked-form">{outcome.mvp.formName}</p></div><div><h3>ROUND RECAP</h3><ol className="round-recap">{outcome.rounds.map(round => <li key={round.index}><strong>Round {round.index + 1} · {record.teams[round.winner][round.index].name}</strong><span>{round.why}</span></li>)}</ol><p className="arena-note">Seed: {record.seed} · Engine v{record.version}</p>
      <p role="status">{replay ? 'Replay only. Profile statistics are unchanged.' : saveState.busy ? 'Saving result…' : record.saved ? record.rank ? `Saved · ${record.rank.delta >= 0 ? '+' : ''}${record.rank.delta} rank points · Total ${record.rank.rankPoints}` : 'Guest result saved. No rank points.' : 'Result not yet fully saved.'}</p>
      {!replay && saveState.error && <><p className="account-error" role="alert">{saveState.error}</p><Button onClick={onSave} disabled={saveState.busy}>Retry save</Button><Button variant="secondary" onClick={onNew} disabled={saveState.busy}>Continue without saving</Button></>}
      <div className="arena-actions"><Button onClick={onRematch} disabled={saveState.busy || (!replay && !record.saved)}>Rematch</Button><Button variant="secondary" onClick={onNew} disabled={saveState.busy || (!replay && !record.saved)}>New draft</Button><Button variant="secondary" onClick={copy}>Copy result</Button></div><p role="status">{copyState}</p>{fallback && <textarea aria-label="Result summary" readOnly value={fallback} onFocus={event => event.target.select()} />}
    </div></div></section>;
}
