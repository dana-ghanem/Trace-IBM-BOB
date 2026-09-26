const express = require('express');
const router = express.Router();
const { state, SCENARIOS, RESET_MILESTONE } = require('../data');

// GET /rewards
router.get('/', (req, res) => {
  res.json({
    points: state.points,
    resets: state.resets,
    streak: 7,
    nextMilestone: RESET_MILESTONE,
    pointsToNextMilestone: RESET_MILESTONE - (state.points % RESET_MILESTONE),
  });
});

// POST /rewards/quiz
router.post('/quiz', (req, res) => {
  const { correct } = req.body || {};
  if (typeof correct !== 'boolean') {
    return res.status(400).json({ error: '"correct" must be a boolean' });
  }

  if (!correct) {
    return res.json({
      correct: false,
      pointsAwarded: 0,
      points: state.points,
      milestonesCrossed: 0,
      resets: state.resets,
    });
  }

  const before = state.points;
  state.points += 50;
  const after = state.points;

  // Count how many multiples of RESET_MILESTONE were crossed
  const milestonesCrossed =
    Math.floor(after / RESET_MILESTONE) - Math.floor(before / RESET_MILESTONE);
  state.resets += milestonesCrossed;

  res.json({
    correct: true,
    pointsAwarded: 50,
    points: state.points,
    milestonesCrossed,
    resets: state.resets,
  });
});

// POST /rewards/reset
router.post('/reset', (req, res) => {
  if (state.resets <= 0) {
    return res.status(400).json({ error: 'No Usage Limit Resets available' });
  }
  state.budget = SCENARIOS[state.scenario];
  state.resets -= 1;
  res.json({ budget: state.budget, resetsRemaining: state.resets });
});

module.exports = router;
