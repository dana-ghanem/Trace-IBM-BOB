import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkflowContext } from '../WorkflowContext.jsx';
import { useBudget } from '../BudgetContext.jsx';
import { postTaskProgress, postImpact, postImpactApply, postTaskFinish } from '../api.js';
import BudgetDisplay from '../BudgetDisplay.jsx';
import './Execution.css';

const MODE_MAP = {
  'Lightweight AI': 'LIGHTWEIGHT',
  'Balanced AI':    'BALANCED',
  'Advanced AI':    'ADVANCED',
};

function stepsFromPlan(plan) {
  const fitTasks = (plan || []).filter(t => t.fits);
  if (fitTasks.length === 0) {
    return [
      { label: 'Analyze project',   mode: 'LIGHTWEIGHT' },
      { label: 'Implement changes', mode: 'BALANCED'    },
      { label: 'Run tests',         mode: 'LIGHTWEIGHT' },
    ];
  }
  const steps = fitTasks.map(t => ({ label: t.name, mode: MODE_MAP[t.mode] || 'BALANCED' }));
  // Always append a verify step
  steps.push({ label: 'Verify & finalize', mode: 'LIGHTWEIGHT' });
  return steps;
}

function modePill(mode) {
  const cls = mode === 'ADVANCED' ? 'pill-advanced' : mode === 'BALANCED' ? 'pill-balanced' : 'pill-light';
  return <span className={`pill ${cls}`}>{mode}</span>;
}

// Phase: 'running' | 'error' | 'impact' | 'applying' | 'done'
export default function Execution() {
  const navigate = useNavigate();
  const { plan, analysis, setCompletion } = useContext(WorkflowContext);
  const { budget, max, status, floatBadges, applyBudgetUpdate } = useBudget();
  const STEPS = stepsFromPlan(plan);

  const [currentStep, setCurrentStep] = useState(-1); // -1 = not started
  const [completedSteps, setCompletedSteps] = useState([]);
  const [phase, setPhase] = useState('running'); // running | error | impact | applying | done
  const [errorInfo, setErrorInfo] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [applying, setApplying] = useState(false);
  const timerRef = useRef(null);
  const stepRef = useRef(0);

  const fitCount = plan ? plan.filter(t => t.fits).length : (analysis?.fitCount ?? 0);
  const totalTasks = analysis?.tasks?.length ?? 6;

  useEffect(() => {
    // Start execution automatically
    runStep(0);
    return () => clearTimeout(timerRef.current);
  }, []);

  function runStep(idx) {
    if (idx >= STEPS.length) {
      finish();
      return;
    }
    stepRef.current = idx;
    setCurrentStep(idx);

    timerRef.current = setTimeout(async () => {
      try {
        // backend accepts steps 0-4; map dynamic step index into that range
        const res = await postTaskProgress(Math.min(idx, 4));
        if (res.error) {
          setErrorInfo(res.error);
          setPhase('error');
          return;
        }
        setCompletedSteps(prev => [...prev, idx]);
        runStep(idx + 1);
      } catch (e) {
        // Fallback: simulate progress anyway
        if (idx === 2) {
          setErrorInfo({
            message: '401 Unauthorized after OAuth callback',
            where: 'auth/middleware.js',
            why: 'The validated token is not reaching the authentication context.',
          });
          setPhase('error');
        } else {
          setCompletedSteps(prev => [...prev, idx]);
          runStep(idx + 1);
        }
      }
    }, 400 + Math.random() * 200);
  }

  async function handleSeeImpact() {
    try {
      const data = await postImpact();
      setImpactData(data);
    } catch (_) {
      setImpactData({
        proposedChange: 'Pass the validated token into the authentication context.',
        affected: ['Authentication middleware', 'OAuth callback', 'Protected routes', 'Authentication tests'],
      });
    }
    setPhase('impact');
  }

  async function handleApplyFix() {
    setApplying(true);
    try {
      const result = await postImpactApply();
      applyBudgetUpdate(result.budget);
      setCompletedSteps(prev => [...prev, stepRef.current]);
      setPhase('running');
      runStep(stepRef.current + 1);
    } catch (_) {
      // fallback: still continue
      setCompletedSteps(prev => [...prev, stepRef.current]);
      setPhase('running');
      runStep(stepRef.current + 1);
    } finally {
      setApplying(false);
    }
  }

  async function finish() {
    setPhase('done');
    try {
      const result = await postTaskFinish(plan);
      const deferred = (plan || []).filter(t => !t.fits);
      setCompletion({
        tasksCompleted: result.tasksCompleted,
        tasksTotal: result.tasksTotal,
        budgetRemaining: result.budgetRemaining,
        deferredTasks: deferred,
      });
    } catch (_) {
      const deferred = (plan || []).filter(t => !t.fits);
      setCompletion({
        tasksCompleted: fitCount,
        tasksTotal: totalTasks,
        budgetRemaining: budget,
        deferredTasks: deferred,
      });
    }
    setTimeout(() => navigate('/'), 800);
  }

  return (
    <div className="execution">
      {/* Main content */}
      <div className="execution__main main-scroll">
        <div className="execution__inner">
          <h2 className="execution__heading">AI is working on your plan.</h2>

          {fitCount < totalTasks && (
            <p className="execution__partial-note">
              Executing the {fitCount} highest-priority tasks (of {totalTasks} requested).
            </p>
          )}

          {/* Timeline */}
          <div className="execution__timeline">
            {STEPS.map((s, i) => {
              const done = completedSteps.includes(i);
              const active = currentStep === i && phase === 'running';
              const icon = done ? '✓' : active ? '●' : '○';
              return (
                <div key={i} className={`exec-step ${done ? 'done' : active ? 'active' : 'pending'}`}>
                  <div className="exec-step__icon">{icon}</div>
                  <div className="exec-step__body">
                    <span className="exec-step__label">{s.label}</span>
                    {modePill(s.mode)}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="execution__ai-note">
            AI Fuel uses stronger AI only where deeper reasoning is needed.
          </p>

          {/* Error panel */}
          {phase === 'error' && errorInfo && (
            <div className="execution__error-panel">
              <p className="execution__error-title">⚠ I found a problem</p>
              <div className="execution__error-detail">
                <div className="exec-error-row">
                  <span className="exec-error-key">Error</span>
                  <code className="exec-error-val">{errorInfo.message}</code>
                </div>
                <div className="exec-error-row">
                  <span className="exec-error-key">Where</span>
                  <code className="exec-error-val">{errorInfo.where}</code>
                </div>
                <div className="exec-error-row">
                  <span className="exec-error-key">Why</span>
                  <span className="exec-error-val">{errorInfo.why}</span>
                </div>
              </div>
              <button className="btn-primary" onClick={handleSeeImpact} style={{ marginTop: 14 }}>
                See what this change affects
              </button>
            </div>
          )}

          {/* Impact panel */}
          {phase === 'impact' && impactData && (
            <div className="execution__impact-panel">
              <p className="execution__impact-title">Before I apply this fix…</p>
              <div className="execution__impact-change">
                <span className="exec-error-key">Proposed change</span>
                <p style={{ margin: '6px 0 14px', color: 'var(--text)' }}>{impactData.proposedChange}</p>
              </div>
              <div className="execution__impact-affected">
                {impactData.affected.map((a, i) => (
                  <div key={i} className="execution__impact-area">
                    <span className="execution__impact-arrow">→</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
              <button
                className="btn-primary"
                onClick={handleApplyFix}
                disabled={applying}
                style={{ marginTop: 16 }}
              >
                {applying ? 'Applying…' : 'Apply fix'}
              </button>
            </div>
          )}

          {phase === 'done' && (
            <div className="execution__done">
              <span className="execution__done-check">✓</span>
              <span>All steps complete. Returning to workspace…</span>
            </div>
          )}
        </div>
      </div>

      {/* Right panel */}
      <aside className="execution__panel">
        <BudgetDisplay budget={budget} max={max} status={status} floatBadges={floatBadges} compact />
        <div style={{ marginBottom: 14 }} />

        {currentStep >= 0 && currentStep < STEPS.length && phase === 'running' && (
          <div className="execution__panel-section">
            <div className="execution__panel-section-title">Current task</div>
            <div className="execution__panel-current-task">{STEPS[currentStep].label}</div>
          </div>
        )}

        <div className="execution__panel-section" style={{ marginTop: 16 }}>
          <div className="execution__panel-section-title">AI Fuel is protecting your budget</div>
          <ul className="execution__panel-protect">
            <li>Critical work prioritized</li>
            <li>Advanced AI reserved for complex work</li>
            <li>Lightweight AI used for routine work</li>
          </ul>
        </div>

        {(status === 'CRITICAL' || status === 'WARNING') && (
          <button
            className="btn-secondary"
            style={{ marginTop: 16, width: '100%', fontSize: 12 }}
            onClick={() => navigate('/trace')}
          >
            Activate TRACE
          </button>
        )}
      </aside>
    </div>
  );
}
