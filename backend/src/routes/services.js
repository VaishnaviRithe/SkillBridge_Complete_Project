const router = require('express').Router();
const db = require('../config/db');
const { auth, allow } = require('../middleware/auth');

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT s.*,u.full_name AS freelancer_name FROM services s
       JOIN users u ON u.id=s.freelancer_id ORDER BY s.created_at DESC`
    );
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/mine', auth, allow('freelancer'), async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM services WHERE freelancer_id=? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/', auth, allow('freelancer'), async (req, res, next) => {
  try {
    const { title, description, category, price } = req.body;
    if (!title || !description || !category || !Number.isFinite(Number(price)) || Number(price) <= 0)
      return res.status(400).json({ message: 'Complete all fields and enter a valid price.' });
    const [r] = await db.execute(
      'INSERT INTO services (freelancer_id,title,description,category,price) VALUES (?,?,?,?,?)',
      [req.user.id,title,description,category,Number(price)]
    );
    res.status(201).json({ id:r.insertId, message:'Service created.' });
  } catch (e) { next(e); }
});

router.delete('/:id', auth, allow('freelancer'), async (req,res,next) => {
  try {
    const [r] = await db.execute('DELETE FROM services WHERE id=? AND freelancer_id=?',[req.params.id,req.user.id]);
    if (!r.affectedRows) return res.status(404).json({message:'Service not found.'});
    res.json({message:'Service deleted.'});
  } catch(e){next(e);}
});

module.exports = router;
