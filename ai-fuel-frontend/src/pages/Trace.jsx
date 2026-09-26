import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkflowContext } from '../WorkflowContext.jsx';
import { useBudget } from '../BudgetContext.jsx';
import { postTrace, postTraceStageComplete, postRewardsReset } from '../api.js';
import BudgetDisplay from '../BudgetDisplay.jsx';
import './Trace.css';

const LOG_INTERVAL = 250; // ms per log line
const STAGE_SETTLE = 200; // ms after last log before resolving stage

export default function Trace() {
  const navigate = useNavigate();
  const { setCompletion, plan, analysis } = useContext(WorkflowContext);
  const { budget, max, status, floatBadges, applyBudgetUpdate } = useBudget();

  const [stages, setStages] = useState(null);      // loaded from API
  const [estimate, setEstimate] = useState(160);
  const [activeStage, setActiveStage] = useState(-1);  // -1 = not started
  const [streamedLogs, setStreamedLogs] = useState([]); // logs for active stage
  const [completedStages, setCompletedStages] = useState([]); // indices done
  const [done, setDone] = useState(false);
  const [resetApplied, setResetApplied] = useState(false);
  const [showResetOffer, setShowResetOffer] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    load();
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    // Offer reset if critical
    if (status === 'CRITICAL' || budget < 300) {
      setShowResetOffer(true);
    }
  }, [status, budget]);

  async function load() {
    try {
      const data = await postTrace();
      setStages(data.stages);
      setEstimate(data.estimate || 160);
      // auto-start after short delay
        setTimeout(() => runStage(0, data.stages), 200);
    } catch (_) {}
  }

  function runStage(idx, stagesArr) {
    const s = stagesArr[idx];
    if (!s) { finishAll(); return; }
    setActiveStage(idx);
    setStreamedLogs([]);

    let logIdx = 0;
    const streamNext = () => {
      if (logIdx < s.logs.length) {
        const log = s.logs[logIdx++];
        setStreamedLogs(prev => [...prev, log]);
        timerRef.current = setTimeout(streamNext, LOG_INTERVAL);
      } else {
        // All logs streamed — settle then complete stage
        timerRef.current = setTimeout(async () => {
          await completeStage(idx, stagesArr);
        }, STAGE_SETTLE);
      }
    };
    timerRef.current = setTimeout(streamNext, LOG_INTERVAL);
  }

  async function completeStage(idx, stagesArr) {
    try {
      const res = await postTraceStageComplete(idx);
      if (typeof res.budget === 'number') {
        applyBudgetUpdate(res.budget);
      }
    } catch (_) {}

    setCompletedStages(prev => [...prev, idx]);

    const next = idx + 1;
    if (next < stagesArr.length) {
      timerRef.current = setTimeout(() => runStage(next, stagesArr), 200);
    } else {
      finishAll();
    }
  }

  function finishAll() {
    setDone(true);
    setActiveStage(-1);
  }

  async function handleUseReset() {
    try {
      const res = await postRewardsReset();
      applyBudgetUpdate(res.budget);
      setResetApplied(true);
      setShowResetOffer(false);
    } catch (e) {
      alert(e.message || 'No Usage Limit Resets available');
    }
  }

  function handleReturnToWorkspace() {
    const fitCount = plan ? plan.filter(t => t.fits).length : (analysis?.fitCount ?? 0);
    const totalTasks = analysis?.tasks?.length ?? 6;
    const deferred = (plan || []).filter(t => !t.fits);
    setCompletion({
      tasksCompleted: fitCount,
      tasksTotal: totalTasks,
      budgetRemaining: budget,
      deferredTasks: deferred,
    });
    navigate('/');
  }

  return (
    <div className="trace main-scroll">
      <div className="trace__inner">
        <div className="trace__header">
          <span className="trace__title">⚡ TRACE</span>
          <BudgetDisplay budget={budget} max={max} status={status} floatBadges={floatBadges} compact />
          {(activeStage === 2 || completedStages.includes(2)) && (
            <div className="trace__budget-cost" style={{ marginTop: 4 }}>
              ~{estimate} credits required for Minimal fix
            </div>
          )}
        </div>

        {/* Reset offer */}
        {showResetOffer && !resetApplied && !done && (
          <div className="trace__reset-offer">
            <p className="trace__reset-title">Budget is critical — choose an option:</p>
            <div className="trace__reset-btns">
              <button className="btn-primary" onClick={handleUseReset}>
                Use Usage Limit Reset
              </button>
              <span className="trace__reset-or">or</span>
              <button className="btn-secondary" onClick={() => setShowResetOffer(false)}>
                Activate TRACE instead
              </button>
            </div>
          </div>
        )}

        {resetApplied && (
          <div className="trace__reset-applied">
            ✓ Usage Limit Reset Applied — budget restored to {budget.toLocaleString()} credits.
          </div>
        )}

        {/* Stages */}
        {stages && (
          <div className="trace__stages">
            {stages.map((s, i) => {
              const isDone = completedStages.includes(i);
              const isActive = activeStage === i;
              return (
                <div key={i} className={`trace-stage ${isDone ? 'done' : isActive ? 'active' : 'pending'}`}>
                  <div className="trace-stage__header">
                    <span className="trace-stage__icon">{isDone ? '✓' : isActive ? '●' : '○'}</span>
                    <span className="trace-stage__name">{s.name}</span>
                    {s.cost && isDone && (
                      <span className="trace-stage__cost-badge">−{s.cost} credits</span>
                    )}
                  </div>

                  {/* Active: streaming logs */}
                  {isActive && (
                    <div className="trace-stage__logs">
                      {streamedLogs.map((log, li) => (
                        <div key={li} className="trace-stage__log-line">
                          <span className="trace-stage__log-prompt">&gt;</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Done: result stays visible */}
                  {isDone && (
                    <div className="trace-stage__result">
                      {s.result}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {done && (
          <div className="trace__done">
            <p className="trace__done-note">TRACE complete. The root cause has been identified and the minimal fix applied.</p>
            <button className="btn-primary trace__done-btn" onClick={handleReturnToWorkspace}>
              Return to Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
