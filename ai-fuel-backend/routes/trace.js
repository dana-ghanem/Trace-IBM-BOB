const express = require('express');
const router = express.Router();
const { state } = require('../data');

const TRACE_STAGES = [
  {
    name: 'Diagnose',
    logs: ['Scanning auth flow…', 'Inspecting auth/middleware.js', 'Checking token propagation'],
    result: 'Token is validated but never attached to the request context.',
  },
  {
    name: 'Find root cause',
    logs: ['Tracing context handoff', 'Comparing middleware order'],
    result: 'Root cause: middleware returns before setting req.user.',
  },
  {
    name: 'Minimal fix',
    logs: ['Patching auth/middleware.js'],
    result: '1 file changed · 3 lines added',
    cost: 160,
  },
  {
    name: 'Verify',
    logs: ['Running auth test suite'],
    result: '3 / 3 tests passing',
  },
];

// POST /trace
router.post('/', (req, res) => {
  res.json({ stages: TRACE_STAGES, estimate: 160 });
});

// POST /trace/stage-complete
router.post('/stage-complete', (req, res) => {
  const { stageIndex } = req.body || {};
  if (typeof stageIndex !== 'number' || stageIndex < 0 || stageIndex >= TRACE_STAGES.length) {
    return res.status(400).json({ error: '"stageIndex" must be a valid stage index' });
  }

  const stage = TRACE_STAGES[stageIndex];
  if (typeof stage.cost === 'number') {
    state.budget = Math.max(0, state.budget - stage.cost);
  }

  res.json({ budget: state.budget });
});

module.exports = router;
