require('dotenv').config();
const express = require('express');

const analyzeRouter = require('./routes/analyze');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.use('/api/analyze', analyzeRouter);
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use(errorHandler);

// On Vercel the platform imports this app as a serverless function handler,
// so it must NOT call app.listen(). Locally, run `node local.js` instead,
// which imports this app and starts a real server.
module.exports = app;
