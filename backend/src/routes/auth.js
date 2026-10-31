const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { auth } = require('../middleware/auth');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

router.post('/register', [
  body('fullName').trim().isLength({ min: 2, max: 120 }).withMessage('Enter your full name.'),
  body('email').isEmail().normalizeEmail().withMessage('Enter a valid email.'),
  body('password').isLength({ min: 6 }).withMessage('Password must contain at least 6 characters.'),
  body('role').isIn(['freelancer','client']).withMessage('Choose Freelancer or Client.')
], validate, async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ message: 'An account with this email already exists.' });
    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.execute(
      'INSERT INTO users (full_name,email,password_hash,role) VALUES (?,?,?,?)',
      [fullName, email, hash, role]
    );
    const user = { id: result.insertId, fullName, email, role };
    const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (e) { next(e); }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Enter a valid email.'),
  body('password').notEmpty().withMessage('Enter your password.')
], validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const u = rows[0];
    const user = { id: u.id, fullName: u.full_name, email: u.email, role: u.role, bio: u.bio, skills: u.skills };
    const token = jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (e) { next(e); }
});

router.get('/me', auth, async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT id,full_name AS fullName,email,role,bio,skills FROM users WHERE id=?', [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: rows[0] });
  } catch (e) { next(e); }
});

module.exports = router;
