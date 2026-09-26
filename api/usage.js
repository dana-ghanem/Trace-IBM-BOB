// GET /api/usage
const { SCENARIOS } = require('../lib/data');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();
  const max = SCENARIOS.safe;
  res.json({ budget: max, max, status: 'SAFE' });
};
