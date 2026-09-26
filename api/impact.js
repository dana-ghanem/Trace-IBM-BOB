// Handles: POST /api/impact, /api/impact/apply
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const url = req.url.replace(/\?.*$/, '');

  // POST /api/impact/apply
  if (url.endsWith('/apply')) {
    const { budget = 0 } = req.body || {};
    const newBudget = Math.max(0, budget - 320);
    return res.json({ budget: newBudget, critical: newBudget < 300 });
  }

  // POST /api/impact
  res.json({
    proposedChange: 'Pass the validated token into the authentication context.',
    affected: ['Authentication middleware', 'OAuth callback', 'Protected routes', 'Authentication tests'],
  });
};
