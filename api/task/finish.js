// POST /api/task/finish
module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { plan, budget } = req.body || {};
  if (!Array.isArray(plan)) {
    return res.status(400).json({ error: '"plan" must be an array' });
  }

  const tasksCompleted = plan.filter((t) => t.fits).length;
  res.json({
    tasksCompleted,
    tasksTotal: plan.length,
    budgetRemaining: budget ?? 0,
  });
};
