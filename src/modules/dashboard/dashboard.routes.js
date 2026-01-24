import { Router } from 'express';
import { getDb } from '../../database/init.js';

const router = Router();

router.get('/summary', async (req, res) => {
  const articles = await getDb().get(
    'SELECT COUNT(*) as c FROM articles'
  );

  const videos = await getDb().get(
    'SELECT COUNT(*) as c FROM videos'
  );

  const pending = await getDb().get(
    `SELECT COUNT(*) as c
     FROM articles
     WHERE status != 'PUBLISHED'`
  );

  res.json({
    articles: articles.c,
    videos: videos.c,
    pending: pending.c
  });
});

export default router;
