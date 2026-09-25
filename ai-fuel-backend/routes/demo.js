const express = require('express');
const router = express.Router();
const { state, SCENARIOS } = require('../data');

// POST /demo/scenario
router.post('/scenario', (req, res) => {
  const { scenario } = req.body || {};
  if (!scenario || !Object.prototype.hasOwnProperty.call(SCENARIOS, scenario)) {
    return res
      .status(400)
      .json({ error: `"scenario" must be one of: ${Object.keys(SCENARIOS).join(', ')}` });
  }
  state.scenario = scenario;
  state.budget = SCENARIOS[scenario];
  state.execStep = 0;
  res.json({ budget: state.budget, scenario: state.scenario });
});

module.exports = router;
