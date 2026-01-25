import { Request, Response } from 'express';
import prisma from '../../database/prisma';
import cloudinary from "../../utils/cloudinary";
import fs from "fs";


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

// export async function createVideo(req: Request, res: Response) {
//   const { title, url, status } = req.body;

//   const video = await prisma.video.create({
//     data: { title, url, status }
//   });

//   res.json(video);
// }

export async function createVideo(req: Request, res: Response) {
  try {
    const { title, type, url, status } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    let finalUrl: string | null = null;

    // ✅ If URL mode
    if (type === "URL") {
      if (!url?.trim()) {
        return res.status(400).json({ message: "Video URL required" });
      }
      finalUrl = url.trim();
    }

    // ✅ If UPLOAD mode
    if (type === "UPLOAD") {
      if (!req.file) {
        return res.status(400).json({ message: "Video file required" });
      }

      // upload to Cloudinary
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        folder: "bharat-varta/videos",
        resource_type: "video",
      });

      finalUrl = uploadRes.secure_url;

      // cleanup local file
      fs.unlinkSync(req.file.path);
    }

    const saved = await prisma.video.create({
      data: {
        title,
        url: finalUrl,
        status: status || "DRAFT",
      },
    });

    return res.json(saved);
  } catch (err: any) {
    console.error("CREATE VIDEO ERROR:", err);
    return res.status(500).json({ message: "Failed to create video" });
  }
}

// export async function updateVideo(req: Request, res: Response) {
//   const id = Number(req.params.id);

//   if (!Number.isInteger(id) || id > 2_147_483_647) {
//     return res.status(400).json({ error: 'Invalid video ID' });
//   }

//   const { title, url, status } = req.body;
//   const data: any = {};

//   if (title !== undefined) data.title = title;
//   if (url !== undefined) data.url = url;
//   if (status !== undefined) data.status = status;

//   const video = await prisma.video.update({
//     where: { id },
//     data,
//   });

//   res.json(video);
// }
export async function updateVideo(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid video id" });
    }

    const { title, type, url, status } = req.body;

    let finalUrl: string | undefined = undefined;

    // ✅ If URL mode update
    if (type === "URL") {
      if (!url?.trim()) {
        return res.status(400).json({ message: "Video URL required" });
      }
      finalUrl = url.trim();
    }

    // ✅ If UPLOAD mode update
    if (type === "UPLOAD" && req.file) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        folder: "bharat-varta/videos",
        resource_type: "video",
      });

      finalUrl = uploadRes.secure_url;

      fs.unlinkSync(req.file.path);
    }

    const updated = await prisma.video.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(status !== undefined && { status }),
        ...(finalUrl !== undefined && { url: finalUrl }),
      },
    });

    return res.json(updated);
  } catch (err: any) {
    console.error("UPDATE VIDEO ERROR:", err);
    return res.status(500).json({ message: "Failed to update video" });
  }
}


export async function deleteVideo(req: Request, res: Response) {
  const id = Number(req.params.id);

  await prisma.video.update({
    where: { id },
    data: { deletedAt: new Date() }
  });

  res.json({ ok: true });
}
