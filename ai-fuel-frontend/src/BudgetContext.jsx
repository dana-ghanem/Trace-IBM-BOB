import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getUsage, postDemoScenario } from './api.js';

const BudgetContext = createContext(null);

const FULL_BUDGET = 1240; // matches backend SCENARIOS.safe

export function BudgetProvider({ children }) {
  const [budget, setBudget] = useState(FULL_BUDGET);
  const [max, setMax] = useState(FULL_BUDGET);
  const [status, setStatus] = useState('SAFE');
  const [floatBadges, setFloatBadges] = useState([]);
  const [activeScenario, setActiveScenario] = useState('safe');

  useEffect(() => {
    getUsage().then(data => {
      // max is always the full/safe budget, not the current
      setBudget(data.budget);
      setMax(data.max ?? FULL_BUDGET);
      setStatus(data.status);
    }).catch(() => {});
  }, []);

  const animateTo = useCallback((newBudget, newMax, newStatus) => {
    setBudget(prev => {
      const diff = newBudget - prev;
      if (diff !== 0) {
        const id = Date.now() + Math.random();
        setFloatBadges(bs => [...bs, { id, diff }]);
        setTimeout(() => setFloatBadges(bs => bs.filter(b => b.id !== id)), 600);
      }
      return newBudget;
    });
    if (newMax !== undefined) setMax(newMax);
    if (newStatus !== undefined) setStatus(newStatus);
  }, []);

  const refreshBudget = useCallback(async () => {
    try {
      const data = await getUsage();
      animateTo(data.budget, data.max ?? max, data.status);
    } catch (_) {}
  }, [animateTo, max]);

  // applyBudgetUpdate: called after spending credits — max never changes, only budget + status
  const applyBudgetUpdate = useCallback((newBudget, newMax, newStatus) => {
    const resolvedMax = newMax ?? max;
    animateTo(newBudget, resolvedMax, newStatus ?? deriveStatus(newBudget, resolvedMax));
  }, [max, animateTo]);

  // switchScenario: demo switcher — max always stays FULL_BUDGET
  const switchScenario = useCallback(async (scenario) => {
    try {
      const data = await postDemoScenario(scenario);
      setActiveScenario(scenario);
      animateTo(data.budget, FULL_BUDGET, deriveStatus(data.budget, FULL_BUDGET));
    } catch (_) {}
  }, [animateTo]);

  return (
    <BudgetContext.Provider value={{
      budget, max, status, floatBadges,
      activeScenario,
      refreshBudget, applyBudgetUpdate, switchScenario,
    }}>
      {children}
    </BudgetContext.Provider>
  );
}

function deriveStatus(budget, max) {
  const r = max > 0 ? budget / max : 0;
  if (r > 0.5) return 'SAFE';
  if (r > 0.2) return 'WARNING';
  return 'CRITICAL';
}

export function useBudget() {
  return useContext(BudgetContext);
}
