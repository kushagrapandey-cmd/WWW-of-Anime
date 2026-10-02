import Button from '../Button';
import FighterMini from './FighterMini';
export default function ArenaLineup({ name, team, onChange, onLock }) {
  function move(index, offset) {
    const next = [...team];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  }
  return <section className="arena-panel"><span className="eyebrow">PRIVATE LINEUP · {name}</span><h2 tabIndex={-1}>SET YOUR ROUND ORDER.</h2><p>Your opponent cannot see this order until battle begins.</p><ol className="lineup-list">{team.map((card, index) => <li key={card.id}><span className="round-slot">ROUND {index + 1}</span><FighterMini card={card}><div className="lineup-buttons"><Button variant="secondary" disabled={index === 0} aria-label={`Move ${card.name} earlier`} onClick={() => move(index, -1)}>↑</Button><Button variant="secondary" disabled={index === team.length - 1} aria-label={`Move ${card.name} later`} onClick={() => move(index, 1)}>↓</Button></div></FighterMini></li>)}</ol><Button onClick={onLock}>Lock lineup</Button></section>;
}
