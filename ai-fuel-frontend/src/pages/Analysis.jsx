import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkflowContext } from '../WorkflowContext.jsx';
import { useBudget } from '../BudgetContext.jsx';
import { postTaskStart } from '../api.js';
import './Analysis.css';

function modePillClass(mode) {
  if (mode === 'Advanced AI') return 'pill-advanced';
  if (mode === 'Balanced AI') return 'pill-balanced';
  return 'pill-light';
}
function priorityPillClass(p) {
  if (p === 'Critical') return 'pill-critical-p';
  if (p === 'High') return 'pill-high';
  if (p === 'Medium') return 'pill-medium';
  return 'pill-low';
}

export default function Analysis() {
  const navigate = useNavigate();
  const { request, analysis, setPlan } = useContext(WorkflowContext);
  const { budget, max } = useBudget();

  if (!analysis) {
    return (
      <div className="analysis main-scroll">
        <div className="analysis__inner">
          <p className="analysis__empty">No analysis yet. <a href="/" style={{color:'var(--accent)'}}>Go back to Workspace.</a></p>
        </div>
      </div>
    );
  }

  const { tasks, totalCost, plan, fitCount, canFinishAll } = analysis;
  const afterCompletion = budget - (canFinishAll ? totalCost : plan.filter(t => t.fits).reduce((s, t) => s + t.cost, 0));
  const nonefit = fitCount === 0;

  async function handleStart(useRecommended) {
    const activePlan = useRecommended
      ? plan // already filtered by server
      : plan;
    setPlan(activePlan);
    try {
      await postTaskStart();
    } catch (_) {}
    navigate('/execution');
  }

  return (
    <div className="analysis">
      <div className="analysis__inner">

        {/* ── Left: request + task list ── */}
        <div className="analysis__left">
          <div className="analysis__request">
            <span className="analysis__request-label">Request</span>
            <blockquote className="analysis__request-text">"{request}"</blockquote>
          </div>

          <h2 className="analysis__found">I found {tasks.length} pieces of work</h2>

          <div className="analysis__tasks">
            {tasks.map((t, i) => (
              <div key={t.id} className="analysis__task">
                <span className="analysis__task-num">{i + 1}</span>
                <span className="analysis__task-name">{t.name}</span>
                <span className="analysis__task-cost">{t.cost} credits</span>
                <span className={`pill ${modePillClass(t.mode)}`}>{t.mode}</span>
                <span className={`pill ${priorityPillClass(t.priority)}`}>{t.priority}</span>
              </div>
            ))}
          </div>

          <div className="analysis__total">
            Total estimated cost: <strong>{totalCost.toLocaleString()} credits</strong>
          </div>
        </div>

        {/* ── Right: budget decision panel ── */}
        <div className="analysis__right">
          <div className="analysis__stats">
            <div className="analysis__stat">
              <span className="analysis__stat-val">{budget.toLocaleString()}</span>
              <span className="analysis__stat-label">Available</span>
            </div>
            <div className="analysis__stat">
              <span className="analysis__stat-val">{totalCost.toLocaleString()}</span>
              <span className="analysis__stat-label">Estimated</span>
            </div>
            <div className="analysis__stat">
              <span className={`analysis__stat-val ${afterCompletion < 0 ? 'neg' : ''}`}>
                {afterCompletion < 0 ? '—' : afterCompletion.toLocaleString()}
              </span>
              <span className="analysis__stat-label">After</span>
            </div>
          </div>

          {nonefit ? (
            <div className="analysis__verdict analysis__verdict--none">
              <p>⛔ Insufficient budget to start any task.</p>
              <p style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: 12 }}>
                Use a Usage Limit Reset or activate TRACE to recover budget.
              </p>
              <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn-secondary" onClick={() => navigate('/trace')}>Activate TRACE</button>
                <button className="btn-secondary" onClick={() => navigate('/rewards')}>Use Reset</button>
              </div>
            </div>
          ) : canFinishAll ? (
            <div className="analysis__verdict analysis__verdict--yes">
              <p className="analysis__verdict-line">✓ You can finish all {tasks.length} tasks</p>
              <button className="btn-primary analysis__start-btn" onClick={() => handleStart(false)}>
                Start work
              </button>
            </div>
          ) : (
            <div className="analysis__verdict analysis__verdict--partial">
              <p className="analysis__verdict-line">⚠ You can finish {fitCount} of {tasks.length} tasks</p>
              <div className="analysis__plan-list">
                {plan.map((t, i) => {
                  const icon = t.fits ? '✓' : (i === plan.findIndex(x => !x.fits) ? '⚠' : '○');
                  return (
                    <div key={t.id} className={`analysis__plan-item ${t.fits ? 'fits' : i === plan.findIndex(x => !x.fits) ? 'first-excluded' : 'deferred'}`}>
                      <span className="analysis__plan-icon">{icon}</span>
                      <span className="analysis__plan-name">{t.name}</span>
                      <span className="analysis__plan-cost">{t.cost} cr</span>
                    </div>
                  );
                })}
              </div>
              <p className="analysis__recommend">
                Recommended plan: complete the {fitCount} highest-priority tasks first
              </p>
              <button className="btn-primary analysis__start-btn" onClick={() => handleStart(true)}>
                Use recommended plan
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
