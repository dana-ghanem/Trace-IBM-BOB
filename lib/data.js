// Shared data constants for Vercel serverless functions
// NOTE: serverless functions are stateless — state lives in the frontend (localStorage)

const SCENARIOS = { safe: 1240, low: 950, critical: 180, exhausted: 0 };
const RESET_MILESTONE = 2500;

const FALLBACK_TASKS = [
  { id: 1, name: 'Add OAuth authentication',           cost: 420, mode: 'Advanced AI',      priority: 'Critical' },
  { id: 2, name: 'Investigate login error',             cost: 260, mode: 'Advanced AI',      priority: 'High'     },
  { id: 3, name: 'Write automated tests',               cost: 120, mode: 'Lightweight AI',   priority: 'Medium'   },
  { id: 4, name: 'Update API documentation',            cost: 80,  mode: 'Lightweight AI',   priority: 'Low'      },
  { id: 5, name: 'Refactor session handling',           cost: 180, mode: 'Balanced AI',      priority: 'Medium'   },
  { id: 6, name: 'Add rate limiting to auth endpoints', cost: 150, mode: 'Balanced AI',      priority: 'Medium'   },
];

function planFor(tasks, budget) {
  let cum = 0;
  let cutoff = false;
  return tasks.map((t) => {
    if (!cutoff && cum + t.cost <= budget) {
      cum += t.cost;
      return { ...t, fits: true };
    }
    cutoff = true;
    return { ...t, fits: false };
  });
}

module.exports = { SCENARIOS, RESET_MILESTONE, FALLBACK_TASKS, planFor };
