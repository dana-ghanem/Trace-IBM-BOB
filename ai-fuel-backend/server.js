require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/usage',   require('./routes/usage'));
app.use('/task',    require('./routes/task'));
app.use('/impact',  require('./routes/impact'));
app.use('/trace',   require('./routes/trace'));
app.use('/rewards', require('./routes/rewards'));
app.use('/demo',    require('./routes/demo'));

// ─── 404 catch-all ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`AI Fuel backend running on http://localhost:${PORT}`);
});
