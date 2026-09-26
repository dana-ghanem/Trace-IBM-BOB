// Handles: POST /api/trace, /api/trace/stage-complete
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const TRACE_STAGES = [
  { name: 'Diagnose',        logs: ['Scanning auth flow…', 'Inspecting auth/middleware.js', 'Checking token propagation'], result: 'Token is validated but never attached to the request context.' },
  { name: 'Find root cause', logs: ['Tracing context handoff', 'Comparing middleware order'],                               result: 'Root cause: middleware returns before setting req.user.' },
  { name: 'Minimal fix',     logs: ['Patching auth/middleware.js'],                                                         result: '1 file changed · 3 lines added', cost: 160 },
  { name: 'Verify',          logs: ['Running auth test suite'],                                                             result: '3 / 3 tests passing' },
];

module.exports = function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const url = req.url.replace(/\?.*$/, '');

  // POST /api/trace/stage-complete
  if (url.endsWith('/stage-complete')) {
    const { stageIndex, budget = 0 } = req.body || {};
    if (typeof stageIndex !== 'number' || stageIndex < 0 || stageIndex >= TRACE_STAGES.length)
      return res.status(400).json({ error: '"stageIndex" must be 0-3' });
    const cost = TRACE_STAGES[stageIndex].cost ?? 0;
    return res.json({ budget: Math.max(0, budget - cost) });
  }

  // POST /api/trace
  res.json({ stages: TRACE_STAGES, estimate: 160 });
};
