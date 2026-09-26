// POST /api/rewards/reset
const { SCENARIOS } = require('../../lib/data');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { resets = 0, scenario = 'safe' } = req.body || {};
  if (resets <= 0) {
    return res.status(400).json({ error: 'No Usage Limit Resets available' });
  }

  const newBudget = SCENARIOS[scenario] ?? SCENARIOS.safe;
  res.json({ budget: newBudget, resetsRemaining: resets - 1 });
};
