const express = require('express');
const router = express.Router();
const { state, SCENARIOS } = require('../data');

// GET /usage
router.get('/', (req, res) => {
  const max = SCENARIOS[state.scenario];
  let status;
  if (max === 0) {
    status = 'CRITICAL';
  } else {
    const ratio = state.budget / max;
    if (ratio > 0.5) status = 'SAFE';
    else if (ratio > 0.2) status = 'WARNING';
    else status = 'CRITICAL';
  }
  res.json({ budget: state.budget, max, status });
});

module.exports = router;
