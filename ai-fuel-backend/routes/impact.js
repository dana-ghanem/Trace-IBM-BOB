const express = require('express');
const router = express.Router();
const { state } = require('../data');

// POST /impact
router.post('/', (req, res) => {
  res.json({
    proposedChange: 'Pass the validated token into the authentication context.',
    affected: [
      'Authentication middleware',
      'OAuth callback',
      'Protected routes',
      'Authentication tests',
    ],
  });
});

// POST /impact/apply
router.post('/apply', (req, res) => {
  state.budget = Math.max(0, state.budget - 320);
  res.json({
    budget: state.budget,
    critical: state.budget < 300,
  });
});

module.exports = router;
