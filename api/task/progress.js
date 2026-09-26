// POST /api/task/progress
module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { step } = req.body || {};
  if (typeof step !== 'number' || step < 0 || step > 4) {
    return res.status(400).json({ error: '"step" must be a number 0-4' });
  }

  // Step 2 always surfaces the demo error
  if (step === 2) {
    return res.json({
      step: 2,
      error: {
        message: '401 Unauthorized after OAuth callback',
        where: 'auth/middleware.js',
        why: 'The validated token is not reaching the authentication context.',
      },
    });
  }

  res.json({ step, error: null });
};
