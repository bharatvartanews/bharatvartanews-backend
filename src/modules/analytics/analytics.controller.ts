import { Request, Response } from 'express';
import prisma from '../../database/prisma';

type StatusCountRow = {
  status: string;
  _count: { _all: number };
};

type PathCountRow = {
  path: string;
  _count: { _all: number };
};

/**
 * Article + Video status analytics
 */
export async function contentStats(_: Request, res: Response) {
  const articleStats = await prisma.article.groupBy({
    by: ['status'],
    _count: { _all: true }
  });

  const videoStats = await prisma.video.groupBy({
    by: ['status'],
    _count: { _all: true }
  });

  res.json({
    articles: (articleStats as StatusCountRow[]).map((r) => ({
      status: r.status,
      count: r._count._all
    })),
    videos: (videoStats as StatusCountRow[]).map((r) => ({
      status: r.status,
      count: r._count._all
    }))
  });
}

/**
 * Traffic analytics (page views)
 */
export async function trafficAnalytics(_: Request, res: Response) {
  const views = await prisma.pageView.groupBy({
    by: ['path'],
    _count: { _all: true }
  });

  res.json(
    (views as PathCountRow[]).map((r) => ({
      path: r.path,
      views: r._count._all
    }))
  );
}

/**
 * Track page view
 */
export async function trackPageView(req: Request, res: Response) {
  await prisma.pageView.create({
    data: {
      path: req.body.path,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    }
  });

  res.json({ ok: true });
}

/**
 * Track article view
 */
export async function trackArticleView(req: Request, res: Response) {
  await prisma.articleView.create({
    data: { articleId: Number(req.params.id) }
  });

  res.json({ ok: true });
}

/**
 * Track video view
 */
export async function trackVideoView(req: Request, res: Response) {
  await prisma.videoView.create({
    data: { videoId: Number(req.params.id) }
  });

  res.json({ ok: true });
}
