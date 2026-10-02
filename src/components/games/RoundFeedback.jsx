import { scoreSession, correctChoice } from '../../minigames/engine';
import CharacterAvatar from '../CharacterAvatar';
import Button from '../Button';
export default function RoundFeedback({ session, onNext }) {
  const answer = session.answers[session.cursor];
  if (!answer) return null;
  const detail = scoreSession(session).details[session.cursor], round = session.rounds[session.cursor];
  const fighter = session.settings.mode === 'power' ? round.pair[1] : round.target;
  return <div className={`mini-feedback ${detail.correct ? 'correct' : 'incorrect'}`} role="status"><h3>{detail.correct ? `CORRECT · +${detail.points}` : answer.timeout ? 'TIME’S UP · +0' : 'WRONG GUESS · +0'}</h3><div className="answer-fighter"><CharacterAvatar character={fighter} /><div><strong>{fighter.name}</strong><p>{fighter.formName}</p>{session.settings.mode === 'power' ? <p>{fighter.powerScore} is {correctChoice(session, session.cursor)} than {round.pair[0].powerScore}.</p> : <p>{session.settings.mode === 'clue' ? `${answer.hints} clue${answer.hints === 1 ? '' : 's'} used.` : 'Moves and ratings come from the locked peak snapshot.'}</p>}{answer.input && <p>Your guess: {answer.input}</p>}</div></div><Button onClick={onNext}>{session.cursor === 9 ? 'View results' : 'Next round'}</Button></div>;
}
