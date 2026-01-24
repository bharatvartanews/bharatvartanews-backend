import { Router } from 'express';
import { getDb } from '../../database/init.js';

const router = Router();

/**
 * Track analytics event
 */
router.post('/event', async (req, res) => {
  const { entityType, entityId, event } = req.body;

  await getDb().run(
    `INSERT INTO analytics
     (entityType, entityId, event, at)
     VALUES (?, ?, ?, ?)`,
    [entityType, entityId, event, new Date().toISOString()]
  );

  res.sendStatus(201);
});

/**
 * Top content
 */
router.get('/top', async (req, res) => {
  const result = await getDb().all(
    `SELECT entityType, entityId, COUNT(*) as count
     FROM analytics
     GROUP BY entityType, entityId
     ORDER BY count DESC
     LIMIT 10`
  );

  res.json(result);
});

export default router;
