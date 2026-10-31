const router = require('express').Router();
const db = require('../config/db');
const { auth, allow } = require('../middleware/auth');

router.get('/mine', auth, allow('freelancer'), async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT a.*, j.title AS job_title, j.category, u.full_name AS client_name
       FROM applications a JOIN jobs j ON j.id=a.job_id JOIN users u ON u.id=j.client_id
       WHERE a.freelancer_id=? ORDER BY a.created_at DESC`, [req.user.id]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/', auth, allow('freelancer'), async (req, res, next) => {
  try {
    const { jobId, bidAmount, proposal = '' } = req.body;
    if (!jobId || !Number.isFinite(Number(bidAmount)) || Number(bidAmount) <= 0)
      return res.status(400).json({ message: 'Enter a valid bid amount.' });
    const [jobs] = await db.execute("SELECT id FROM jobs WHERE id=? AND status='open'", [jobId]);
    if (!jobs.length) return res.status(404).json({ message: 'This job is no longer available.' });
    await db.execute(
      'INSERT INTO applications (job_id,freelancer_id,bid_amount,proposal) VALUES (?,?,?,?)',
      [jobId, req.user.id, Number(bidAmount), proposal]
    );
    res.status(201).json({ message: 'Application submitted.' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'You have already applied for this job.' });
    next(e);
  }
});

router.get('/job/:jobId', auth, allow('client'), async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT a.*, u.full_name AS freelancer_name, u.email AS freelancer_email
       FROM applications a JOIN users u ON u.id=a.freelancer_id
       JOIN jobs j ON j.id=a.job_id WHERE a.job_id=? AND j.client_id=? ORDER BY a.created_at DESC`,
      [req.params.jobId, req.user.id]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

router.patch('/:id/status', auth, allow('client'), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['accepted','rejected','pending'].includes(status)) return res.status(400).json({ message: 'Invalid status.' });
    const [r] = await db.execute(
      `UPDATE applications a JOIN jobs j ON j.id=a.job_id
       SET a.status=? WHERE a.id=? AND j.client_id=?`,
      [status, req.params.id, req.user.id]
    );
    if (!r.affectedRows) return res.status(404).json({ message: 'Application not found.' });
    res.json({ message: `Application ${status}.` });
  } catch (e) { next(e); }
});

module.exports = router;
