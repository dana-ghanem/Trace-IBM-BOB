import { useEffect, useRef, useState } from 'react';
import './BudgetDisplay.css';

function barClass(ratio) {
  if (ratio > 0.5) return 'green';
  if (ratio > 0.2) return 'yellow';
  return 'red';
}

function statusPillClass(status) {
  if (status === 'SAFE') return 'pill-safe';
  if (status === 'WARNING') return 'pill-warning';
  return 'pill-critical';
}

/* Tweens a number from `from` to `to` over `duration` ms */
function useTweenedNumber(target, duration = 300) {
  const [display, setDisplay] = useState(target);
  const frameRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    startRef.current = null;

    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min(1, (ts - startRef.current) / duration);
      const ease = 1 - Math.pow(1 - p, 3); // cubic ease-out
      setDisplay(Math.round(from + (target - from) * ease));
      if (p < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return display;
}

export default function BudgetDisplay({ budget, max, status, floatBadges = [], compact = false }) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, budget / max)) : 0;
  const displayed = useTweenedNumber(budget);

  return (
    <div className={`budget-display ${compact ? 'budget-display--compact' : ''}`}>
      <div className="budget-display__row">
        <span className="budget-display__label">AI Budget</span>
        <span className={`pill ${statusPillClass(status)}`}>{status}</span>
      </div>
      <div className="budget-display__number-row">
        <span className="budget-display__number">{displayed.toLocaleString()}</span>
        <span className="budget-display__unit"> credits</span>
        {/* Float badges */}
        {floatBadges.map(b => (
          <span
            key={b.id}
            className={`float-badge ${b.diff < 0 ? 'neg' : 'pos'}`}
            style={{ top: '-2px', right: '0' }}
          >
            {b.diff > 0 ? '+' : ''}{b.diff}
          </span>
        ))}
      </div>
      <div className="budget-bar-wrap" style={{ marginTop: '4px' }}>
        <div
          className={`budget-bar-fill ${barClass(ratio)}`}
          style={{ width: `${(ratio * 100).toFixed(1)}%` }}
        />
      </div>
    </div>
  );
}
