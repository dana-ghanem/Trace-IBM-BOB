// Handles: POST /api/task, /api/task/start, /api/task/progress, /api/task/finish
const { FALLBACK_TASKS, planFor } = require('../lib/data');
const { analyzeRequest } = require('../lib/watsonx');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const url = req.url.replace(/\?.*$/, '');

  // POST /api/task/start
  if (url.endsWith('/start')) {
    return res.json({ started: true });
  }

  // POST /api/task/progress
  if (url.endsWith('/progress')) {
    const { step } = req.body || {};
    if (typeof step !== 'number' || step < 0 || step > 4)
      return res.status(400).json({ error: '"step" must be 0-4' });
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
    return res.json({ step, error: null });
  }

  // POST /api/task/finish
  if (url.endsWith('/finish')) {
    const { plan, budget } = req.body || {};
    if (!Array.isArray(plan)) return res.status(400).json({ error: '"plan" must be an array' });
    return res.json({
      tasksCompleted: plan.filter(t => t.fits).length,
      tasksTotal: plan.length,
      budgetRemaining: budget ?? 0,
    });
  }

  // POST /api/task
  const { request, budget = 1240 } = req.body || {};
  if (!request || typeof request !== 'string')
    return res.status(400).json({ error: 'Body must contain a "request" string' });

  let tasks;
  try {
    const raw = await analyzeRequest(request);
    tasks = raw.slice(0, 6).map((t, i) => ({ ...t, id: i + 1 }));
  } catch (err) {
    console.warn('[watsonx] fallback:', err.message);
    tasks = FALLBACK_TASKS;
  }

  const totalCost = tasks.reduce((s, t) => s + t.cost, 0);
  const plan = planFor(tasks, budget);
  const fitCount = plan.filter(t => t.fits).length;

  res.json({ tasks, totalCost, plan, fitCount, canFinishAll: fitCount === tasks.length, budget });
};
