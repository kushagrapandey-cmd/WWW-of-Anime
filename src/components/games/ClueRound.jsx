import { MINI } from '../../minigames/config';
import Button from '../Button';
export default function ClueRound({ session, disabled, onAnswer, onReveal }) {
  const round = session.rounds[session.cursor];
  return <div><h2 tabIndex={-1} className="mini-question-title">WHO’S BEHIND THE CLUES?</h2><ol className="chain-clues" aria-live="polite">{round.target.clues.slice(0, session.hints).map((clue, index) => <li key={clue}><span>CLUE {index + 1}</span>{clue}</li>)}</ol><div className="mini-actions"><Button variant="secondary" onClick={onReveal} disabled={disabled || session.hints === 3}>Reveal next clue</Button><strong>{MINI.cluePoints[session.hints - 1]} points available</strong></div><div className="mini-options">{round.options.map(option => <button type="button" key={option.id} disabled={disabled} onClick={() => onAnswer(option.id)}>{option.name}</button>)}</div></div>;
}
