import { scoreAttempt } from '../../quiz/engine';
import Button from '../Button';
export default function QuizResults({ attempt, user, saving, saveError, onSave, onNew }) {
  const result = scoreAttempt(attempt);
  return <section className="quiz-panel quiz-results"><span className="eyebrow">{attempt.mode.toUpperCase()} COMPLETE</span><h2 tabIndex={-1} className="quiz-result-title">YOUR KNOWLEDGE SCORE.</h2><dl className="quiz-result-stats">{[['Score', result.score], ['Accuracy', `${result.accuracy}%`], ['XP earned', result.xp], ['Best answer streak', result.bestStreak]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p>{result.correct} correct · {result.answered} answered · {result.total - result.answered} unanswered</p><p className="quiz-note">{attempt.mode === 'blitz' ? 'Blitz accuracy uses answered questions. The timer included time spent reading feedback.' : 'Accuracy uses every question; unanswered questions count as incorrect.'}</p>
    <p role="status">{saving ? 'Saving quiz result…' : attempt.saved ? attempt.ownerId ? `Progress saved to ${user?.username ?? 'your profile'}.` : 'Guest result saved. Profile XP requires signing in before starting.' : 'Profile result is not yet fully saved.'}</p>{saveError && <p role="alert" className="account-error">{saveError}</p>}<div className="quiz-actions">{saveError && <Button onClick={onSave} disabled={saving}>Retry save</Button>}<Button onClick={onNew} disabled={saving}>{attempt.mode === 'daily' ? 'Back to quizzes' : 'Choose another quiz'}</Button><Button to="/profile" variant="secondary">View profile</Button></div>
    <h3 className="quiz-review-title">ANSWER REVIEW</h3><ol className="quiz-review">{attempt.questions.map((question, index) => {
      const answer = attempt.answers[index], correct = answer?.optionIndex === question.answerIndex;
      return <li key={question.id}><strong>{question.question}</strong><span className={correct ? 'review-correct' : 'review-incorrect'}>{correct ? '✓' : '✕'} Your answer: {answer ? question.options[answer.optionIndex] : 'Unanswered'}</span><span>Correct: {question.options[question.answerIndex]}</span><p>{question.explanation}</p></li>;
    })}</ol>
  </section>;
}
