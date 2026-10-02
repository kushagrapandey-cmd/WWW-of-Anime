import CharacterAvatar from '../CharacterAvatar';
import Button from '../Button';
export default function PowerRound({ session, disabled, revealed, onAnswer }) {
  const pair = session.rounds[session.cursor].pair;
  return <div><h2 tabIndex={-1} className="mini-question-title">IS THE CHALLENGER HIGHER OR LOWER?</h2><div className="power-pair">{pair.map((card, index) => <div key={card.id} className="power-fighter"><span>{index === 0 ? 'REFERENCE' : 'CHALLENGER'}</span><CharacterAvatar character={index === 1 && !revealed ? { ...card, rarity: 'Hidden' } : card} /><h3>{card.name}</h3><p>{card.formName}</p><strong>{index === 0 || revealed ? `${card.powerScore} power` : '? power'}</strong></div>)}</div><div className="mini-options power-options"><Button onClick={() => onAnswer('higher')} disabled={disabled}>Higher ↑</Button><Button variant="secondary" onClick={() => onAnswer('lower')} disabled={disabled}>Lower ↓</Button></div><p className="mini-note">Compare the challenger to the reference. Ties never appear.</p></div>;
}
