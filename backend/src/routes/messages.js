const router = require('express').Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

router.get('/contacts', auth, async (req,res,next) => {
  try {
    const [rows] = await db.execute(
      `SELECT DISTINCT u.id,u.full_name AS fullName,u.role
       FROM users u WHERE u.id IN (
         SELECT receiver_id FROM messages WHERE sender_id=?
         UNION SELECT sender_id FROM messages WHERE receiver_id=?
       ) ORDER BY u.full_name`, [req.user.id,req.user.id]
    );
    res.json(rows);
  } catch(e){next(e);}
});

router.get('/:userId', auth, async (req,res,next) => {
  try {
    const [rows] = await db.execute(
      `SELECT m.*,s.full_name AS sender_name FROM messages m
       JOIN users s ON s.id=m.sender_id
       WHERE (m.sender_id=? AND m.receiver_id=?) OR (m.sender_id=? AND m.receiver_id=?)
       ORDER BY m.created_at`, [req.user.id,req.params.userId,req.params.userId,req.user.id]
    );
    res.json(rows);
  } catch(e){next(e);}
});

router.post('/', auth, async (req,res,next) => {
  try {
    const { receiverId, body } = req.body;
    if (!receiverId || !body || !String(body).trim()) return res.status(400).json({message:'Message cannot be empty.'});
    if (Number(receiverId) === Number(req.user.id)) return res.status(400).json({message:'You cannot message yourself.'});
    const [users] = await db.execute('SELECT id FROM users WHERE id=?',[receiverId]);
    if (!users.length) return res.status(404).json({message:'User not found.'});
    const [r] = await db.execute('INSERT INTO messages (sender_id,receiver_id,body) VALUES (?,?,?)',[req.user.id,receiverId,String(body).trim()]);
    res.status(201).json({id:r.insertId,message:'Message sent.'});
  } catch(e){next(e);}
});

module.exports = router;
