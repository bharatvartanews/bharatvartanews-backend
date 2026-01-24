import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../../database/init.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bharat-varta-dev-secret';
router.post('/login', async (req, res) => {
  const { username } = req.body;

  const user = await getDb().get(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );

  if (!user) return res.sendStatus(401);

  const payload = { id: user.id, role: user.role };

  res.json({
    accessToken: jwt.sign(payload, JWT_SECRET, {
      expiresIn: process.env.ACCESS_TTL || 900
    }),
    refreshToken: jwt.sign(payload, JWT_SECRET, {
      expiresIn: process.env.REFRESH_TTL || 604800
    })
  });
});


export default router;
