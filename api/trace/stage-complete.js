// POST /api/trace/stage-complete
// Budget deduction passed from client
const STAGE_COSTS = [0, 0, 160, 0]; // only stage 2 (Minimal fix) costs credits

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { stageIndex, budget = 0 } = req.body || {};
  if (typeof stageIndex !== 'number' || stageIndex < 0 || stageIndex > 3) {
    return res.status(400).json({ error: '"stageIndex" must be 0-3' });
  }

  const cost = STAGE_COSTS[stageIndex] ?? 0;
  const newBudget = Math.max(0, budget - cost);
  res.json({ budget: newBudget });
};
