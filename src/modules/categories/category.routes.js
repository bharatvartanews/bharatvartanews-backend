import { Router } from 'express';
import { getDb } from '../../database/init.js';

const router = Router();

// PUBLIC – no auth
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.all('SELECT * FROM categories ORDER BY id');
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

export default router;
