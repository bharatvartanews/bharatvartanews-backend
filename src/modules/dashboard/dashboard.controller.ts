import { Request, Response } from 'express';
import prisma from '../../database/prisma';

export async function overview(_: Request, res: Response) {
  const [
    totalArticles,
    draftArticles,
    reviewArticles,
    publishedArticles,
    totalVideos,
    recentArticles,
    recentVideos
  ] = await Promise.all([
    prisma.article.count({ where: { deletedAt: null } }),
    prisma.article.count({ where: { status: 'DRAFT', deletedAt: null } }),
    prisma.article.count({ where: { status: 'REVIEW', deletedAt: null } }),
    prisma.article.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
    prisma.video.count({ where: { deletedAt: null } }),
    prisma.article.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, status: true, createdAt: true }
    }),
    prisma.video.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, status: true, createdAt: true }
    })
  ]);

  res.json({
    kpis: {
      articles: totalArticles,
      draft: draftArticles,
      review: reviewArticles,
      published: publishedArticles,
      videos: totalVideos
    },
    recent: {
      articles: recentArticles,
      videos: recentVideos
    }
  });
}
