import { motion, useReducedMotion } from 'framer-motion';
import { QUIZ } from '../../quiz/config';
import { scoreAttempt } from '../../quiz/engine';
import Button from '../Button';
import ProgressBar from '../ProgressBar';
export default function QuizQuestion({ attempt, now, onAnswer, onNext, onLeave }) {
  const reduced = useReducedMotion(), question = attempt.questions[attempt.cursor], answer = attempt.answers[attempt.cursor];
  const score = scoreAttempt(attempt), left = Math.max(0, (attempt.deadline - now) / 1000);
  const multiplier = Math.min(QUIZ.maxMultiplier, 1 + Math.floor((score.streak + 1) / QUIZ.streakStep));
  return <section className="quiz-panel"><div className="quiz-game-meta"><span>{attempt.mode.toUpperCase()} · {question.anime} · {question.difficulty}</span><strong>{score.score} POINTS {attempt.mode === 'blitz' ? `· NEXT CORRECT ×${multiplier}` : ''}</strong></div>
    {attempt.mode === 'blitz' && <div className="quiz-clock"><p role="timer" aria-label="Time remaining">{Math.ceil(left)} seconds left</p><ProgressBar value={left} max={QUIZ.blitzMs / 1000} label="Blitz time remaining" color={left < 10 ? '#ff729b' : '#c2ff43'} /></div>}
    {attempt.mode === 'daily' && <p className="quiz-note">Challenge closes at midnight India time · {Math.floor(left / 3600)}h {Math.floor(left % 3600 / 60)}m remaining</p>}
    <p className="quiz-count">QUESTION {attempt.cursor + 1} / {attempt.questions.length}</p><ProgressBar value={attempt.cursor + Number(Boolean(answer))} max={attempt.questions.length} label="Questions answered" />
    <motion.div key={question.id} initial={{ opacity: 0, y: reduced ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .2 }}><h2 tabIndex={-1} className="quiz-question-title">{question.question}</h2><div className="quiz-options">{question.options.map((option, index) => {
      const correct = answer && index === question.answerIndex, wrong = answer && index === answer.optionIndex && !correct;
      return <button type="button" key={option} disabled={Boolean(answer) || (attempt.deadline !== null && now >= attempt.deadline)} className={`quiz-option ${correct ? 'correct' : wrong ? 'incorrect' : ''}`} onClick={() => onAnswer(index)}><span aria-hidden="true">{String.fromCharCode(65 + index)}</span>{option}{correct && <strong>✓ Correct</strong>}{wrong && <strong>✕ Your answer</strong>}</button>;
    })}</div></motion.div>
    {answer && <div className={`quiz-feedback ${answer.optionIndex === question.answerIndex ? 'is-correct' : 'is-incorrect'}`} role="status"><h3>{answer.optionIndex === question.answerIndex ? 'CORRECT!' : `ANSWER: ${question.options[question.answerIndex]}`}</h3><p>{question.explanation}</p><p className="quiz-note">Manga reference: {question.canonReference.arc}</p><Button onClick={onNext}>{attempt.cursor === attempt.questions.length - 1 ? 'View results' : 'Next question'}</Button></div>}
    <div className="quiz-actions"><Button variant="secondary" onClick={onLeave}>Save and leave</Button><span className="quiz-note">{attempt.mode === 'blitz' ? 'The timer continues while you are away.' : attempt.mode === 'daily' ? 'Resume today before midnight.' : 'Resume from recent attempts.'}</span></div>
  </section>;
}
