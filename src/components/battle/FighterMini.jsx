import CharacterAvatar from '../CharacterAvatar';
export default function FighterMini({ card, children }) {
  return <div className="fighter-mini"><CharacterAvatar character={card} /><div><strong>{card.name}</strong><span>{card.formName} · {card.powerScore} power</span></div>{children}</div>;
}
