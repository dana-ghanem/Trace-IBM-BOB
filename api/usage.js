// GET /api/usage?budget=1240
const { SCENARIOS } = require('../lib/data');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const max = SCENARIOS.safe; // 1240 — always the full budget ceiling
  // Frontend passes current budget as query param so we can compute status
  const budget = req.query.budget !== undefined
    ? Math.max(0, parseInt(req.query.budget, 10) || max)
    : max;

  const ratio = budget / max;
  const status = ratio > 0.5 ? 'SAFE' : ratio > 0.2 ? 'WARNING' : 'CRITICAL';

  res.json({ budget, max, status });
};
