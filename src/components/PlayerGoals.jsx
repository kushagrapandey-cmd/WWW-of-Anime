import { playerGoals } from '../data/progression';
import Card from './Card';
import ProgressBar from './ProgressBar';
import Button from './Button';
export default function PlayerGoals({ user }) {
  const goals = playerGoals(user);
  return <Card className="profile-section player-goals"><span className="eyebrow">YOUR NEXT CHAPTER</span><h2>EARN YOUR IDENTITY.</h2><p>Complete goals to unlock player titles. Cosmetics only—no coin spending or redemption.</p><div className="goal-grid">{goals.map(goal => <article key={goal.id} className={`goal-card ${goal.unlocked ? 'goal-earned' : ''}`}><span className="eyebrow">{goal.unlocked ? 'TITLE UNLOCKED' : 'NEXT OBJECTIVE'}</span><h3>{goal.title}</h3><p>{goal.description}</p><ProgressBar value={Math.min(goal.value, goal.target)} max={goal.target} label={goal.description} /><small>{Math.min(goal.value, goal.target)} / {goal.target}</small>{!goal.unlocked && <Button to={goal.href} variant="secondary">Work toward this</Button>}</article>)}</div></Card>;
}
