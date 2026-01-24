import { Router } from 'express';
import { getDb } from '../../database/init.js';
import { requireRole } from '../../middlewares/role.middleware.js';

const router = Router();

/**
 * Create article – DRAFT
 */
router.post(
  '/',
  requireRole('REPORTER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'),
  async (req, res) => {
    const { title, body } = req.body;

    await getDb().run(
      `INSERT INTO articles
       (title, body, status, authorRole, createdAt)
       VALUES (?, ?, 'DRAFT', ?, ?)`,
      [title, body, req.user.role, new Date().toISOString()]
    );

    res.sendStatus(201);
  }
);

/**
 * Review article
 */
router.post(
  '/:id/review',
  requireRole('EDITOR'),
  async (req, res) => {
    await getDb().run(
      `UPDATE articles
       SET status='REVIEW', reviewedAt=?
       WHERE id=?`,
      [new Date().toISOString(), req.params.id]
    );

    res.sendStatus(200);
  }
);

/**
 * Approve article
 */
router.post(
  '/:id/approve',
  requireRole('EDITOR'),
  async (req, res) => {
    await getDb().run(
      `UPDATE articles
       SET status='APPROVED', approvedAt=?
       WHERE id=?`,
      [new Date().toISOString(), req.params.id]
    );

    res.sendStatus(200);
  }
);

/**
 * Publish article
 */
router.post(
  '/:id/publish',
  requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req, res) => {
    await getDb().run(
      `UPDATE articles
       SET status='PUBLISHED', publishedAt=?
       WHERE id=?`,
      [new Date().toISOString(), req.params.id]
    );

    res.sendStatus(200);
  }
);

/**
 * List articles
 */
router.get('/', async (req, res) => {
  const articles = await getDb().all(
    'SELECT * FROM articles ORDER BY createdAt DESC'
  );
  res.json(articles);
});

export default router;
