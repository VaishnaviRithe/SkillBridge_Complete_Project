const router = require('express').Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

router.put('/profile', auth, async (req,res,next) => {
  try {
    const { fullName, bio='', skills='' } = req.body;
    if (!fullName || String(fullName).trim().length<2) return res.status(400).json({message:'Enter your name.'});
    await db.execute('UPDATE users SET full_name=?,bio=?,skills=? WHERE id=?',[String(fullName).trim(),bio,skills,req.user.id]);
    const [rows]=await db.execute('SELECT id,full_name AS fullName,email,role,bio,skills FROM users WHERE id=?',[req.user.id]);
    res.json({user:rows[0],message:'Profile updated.'});
  } catch(e){next(e);}
});

module.exports = router;
