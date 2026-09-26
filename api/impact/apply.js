// POST /api/impact/apply
// Budget deduction is handled client-side; server just confirms
module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { budget = 0 } = req.body || {};
  const newBudget = Math.max(0, budget - 320);
  res.json({ budget: newBudget, critical: newBudget < 300 });
};
