// POST /api/rewards/quiz
const { RESET_MILESTONE } = require('../../lib/data');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { correct, points = 0, resets = 0 } = req.body || {};
  if (typeof correct !== 'boolean') {
    return res.status(400).json({ error: '"correct" must be a boolean' });
  }

  if (!correct) {
    return res.json({ correct: false, pointsAwarded: 0, points, milestonesCrossed: 0, resets });
  }

  const newPoints = points + 50;
  const milestonesCrossed =
    Math.floor(newPoints / RESET_MILESTONE) - Math.floor(points / RESET_MILESTONE);
  const newResets = resets + milestonesCrossed;

  res.json({ correct: true, pointsAwarded: 50, points: newPoints, milestonesCrossed, resets: newResets });
};
