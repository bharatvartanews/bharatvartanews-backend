import { Router } from 'express';
import { getDb } from '../../database/init.js';

const router = Router();

/**
 * List features
 */
router.get('/', async (req, res) => {
  const features = await getDb().all(
    'SELECT * FROM features'
  );
  res.json(features);
});

/**
 * Enable / disable feature
 */
router.post('/', async (req, res) => {
  const { name, enabled } = req.body;

  await getDb().run(
    `INSERT OR REPLACE INTO features (name, enabled)
     VALUES (?, ?)`,
    [name, enabled ? 1 : 0]
  );

  res.sendStatus(201);
});

export default router;
