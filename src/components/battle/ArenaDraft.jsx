import { motion, useReducedMotion } from 'framer-motion';
import { GAME } from '../../game/config';
import CharacterCard from '../CharacterCard';
import Button from '../Button';
import FighterMini from './FighterMini';
export default function ArenaDraft({ draft, player, name, onDraw, onReroll, onLock }) {
  const reduced = useReducedMotion(), team = draft.teams[player], current = team.at(-1);
  return <section className="arena-panel"><span className="eyebrow">PRIVATE DRAFT · {name}</span><h2 tabIndex={-1}>{team.length} / {GAME.teamSize} FIGHTERS</h2><p>One reroll token. Replace your latest card before revealing the next.</p>
    <div className="draft-layout"><div className="draft-reveal">{current ? <motion.div key={`${current.id}:${current.formId}`} initial={{ opacity: 0, rotateY: reduced ? 0 : 90 }} animate={{ opacity: 1, rotateY: 0 }} transition={{ duration: reduced ? 0 : 0.4 }}><CharacterCard character={current} /><p className="locked-form" role="status">{current.name} · {current.rarity} · LOCKED FORM · {current.formName}</p></motion.div> : <div className="card-back" aria-label="Unrevealed fighter"><span>?</span><strong>WHO JOINS YOUR TEAM?</strong></div>}</div>
      <div className="draft-roster"><h3>YOUR TEAM</h3>{team.map(card => <FighterMini key={card.id} card={card} />)}<div className="arena-actions">{team.length < GAME.teamSize ? <Button onClick={onDraw}>Reveal fighter {team.length + 1}</Button> : <Button onClick={onLock}>Keep team</Button>}<Button variant="secondary" disabled={!current || !draft.rerolls[player]} onClick={onReroll}>Reroll latest ({draft.rerolls[player]} left)</Button></div><p className="arena-note">Discarded identities stay out of this draft. Your opponent’s cards remain hidden.</p></div>
    </div></section>;
}
