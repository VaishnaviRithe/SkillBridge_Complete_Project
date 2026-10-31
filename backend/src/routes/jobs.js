const router = require('express').Router();
const db = require('../config/db');
const { auth, allow } = require('../middleware/auth');

router.get('/', async (req, res, next) => {
  try {
    const { search = '', category = '' } = req.query;
    const term = `%${search}%`;
    const [rows] = await db.execute(
      `SELECT j.*, u.full_name AS client_name
       FROM jobs j JOIN users u ON u.id=j.client_id
       WHERE j.status='open' AND (j.title LIKE ? OR j.description LIKE ? OR j.skills LIKE ?)
       AND (?='' OR j.category=?) ORDER BY j.created_at DESC`,
      [term, term, term, category, category]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/mine', auth, allow('client'), async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM jobs WHERE client_id=? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/', auth, allow('client'), async (req, res, next) => {
  try {
    const { title, description, category, skills = '', budget, duration = '' } = req.body;
    if (!title || !description || !category || !Number.isFinite(Number(budget)) || Number(budget) <= 0)
      return res.status(400).json({ message: 'Complete all required fields and enter a valid budget.' });
    const [r] = await db.execute(
      'INSERT INTO jobs (client_id,title,description,category,skills,budget,duration) VALUES (?,?,?,?,?,?,?)',
      [req.user.id, title, description, category, skills, Number(budget), duration]
    );
    res.status(201).json({ id: r.insertId, message: 'Job posted successfully.' });
  } catch (e) { next(e); }
});

router.put('/:id', auth, allow('client'), async (req, res, next) => {
  try {
    const { title, description, category, skills = '', budget, duration = '', status = 'open' } = req.body;
    const [r] = await db.execute(
      'UPDATE jobs SET title=?,description=?,category=?,skills=?,budget=?,duration=?,status=? WHERE id=? AND client_id=?',
      [title, description, category, skills, Number(budget), duration, status === 'closed' ? 'closed' : 'open', req.params.id, req.user.id]
    );
    if (!r.affectedRows) return res.status(404).json({ message: 'Job not found.' });
    res.json({ message: 'Job updated.' });
  } catch (e) { next(e); }
});

router.delete('/:id', auth, allow('client'), async (req, res, next) => {
  try {
    const [r] = await db.execute('DELETE FROM jobs WHERE id=? AND client_id=?', [req.params.id, req.user.id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Job not found.' });
    res.json({ message: 'Job deleted.' });
  } catch (e) { next(e); }
});

module.exports = router;
