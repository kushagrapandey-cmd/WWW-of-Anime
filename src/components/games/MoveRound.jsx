import { MINI } from '../../minigames/config';
import ProgressBar from '../ProgressBar';
import NameAnswer from './NameAnswer';
export default function MoveRound({ session, disabled, onAnswer }) {
  const round = session.rounds[session.cursor];
  return <div><h2 tabIndex={-1} className="mini-question-title">{session.settings.hard ? 'WHO OWNS THESE PEAK RATINGS?' : 'WHO USES THESE MOVES?'}</h2>{session.settings.hard ? <div className="anonymous-stats" aria-label="Unnamed fighter ratings">{MINI.statKeys.map(stat => <div key={stat}><span>{stat} <strong>{round.target.stats[stat]} / 100</strong></span><ProgressBar value={round.target.stats[stat]} label={`${stat} rating`} /></div>)}</div> : <><ul className="move-clues">{round.moves.map(move => <li key={move}>{move}</li>)}</ul><ul className="mini-tags" aria-label="Ability tags">{round.target.abilityTags.map(tag => <li key={tag}>{tag.replaceAll('-', ' ')}</li>)}</ul></>}
    {session.settings.answerMode === 'typed' ? <NameAnswer key={session.cursor} onAnswer={onAnswer} disabled={disabled} /> : <div className="mini-options">{round.options.map(option => <button type="button" key={option.id} disabled={disabled} onClick={() => onAnswer(option.id)}>{option.name}</button>)}</div>}</div>;
}
