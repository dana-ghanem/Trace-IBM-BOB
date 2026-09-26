// All calls use relative /api/ paths — works on Vercel and locally via Vite proxy
const BASE = '/api';

const TASKS_MOCK = [
  { id: 1, name: 'Add OAuth authentication',           cost: 420, mode: 'Advanced AI',     priority: 'Critical' },
  { id: 2, name: 'Investigate login error',             cost: 260, mode: 'Advanced AI',     priority: 'High'     },
  { id: 3, name: 'Write automated tests',               cost: 120, mode: 'Lightweight AI',  priority: 'Medium'   },
  { id: 4, name: 'Update API documentation',            cost: 80,  mode: 'Lightweight AI',  priority: 'Low'      },
  { id: 5, name: 'Refactor session handling',           cost: 180, mode: 'Balanced AI',     priority: 'Medium'   },
  { id: 6, name: 'Add rate limiting to auth endpoints', cost: 150, mode: 'Balanced AI',     priority: 'Medium'   },
];

const SCENARIOS_MOCK = { safe: 1240, low: 950, critical: 180, exhausted: 0 };
const RESET_MILESTONE = 2500;

// Read persisted state from localStorage
function getLocalBudget() {
  try { return JSON.parse(localStorage.getItem('ai-fuel-budget') || 'null'); } catch { return null; }
}
function getLocalRewards() {
  try { return JSON.parse(localStorage.getItem('ai-fuel-rewards') || 'null'); } catch { return null; }
}

function budgetStatus(budget, max) {
  const r = max > 0 ? budget / max : 0;
  if (r > 0.5) return 'SAFE';
  if (r > 0.2) return 'WARNING';
  return 'CRITICAL';
}

function planFor(budget) {
  let cum = 0, cutoff = false;
  return TASKS_MOCK.map(t => {
    if (!cutoff && cum + t.cost <= budget) { cum += t.cost; return { ...t, fits: true }; }
    cutoff = true;
    return { ...t, fits: false };
  });
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw Object.assign(new Error(err.error || `HTTP ${res.status}`), { status: res.status, body: err });
  }
  return res.json();
}

// GET /api/usage
export async function getUsage() {
  try {
    return await apiFetch('/usage');
  } catch {
    const saved = getLocalBudget();
    const budget = saved?.budget ?? 1240;
    const max = saved?.max ?? 1240;
    return { budget, max, status: budgetStatus(budget, max) };
  }
}

// POST /api/task  — pass current budget so server can compute plan
export async function postTask(requestText) {
  const saved = getLocalBudget();
  const budget = saved?.budget ?? 1240;
  try {
    return await apiFetch('/task', { method: 'POST', body: JSON.stringify({ request: requestText, budget }) });
  } catch {
    const plan = planFor(budget);
    const fitCount = plan.filter(t => t.fits).length;
    return {
      tasks: TASKS_MOCK,
      totalCost: TASKS_MOCK.reduce((s, t) => s + t.cost, 0),
      plan,
      fitCount,
      canFinishAll: fitCount === TASKS_MOCK.length,
      budget,
    };
  }
}

// POST /api/task/start
export async function postTaskStart() {
  try {
    return await apiFetch('/task/start', { method: 'POST', body: '{}' });
  } catch {
    return { started: true };
  }
}

// POST /api/task/progress
export async function postTaskProgress(step) {
  try {
    return await apiFetch('/task/progress', { method: 'POST', body: JSON.stringify({ step }) });
  } catch {
    if (step === 2) {
      return {
        step: 2,
        error: {
          message: '401 Unauthorized after OAuth callback',
          where: 'auth/middleware.js',
          why: 'The validated token is not reaching the authentication context.',
        },
      };
    }
    return { step, error: null };
  }
}

// POST /api/impact
export async function postImpact() {
  try {
    return await apiFetch('/impact', { method: 'POST', body: '{}' });
  } catch {
    return {
      proposedChange: 'Pass the validated token into the authentication context.',
      affected: ['Authentication middleware', 'OAuth callback', 'Protected routes', 'Authentication tests'],
    };
  }
}

// POST /api/impact/apply — pass current budget so server can deduct
export async function postImpactApply() {
  const saved = getLocalBudget();
  const budget = saved?.budget ?? 0;
  try {
    return await apiFetch('/impact/apply', { method: 'POST', body: JSON.stringify({ budget }) });
  } catch {
    const newBudget = Math.max(0, budget - 320);
    return { budget: newBudget, critical: newBudget < 300 };
  }
}

// POST /api/task/finish
export async function postTaskFinish(plan) {
  const saved = getLocalBudget();
  const budget = saved?.budget ?? 0;
  try {
    return await apiFetch('/task/finish', { method: 'POST', body: JSON.stringify({ plan, budget }) });
  } catch {
    const completed = (plan || []).filter(t => t.fits).length;
    return { tasksCompleted: completed, tasksTotal: TASKS_MOCK.length, budgetRemaining: budget };
  }
}

// POST /api/trace
export async function postTrace() {
  try {
    return await apiFetch('/trace', { method: 'POST', body: '{}' });
  } catch {
    return {
      stages: [
        { name: 'Diagnose',        logs: ['Scanning auth flow…', 'Inspecting auth/middleware.js', 'Checking token propagation'], result: 'Token is validated but never attached to the request context.' },
        { name: 'Find root cause', logs: ['Tracing context handoff', 'Comparing middleware order'],                               result: 'Root cause: middleware returns before setting req.user.' },
        { name: 'Minimal fix',     logs: ['Patching auth/middleware.js'],                                                         result: '1 file changed · 3 lines added', cost: 160 },
        { name: 'Verify',          logs: ['Running auth test suite'],                                                             result: '3 / 3 tests passing' },
      ],
      estimate: 160,
    };
  }
}

// POST /api/trace/stage-complete — pass current budget
export async function postTraceStageComplete(stageIndex) {
  const saved = getLocalBudget();
  const budget = saved?.budget ?? 0;
  try {
    return await apiFetch('/trace/stage-complete', { method: 'POST', body: JSON.stringify({ stageIndex, budget }) });
  } catch {
    const cost = stageIndex === 2 ? 160 : 0;
    return { budget: Math.max(0, budget - cost) };
  }
}

// GET /api/rewards
export async function getRewards() {
  try {
    return await apiFetch('/rewards');
  } catch {
    const saved = getLocalRewards();
    const points = saved?.points ?? 2460;
    const resets = saved?.resets ?? 1;
    const next = Math.ceil((points + 1) / RESET_MILESTONE) * RESET_MILESTONE;
    return { points, resets, streak: saved?.streak ?? 7, nextMilestone: next, pointsToNextMilestone: next - points };
  }
}

// POST /api/rewards/quiz — pass current points/resets so server can compute new values
export async function postRewardsQuiz(correct) {
  const saved = getLocalRewards();
  const points = saved?.points ?? 0;
  const resets = saved?.resets ?? 0;
  try {
    return await apiFetch('/rewards/quiz', { method: 'POST', body: JSON.stringify({ correct, points, resets }) });
  } catch {
    if (!correct) return { correct: false, pointsAwarded: 0, points, milestonesCrossed: 0, resets };
    const newPoints = points + 50;
    const milestonesCrossed = Math.floor(newPoints / RESET_MILESTONE) - Math.floor(points / RESET_MILESTONE);
    return { correct: true, pointsAwarded: 50, points: newPoints, milestonesCrossed, resets: resets + milestonesCrossed };
  }
}

// POST /api/rewards/reset — pass resets count and scenario
export async function postRewardsReset() {
  const saved = getLocalBudget();
  const savedR = getLocalRewards();
  const resets = savedR?.resets ?? 0;
  const scenario = saved?.scenario ?? 'safe';
  if (resets <= 0) throw Object.assign(new Error('No Usage Limit Resets available'), { status: 400 });
  try {
    return await apiFetch('/rewards/reset', { method: 'POST', body: JSON.stringify({ resets, scenario }) });
  } catch {
    const newBudget = SCENARIOS_MOCK[scenario] ?? 1240;
    return { budget: newBudget, resetsRemaining: resets - 1 };
  }
}

// POST /api/demo/scenario
export async function postDemoScenario(scenario) {
  try {
    return await apiFetch('/demo/scenario', { method: 'POST', body: JSON.stringify({ scenario }) });
  } catch {
    return { budget: SCENARIOS_MOCK[scenario] ?? 1240, scenario };
  }
}
