const router = require('express').Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

router.get('/user/:userId', async (req,res,next) => {
  try {
    const [rows] = await db.execute(
      `SELECT r.*,u.full_name AS reviewer_name FROM reviews r
       JOIN users u ON u.id=r.reviewer_id WHERE r.reviewee_id=? ORDER BY r.created_at DESC`,[req.params.userId]
    );
    res.json(rows);
  } catch(e){next(e);}
});

router.post('/', auth, async (req,res,next) => {
  try {
    const { applicationId, rating, comment='' } = req.body;
    if (!applicationId || !Number.isInteger(Number(rating)) || Number(rating)<1 || Number(rating)>5)
      return res.status(400).json({message:'Choose a rating from 1 to 5.'});
    const [rows] = await db.execute(
      `SELECT a.*,j.client_id FROM applications a JOIN jobs j ON j.id=a.job_id
       WHERE a.id=? AND a.status='accepted'`,[applicationId]
    );
    if (!rows.length) return res.status(400).json({message:'Only accepted applications can be reviewed.'});
    const a=rows[0];
    let revieweeId;
    if (Number(req.user.id)===Number(a.client_id)) revieweeId=a.freelancer_id;
    else if (Number(req.user.id)===Number(a.freelancer_id)) revieweeId=a.client_id;
    else return res.status(403).json({message:'You are not part of this project.'});
    await db.execute(
      'INSERT INTO reviews (application_id,reviewer_id,reviewee_id,rating,comment) VALUES (?,?,?,?,?)',
      [applicationId,req.user.id,revieweeId,Number(rating),comment]
    );
    res.status(201).json({message:'Review submitted.'});
  } catch(e){
    if(e.code==='ER_DUP_ENTRY') return res.status(409).json({message:'A review has already been submitted for this application.'});
    next(e);
  }
});

module.exports = router;
