import { Request, Response } from 'express';
import prisma from '../../database/prisma';
import { ArticleStatus, VideoStatus } from '@prisma/client';

const APP_URL = process.env.APP_URL || 'http://localhost:8080';

function withAbsoluteIcon(icon: string | null) {
  if (!icon) return null;
  if (icon.startsWith('http')) return icon;
  return `${APP_URL}${icon}`;
}
export async function getHomeData(_: Request, res: Response) {
  try {
    // 1️⃣ Categories – EXACTLY as seeded
  //   const categories = await prisma.category.findMany({
  //     where: {
  //   deletedAt: null,
  //   active: true,
  // },
  //     orderBy: { name: 'asc' },
  //     select: {
  //       id: true,
  //       name: true,
  //       slug: true,
  //       ...( { icon: true } as any ),
  //     }
  //   });
   const rawCategories = await prisma.category.findMany({
      where: {
        deletedAt: null,
        active: true,
      },
      orderBy: { name: 'asc' },
    });

    const categories = rawCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: withAbsoluteIcon((c as any).icon ?? null),
    }));
    const articlesRaw = await prisma.article.findMany({
  where: {
    status: ArticleStatus.PUBLISHED,
    deletedAt: null,
  },
  orderBy: { createdAt: 'desc' },
  take: 10,
  select: {
    id: true,
    title: true,
    slug: true,
    body: true,
    image: true,
    video: true,
    createdAt: true,
    categoryId: true,
    authorName: true,
    author: {
      select: {
        name: true,
      },
    },
  },
});


    // 2️⃣ Articles – EXACT ENUM, NO deletedAt FILTER YET
    // const articles = await prisma.article.findMany({
    //   where: {
    //     status: ArticleStatus.PUBLISHED,
    //      deletedAt: null
    //   },
    //   orderBy: { createdAt: 'desc' },
    //   take: 10,
    //   select: {
    //     id: true,
    //     title: true,
    //     slug: true,
    //     body: true,
    //     image: true,
    //     video: true, 
    //     createdAt: true,
    //     categoryId: true,
    //     authorName: true,
    //   }
    // });
const articles = articlesRaw.map((a) => ({
  id: a.id,
  title: a.title,
  slug: a.slug,
  body: a.body,
  image: a.image,
  video: a.video,
  createdAt: a.createdAt,
  categoryId: a.categoryId,
  authorName: a.authorName || a.author?.name || "Bharat Varta News",
}));

    // 3️⃣ Top News – SAME TABLE, DIFFERENT SLICE
    const topNews = await prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
         deletedAt: null
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true
      }
    });

    // 4️⃣ Videos – EXACT ENUM
    const videos = await prisma.video.findMany({
      where: {
        status: VideoStatus.PUBLISHED
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        url: true,
        createdAt: true
      }
    });

    res.json({
      categories,
      articles,
      topNews,
      videos
    });
  } catch (error) {
    console.error('HOME API ERROR:', error);
    res.status(500).json({ message: 'Failed to load home data' });
  }
}
