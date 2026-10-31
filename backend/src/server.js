require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (req,res) => {
  try { await db.query('SELECT 1'); res.json({status:'ok',database:'connected'}); }
  catch { res.status(503).json({status:'error',database:'unavailable'}); }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/services', require('./routes/services'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/users', require('./routes/users'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server. Check the backend terminal for details.' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`SkillBridge API running at http://localhost:${port}`));
