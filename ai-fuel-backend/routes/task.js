const express = require('express');
const router = express.Router();
const { state, FALLBACK_TASKS, planFor } = require('../data');
const { analyzeRequest } = require('../watsonx');

// POST /task
router.post('/', async (req, res) => {
  const { request } = req.body || {};
  if (!request || typeof request !== 'string') {
    return res.status(400).json({ error: 'Body must contain a "request" string' });
  }

  let tasks;
  try {
    const raw = await analyzeRequest(request);
    // Assign sequential ids 1-6 regardless of what the model returned
    tasks = raw.slice(0, 6).map((t, i) => ({ ...t, id: i + 1 }));
  } catch (err) {
    console.warn('[watsonx] Falling back to FALLBACK_TASKS:', err.message);
    tasks = FALLBACK_TASKS;
  }

  const totalCost = tasks.reduce((sum, t) => sum + t.cost, 0);
  const plan = planFor(tasks, state.budget);
  const fitCount = plan.filter((t) => t.fits).length;

  // Cache the plan for /task/start
  state.lastPlan = plan;

  res.json({
    tasks,
    totalCost,
    plan,
    fitCount,
    canFinishAll: fitCount === tasks.length,
    budget: state.budget,
  });
});

// POST /task/start
router.post('/start', (req, res) => {
  state.execStep = 0;
  res.json({ started: true, plan: state.lastPlan });
});

// POST /task/progress
const PROGRESS_STEPS = [
  'Analyze project',
  'Design authentication',
  'Implement authentication',
  'Run tests',
  'Update documentation',
];

router.post('/progress', (req, res) => {
  const { step } = req.body || {};
  if (typeof step !== 'number' || step < 0 || step > 4) {
    return res.status(400).json({ error: '"step" must be a number 0-4' });
  }

  if (step === 2) {
    return res.json({
      step: 2,
      error: {
        message: '401 Unauthorized after OAuth callback',
        where: 'auth/middleware.js',
        why: 'The validated token is not reaching the authentication context.',
      },
    });
  }

  res.json({ step, error: null });
});

// POST /task/finish
router.post('/finish', (req, res) => {
  const { plan } = req.body || {};
  if (!Array.isArray(plan)) {
    return res.status(400).json({ error: '"plan" must be an array' });
  }
  const tasksCompleted = plan.filter((t) => t.fits).length;
  res.json({
    tasksCompleted,
    tasksTotal: plan.length,
    budgetRemaining: state.budget,
  });
});

module.exports = router;
