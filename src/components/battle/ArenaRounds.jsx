import { motion, useReducedMotion } from 'framer-motion';
import CharacterAvatar from '../CharacterAvatar';
import ProgressBar from '../ProgressBar';
import Button from '../Button';
export default function ArenaRounds({ record, outcome, roundIndex, onNext, replay }) {
  const reduced = useReducedMotion(), round = outcome.rounds[roundIndex];
  const scoreboard = [0, 0];
  outcome.rounds.slice(0, roundIndex + 1).forEach(item => scoreboard[item.winner]++);
  return <section className="arena-panel arena-rounds"><span className="eyebrow">{replay ? 'REPLAY · ' : ''}ROUND {roundIndex + 1} / 5</span><h2>{record.names[0]} <span className="score-display">{scoreboard.join(' : ')}</span> {record.names[1]}</h2><div className="round-duel">{record.teams.map((team, player) => {
    const card = team[roundIndex], factors = round.factors[player];
    return <motion.div key={`${roundIndex}:${player}`} className={`round-fighter ${round.winner === player ? 'round-victor' : ''}`} initial={{ opacity: 0, x: reduced ? 0 : (player ? 30 : -30) }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduced ? 0 : 0.4 }}><span>{record.names[player]}</span><CharacterAvatar character={card} /><h3>{card.name}</h3><p>{card.formName}</p><strong>{round.powers[player].toFixed(2)} effective power</strong><motion.div key={`bar-${roundIndex}`} initial={{ scaleX: reduced ? 1 : 0 }} animate={{ scaleX: 1 }} style={{ transformOrigin: 'left' }} transition={{ duration: reduced ? 0 : 0.7 }}><ProgressBar value={round.powers[player]} max={1300} label={`${card.name} effective power`} /></motion.div><p className="arena-note">Base {factors.base} × matchup {factors.matchup.toFixed(2)} × synergy {factors.synergy.toFixed(2)} × luck {factors.luck.toFixed(3)}</p></motion.div>;
  })}<span className="duel-vs" aria-hidden="true">VS</span></div><div className="round-explanation" role="status"><h3>{record.teams[round.winner][roundIndex].name} wins!</h3><p>{round.why}</p></div><Button onClick={onNext}>{roundIndex === 4 ? 'View results' : 'Next round'}</Button></section>;
}
