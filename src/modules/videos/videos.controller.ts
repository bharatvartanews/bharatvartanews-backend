import { Request, Response } from 'express';
import prisma from '../../database/prisma';

export async function listVideos(_: Request, res: Response) {
  const videos = await prisma.video.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' }
  });
  res.json(videos);
}

export async function getVideoById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const video = await prisma.video.findUnique({ where: { id } });

  if (!video || video.deletedAt) return res.status(404).json(null);

  res.json(video);
}

export async function createVideo(req: Request, res: Response) {
  const { title, url, status } = req.body;

  const video = await prisma.video.create({
    data: { title, url, status }
  });

  res.json(video);
}

// export async function updateVideo(req: Request, res: Response) {
//   const id = Number(req.params.id);

//   const video = await prisma.video.update({
//     where: { id },
//     data: req.body
//   });

//   res.json(video);
// }
// export async function updateVideo(req: Request, res: Response) {
//   const id = Number(req.params.id);
//  console.log("UPDATE VIDEO ID:", req.params.id);
//   const { title, url, status } = req.body;

//   const data: any = {};

//   if (title !== undefined) data.title = title;
//   if (url !== undefined) data.url = url;
//   if (status !== undefined) data.status = status;

//   const video = await prisma.video.update({
//     where: { id },
//     data
//   });

//   res.json(video);
// }
export async function updateVideo(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id > 2_147_483_647) {
    return res.status(400).json({ error: 'Invalid video ID' });
  }

  const { title, url, status } = req.body;
  const data: any = {};

  if (title !== undefined) data.title = title;
  if (url !== undefined) data.url = url;
  if (status !== undefined) data.status = status;

  const video = await prisma.video.update({
    where: { id },
    data,
  });

  res.json(video);
}


export async function deleteVideo(req: Request, res: Response) {
  const id = Number(req.params.id);

  await prisma.video.update({
    where: { id },
    data: { deletedAt: new Date() }
  });

  res.json({ ok: true });
}
