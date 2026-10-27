import Button from './Button';
export const gameChoices = [
  { id: 'move', title: 'Move Match', tag: 'SIGNATURE MOVES', detail: 'Rasengan. Chidori. Can you name their fighters?', time: '10 rounds · 30 sec each', icon: '01' },
  { id: 'clue', title: 'Clue Chain', tag: 'READ BETWEEN THE LINES', detail: 'Three clues. One fighter. Fewer hints, bigger score.', time: '10 rounds · 30 sec each', icon: '02' },
  { id: 'power', title: 'Higher / Lower', tag: 'TRUST YOUR READ', detail: 'Compare two fighters using our fan-made power ratings.', time: '10 rounds · 30 sec each', icon: '03' },
];
export const quizChoices = [
  { id: 'blitz', title: '60-second Blitz', tag: 'QUICK PLAY', detail: 'Race the clock. Build a correct-answer streak.', time: '60 seconds', icon: '01' },
  { id: 'daily', title: 'Daily Challenge', tag: 'ONE SHARED CHALLENGE', detail: 'Five questions for everyone. A fresh challenge every day.', time: '5 questions · untimed', icon: '02' },
  { id: 'classic', title: 'Classic Quiz', tag: 'TAKE YOUR TIME', detail: 'Test your knowledge, then learn from every explanation.', time: '10 questions · untimed', icon: '03' },
];
export default function QuickPlay({ choices, onPlay, disabled }) {
  return <section className="quick-grid" aria-label="Quick play">{choices.map(choice => <article className="quick-card" key={choice.id}><span className="quick-number" aria-hidden="true">{choice.icon}</span><span className="eyebrow">{choice.tag}</span><h2>{choice.title}</h2><p>{choice.detail}</p><small>{choice.time}</small><Button disabled={disabled} onClick={() => onPlay(choice.id)}>Play {choice.title}</Button></article>)}</section>;
}
