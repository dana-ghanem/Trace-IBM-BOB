const BASE = 'http://localhost:3001';

const TASKS_MOCK = [
  { id: 1, name: 'Add OAuth authentication',           cost: 420, mode: 'Advanced AI',     priority: 'Critical' },
  { id: 2, name: 'Investigate login error',             cost: 260, mode: 'Advanced AI',     priority: 'High'     },
  { id: 3, name: 'Write automated tests',               cost: 120, mode: 'Lightweight AI',  priority: 'Medium'   },
  { id: 4, name: 'Update API documentation',            cost: 80,  mode: 'Lightweight AI',  priority: 'Low'      },
  { id: 5, name: 'Refactor session handling',           cost: 180, mode: 'Balanced AI',     priority: 'Medium'   },
  { id: 6, name: 'Add rate limiting to auth endpoints', cost: 150, mode: 'Balanced AI',     priority: 'Medium'   },
];

const SCENARIOS_MOCK = { safe: 1240, low: 950, critical: 180, exhausted: 0 };
let mockState = { budget: 1240, scenario: 'safe', points: 2460, resets: 1, streak: 7 };

function budgetStatus(budget, max) {
  const r = budget / max;
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

// GET /usage
export async function getUsage() {
  try {
    return await apiFetch('/usage');
  } catch {
    const max = SCENARIOS_MOCK[mockState.scenario] || 1240;
    return { budget: mockState.budget, max, status: budgetStatus(mockState.budget, max) };
  }
}

// POST /task
export async function postTask(requestText) {
  try {
    return await apiFetch('/task', { method: 'POST', body: JSON.stringify({ request: requestText }) });
  } catch {
    const budget = mockState.budget;
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

// POST /task/start
export async function postTaskStart() {
  try {
    return await apiFetch('/task/start', { method: 'POST', body: '{}' });
  } catch {
    return { started: true, plan: planFor(mockState.budget) };
  }
}

// POST /task/progress
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

// POST /impact
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

// POST /impact/apply
export async function postImpactApply() {
  try {
    return await apiFetch('/impact/apply', { method: 'POST', body: '{}' });
  } catch {
    mockState.budget = Math.max(0, mockState.budget - 320);
    return { budget: mockState.budget, critical: mockState.budget < 300 };
  }
}

// POST /task/finish
export async function postTaskFinish(plan) {
  try {
    return await apiFetch('/task/finish', { method: 'POST', body: JSON.stringify({ plan }) });
  } catch {
    const completed = (plan || []).filter(t => t.fits).length;
    return { tasksCompleted: completed, tasksTotal: TASKS_MOCK.length, budgetRemaining: mockState.budget };
  }
}

// POST /trace
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

// POST /trace/stage-complete
export async function postTraceStageComplete(stageIndex) {
  try {
    return await apiFetch('/trace/stage-complete', { method: 'POST', body: JSON.stringify({ stageIndex }) });
  } catch {
    if (stageIndex === 2) {
      mockState.budget = Math.max(0, mockState.budget - 160);
    }
    return { budget: mockState.budget };
  }
}

// GET /rewards
export async function getRewards() {
  try {
    return await apiFetch('/rewards');
  } catch {
    const next = Math.ceil(mockState.points / 2500) * 2500;
    return {
      points: mockState.points,
      resets: mockState.resets,
      streak: mockState.streak,
      nextMilestone: next,
      pointsToNextMilestone: next - mockState.points,
    };
  }
}

// POST /rewards/quiz
export async function postRewardsQuiz(correct) {
  try {
    return await apiFetch('/rewards/quiz', { method: 'POST', body: JSON.stringify({ correct }) });
  } catch {
    if (!correct) {
      return { correct: false, pointsAwarded: 0, points: mockState.points, milestonesCrossed: 0, resets: mockState.resets };
    }
    const before = mockState.points;
    mockState.points += 50;
    const milestonesBefore = Math.floor(before / 2500);
    const milestonesAfter  = Math.floor(mockState.points / 2500);
    const milestonesCrossed = milestonesAfter - milestonesBefore;
    if (milestonesCrossed > 0) mockState.resets += milestonesCrossed;
    return { correct: true, pointsAwarded: 50, points: mockState.points, milestonesCrossed, resets: mockState.resets };
  }
}

// POST /rewards/reset
export async function postRewardsReset() {
  try {
    return await apiFetch('/rewards/reset', { method: 'POST', body: '{}' });
  } catch {
    if (mockState.resets <= 0) throw Object.assign(new Error('No Usage Limit Resets available'), { status: 400 });
    mockState.resets -= 1;
    mockState.budget = SCENARIOS_MOCK[mockState.scenario] || 1240;
    return { budget: mockState.budget, resetsRemaining: mockState.resets };
  }
}

// POST /demo/scenario
export async function postDemoScenario(scenario) {
  try {
    return await apiFetch('/demo/scenario', { method: 'POST', body: JSON.stringify({ scenario }) });
  } catch {
    mockState.scenario = scenario;
    mockState.budget = SCENARIOS_MOCK[scenario] ?? 1240;
    return { budget: mockState.budget, scenario };
  }
}
