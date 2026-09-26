// POST /api/task
const { FALLBACK_TASKS, planFor } = require('../../lib/data');
const { analyzeRequest } = require('../../lib/watsonx');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { request, budget = 1240 } = req.body || {};
  if (!request || typeof request !== 'string') {
    return res.status(400).json({ error: 'Body must contain a "request" string' });
  }

  let tasks;
  try {
    const raw = await analyzeRequest(request);
    tasks = raw.slice(0, 6).map((t, i) => ({ ...t, id: i + 1 }));
  } catch (err) {
    console.warn('[watsonx] Falling back to FALLBACK_TASKS:', err.message);
    tasks = FALLBACK_TASKS;
  }

  const totalCost = tasks.reduce((sum, t) => sum + t.cost, 0);
  const plan = planFor(tasks, budget);
  const fitCount = plan.filter((t) => t.fits).length;

  res.json({
    tasks,
    totalCost,
    plan,
    fitCount,
    canFinishAll: fitCount === tasks.length,
    budget,
  });
};
