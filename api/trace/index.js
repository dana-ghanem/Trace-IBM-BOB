// POST /api/trace
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

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();
  res.json({ stages: TRACE_STAGES, estimate: 160 });
};
