// GET /api/rewards
const { RESET_MILESTONE } = require('../../lib/data');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  // Initial state — client tracks points/resets in localStorage
  res.json({
    points: 2460,
    resets: 1,
    streak: 7,
    nextMilestone: RESET_MILESTONE,
    pointsToNextMilestone: RESET_MILESTONE - (2460 % RESET_MILESTONE),
  });
};
