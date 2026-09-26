// POST /api/demo/scenario
const { SCENARIOS } = require('../lib/data');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { scenario } = req.body || {};
  if (!scenario || !Object.prototype.hasOwnProperty.call(SCENARIOS, scenario))
    return res.status(400).json({ error: `"scenario" must be one of: ${Object.keys(SCENARIOS).join(', ')}` });

  res.json({ budget: SCENARIOS[scenario], scenario });
};
