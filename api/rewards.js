// Handles: GET /api/rewards, POST /api/rewards/quiz, /api/rewards/reset
const { SCENARIOS, RESET_MILESTONE } = require('../lib/data');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = req.url.replace(/\?.*$/, '');

  // GET /api/rewards
  if (req.method === 'GET') {
    return res.json({
      points: 2460, resets: 1, streak: 7,
      nextMilestone: RESET_MILESTONE,
      pointsToNextMilestone: RESET_MILESTONE - (2460 % RESET_MILESTONE),
    });
  }

  if (req.method !== 'POST') return res.status(405).end();

  // POST /api/rewards/quiz
  if (url.endsWith('/quiz')) {
    const { correct, points = 0, resets = 0 } = req.body || {};
    if (typeof correct !== 'boolean')
      return res.status(400).json({ error: '"correct" must be a boolean' });
    if (!correct)
      return res.json({ correct: false, pointsAwarded: 0, points, milestonesCrossed: 0, resets });
    const newPoints = points + 50;
    const milestonesCrossed = Math.floor(newPoints / RESET_MILESTONE) - Math.floor(points / RESET_MILESTONE);
    return res.json({ correct: true, pointsAwarded: 50, points: newPoints, milestonesCrossed, resets: resets + milestonesCrossed });
  }

  // POST /api/rewards/reset
  if (url.endsWith('/reset')) {
    const { resets = 0, scenario = 'safe' } = req.body || {};
    if (resets <= 0) return res.status(400).json({ error: 'No Usage Limit Resets available' });
    return res.json({ budget: SCENARIOS[scenario] ?? SCENARIOS.safe, resetsRemaining: resets - 1 });
  }

  res.status(404).json({ error: 'Not found' });
};
