import { Router } from 'express';
import { getDb } from '../../database/init.js';
import { requireRole } from '../../middlewares/role.middleware.js';

const router = Router();

/**
 * Create video – DRAFT
 */
router.post(
  '/',
  requireRole('REPORTER', 'ADMIN', 'SUPER_ADMIN'),
  async (req, res) => {
    const { title, url } = req.body;

    await getDb().run(
      `INSERT INTO videos
       (title, url, status, createdAt)
       VALUES (?, ?, 'DRAFT', ?)`,
      [title, url, new Date().toISOString()]
    );

    res.sendStatus(201);
  }
);

/**
 * List videos
 */
router.get('/', async (req, res) => {
  const videos = await getDb().all(
    'SELECT * FROM videos ORDER BY createdAt DESC'
  );
  res.json(videos);
});

export default router;
