import { useEffect, useState } from 'react';
import { getRewards, postRewardsQuiz } from '../api.js';
import './Rewards.css';

const MILESTONE_WINDOW = 2500;

const QUIZ = {
  question: 'If authentication middleware changes, which area could be affected?',
  options: [
    { id: 'a', text: 'Login routes' },
    { id: 'b', text: 'Protected route guards' },
    { id: 'c', text: 'OAuth callback handlers' },
    { id: 'd', text: 'All of the above' },
  ],
  correct: 'd',
};

export default function Rewards() {
  const [rewards, setRewards] = useState(null);
  const [quizState, setQuizState] = useState('idle');
  const [selected, setSelected] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [milestoneReached, setMilestoneReached] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try { const data = await getRewards(); setRewards(data); } catch (_) {}
  }

  async function handleAnswer(optId) {
    if (quizState !== 'idle') return;
    setSelected(optId);
    const correct = optId === QUIZ.correct;
    try {
      const res = await postRewardsQuiz(correct);
      setQuizResult(res);
      setMilestoneReached(res.milestonesCrossed > 0);
      setRewards(prev => prev ? {
        ...prev,
        points: res.points,
        resets: res.resets,
        pointsToNextMilestone: res.milestonesCrossed > 0
          ? MILESTONE_WINDOW - (res.points % MILESTONE_WINDOW || MILESTONE_WINDOW)
          : Math.max(0, prev.pointsToNextMilestone - res.pointsAwarded),
      } : prev);
    } catch (_) {
      setQuizResult({ correct, pointsAwarded: correct ? 50 : 0 });
    }
    setQuizState('answered');
  }

  if (!rewards) {
    return <div className="rewards main-scroll"><div className="rewards__inner"><p style={{color:'var(--text-muted)'}}>Loading…</p></div></div>;
  }

  const { points, resets, streak, pointsToNextMilestone } = rewards;
  const progressPct = Math.max(0, Math.min(100, ((MILESTONE_WINDOW - pointsToNextMilestone) / MILESTONE_WINDOW) * 100));

  return (
    <div className="rewards main-scroll">
      <div className="rewards__inner">
        <h2 className="rewards__heading">AI Knowledge</h2>

        <div className="rewards__stats">
          <div className="rewards__stat"><span className="rewards__stat-val">{streak}</span><span className="rewards__stat-label">Day Streak</span></div>
          <div className="rewards__stat"><span className="rewards__stat-val">{points.toLocaleString()}</span><span className="rewards__stat-label">Points</span></div>
          <div className="rewards__stat"><span className="rewards__stat-val">⚡ {resets}</span><span className="rewards__stat-label">Resets</span></div>
        </div>

        <div className="rewards__milestone">
          <div className="rewards__milestone-row">
            <span className="rewards__milestone-label">Progress to next reset</span>
            <span className="rewards__milestone-pts">{pointsToNextMilestone.toLocaleString()} points to go</span>
          </div>
          <div className="budget-bar-wrap" style={{ height: 5 }}>
            <div className="budget-bar-fill green" style={{ width: `${progressPct.toFixed(1)}%`, transition: 'width 0.6s ease' }} />
          </div>
          <div className="rewards__milestone-sub">Every 2,500 points unlocks +1 Usage Limit Reset</div>
        </div>

        <div className="rewards__quiz">
          <div className="rewards__quiz-label">Quick Quiz</div>
          <p className="rewards__quiz-question">{QUIZ.question}</p>
          <div className="rewards__quiz-options">
            {QUIZ.options.map(opt => {
              let cls = 'rewards__quiz-option';
              if (quizState === 'answered') {
                if (opt.id === QUIZ.correct) cls += ' correct';
                else if (opt.id === selected && selected !== QUIZ.correct) cls += ' wrong';
              }
              return (
                <button key={opt.id} className={cls} onClick={() => handleAnswer(opt.id)} disabled={quizState !== 'idle'}>
                  <span className="rewards__quiz-opt-key">{opt.id.toUpperCase()}</span>
                  {opt.text}
                </button>
              );
            })}
          </div>

          {quizState === 'answered' && quizResult && (
            <div className="rewards__quiz-feedback">
              {milestoneReached ? (
                <div className="rewards__milestone-banner">
                  🎉 Milestone reached — +1 Usage Limit Reset unlocked!
                  <span className="rewards__milestone-banner-pts">+{quizResult.pointsAwarded} points</span>
                </div>
              ) : quizResult.correct ? (
                <div className="rewards__quiz-correct">
                  ✓ Correct! +{quizResult.pointsAwarded} points · {rewards.pointsToNextMilestone} points to next reset
                </div>
              ) : (
                <div className="rewards__quiz-wrong">
                  The correct answer is: <strong>{QUIZ.options.find(o => o.id === QUIZ.correct)?.text}</strong>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
