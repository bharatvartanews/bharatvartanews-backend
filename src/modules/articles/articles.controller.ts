// import { Request, Response } from 'express';
// import prisma from '../../database/prisma';
// import { generateSlug } from '../../utils/slug';
// import cloudinary from "../../utils/cloudinary";


// import slugify from "slugify";
// async function uploadToCloudinary(file: Express.Multer.File, folder: string) {
//   const base64 = file.buffer.toString("base64");
//   const dataUri = `data:${file.mimetype};base64,${base64}`;

//   const res = await cloudinary.uploader.upload(dataUri, {
//     folder,
//     resource_type: "auto",
//   });

//   return res.secure_url;
// }

// /* ---------------- PARSE HELPERS ---------------- */
// function safeParseArray(val: any): string[] {
//   if (!val) return [];

//   // if already array from FormData imageUrls[]
//   if (Array.isArray(val)) return val.filter(Boolean).map(String);

//   // if single string
//   if (typeof val === "string") return val.trim() ? [val.trim()] : [];

//   return [];
// }

// // If DB stored JSON string for image/video
// function safeParseJsonStringArray(val: any): string[] {
//   if (!val) return [];
//   if (Array.isArray(val)) return val;
//   if (typeof val !== "string") return [];

//   try {
//     const parsed = JSON.parse(val);
//     return Array.isArray(parsed) ? parsed : [];
//   } catch {
//     // fallback: treat as single url string
//     return val.trim() ? [val.trim()] : [];
//   }
// }
// export async function listArticles(req: Request, res: Response) {
//   const { status, categoryId, q } = req.query;

//   const articles = await prisma.article.findMany({
//     where: {
//       deletedAt: null,
//       ...(status && { status: status as any }),
//       ...(categoryId && { categoryId: Number(categoryId) }),
//       ...(q && {
//         title: { contains: String(q), mode: "insensitive" },
//       }),
//     },
//     include: {
//      author: { select: { id: true, name: true } },
//       category: {
//         select: { id: true, name: true },
//       },
//     },
//     orderBy: { createdAt: "desc" },
//   });

//   // Optional: auto convert image/video json to arrays for frontend
//   const fixed = articles.map((a: any) => ({
//     ...a,
//     image: safeParseJsonStringArray(a.image),
//     video: safeParseJsonStringArray(a.video),
//     displayAuthor: a.authorName || a.author?.name || `User #${a.authorId}`,
//     ownerId: a.authorId,
//   }));

//   res.json(fixed);
// }
// export async function getArticleById(req: Request, res: Response) {
//   const rawId = req.params.id;
//   const id = Number(rawId);

//   if (!rawId || Number.isNaN(id)) {
//     return res.status(400).json({ message: "Invalid article id" });
//   }

//   const article = await prisma.article.findUnique({
//     where: { id },
//     include: {
//       author: { select: { id: true, name: true } },
//       category: true,
//     },
//   });

//   if (!article || article.deletedAt) {
//     return res.status(404).json(null);
//   }

//   res.json({
//     ...article,
//     image: safeParseJsonStringArray((article as any).image),
//     video: safeParseJsonStringArray((article as any).video),
//     displayAuthor: (article as any).authorName ||
//      (article as any).author?.name || 
//      `User #${(article as any).authorId}`,
//     ownerId: (article as any).authorId,
//   });
// }
// /* ---------------- CREATE ARTICLE (MULTIPLE MEDIA) ---------------- */
// export async function createArticle(req: Request, res: Response) {
//   const { title, content, action, categoryId, authorId,authorName } = req.body;

//   if (!title) return res.status(400).json({ message: "Title is required" });
//   if (!content) return res.status(400).json({ message: "Content is required" });
//   if (!categoryId) return res.status(400).json({ message: "Category is required" });

//   const status =
//     action === "publish"
//       ? "PUBLISHED"
//       : action === "review"
//       ? "REVIEW"
//       : "DRAFT";

//   const baseSlug = slugify(title, { lower: true, strict: true });
//   const slug = `${baseSlug}-${Date.now().toString(36)}`;

//   const files = req.files as {
//     [fieldname: string]: Express.Multer.File[];
//   };

//   // ✅ URL arrays
//   const urlImages = safeParseArray(req.body.imageUrls);
//   const urlVideos = safeParseArray(req.body.videoUrls);

//   // ✅ Upload arrays
//   const uploadedImages: string[] = [];
//   const uploadedVideos: string[] = [];

//   if (files?.image?.length) {
//     for (const f of files.image) {
//       uploadedImages.push(
//         await uploadToCloudinary(f, "bharatvarta/articles/images")
//       );
//     }
//   }

//   if (files?.video?.length) {
//     for (const f of files.video) {
//       uploadedVideos.push(
//         await uploadToCloudinary(f, "bharatvarta/articles/videos")
//       );
//     }
//   }

//   const finalImages = [...urlImages, ...uploadedImages];
//   const finalVideos = [...urlVideos, ...uploadedVideos];

//   const article = await prisma.article.create({
//     data: {
//       title,
//       slug,
//       body: content,
//       status,
//       authorName: authorName?.trim() || null,

//       // ✅ store json string in old columns (so DB doesn't break)
//       image: finalImages.length ? JSON.stringify(finalImages) : null,
//       video: finalVideos.length ? JSON.stringify(finalVideos) : null,

//       category: { connect: { id: Number(categoryId) } },
//       author: { connect: { id: Number(authorId || 1) } },
//     },
//   });

//   res.json(article);
// }

// export async function updateArticle(req: Request, res: Response) {
//   const id = Number(req.params.id);
//   if (!id || Number.isNaN(id)) {
//     return res.status(400).json({ message: "Invalid article id" });
//   }

//   const { title, content, action, categoryId, authorId,authorName } = req.body;

//   const files = req.files as {
//     [fieldname: string]: Express.Multer.File[];
//   };

//   const data: any = {};

//   if (title) {
//     data.title = title;
//     const baseSlug = slugify(title, { lower: true, strict: true });
//     data.slug = `${baseSlug}-${Date.now().toString(36)}`;
//   }

//   if (content) data.body = content;

//   if (action) {
//     data.status =
//       action === "publish"
//         ? "PUBLISHED"
//         : action === "review"
//         ? "REVIEW"
//         : "DRAFT";
//   }

//   if (categoryId) data.category = { connect: { id: Number(categoryId) } };
//   if (authorId) data.author = { connect: { id: Number(authorId) } };
//    // ✅ update manual author name
//   if (authorName !== undefined) {
//     data.authorName = authorName?.trim() || null;
//   }

//   // ✅ previous stored media (optional keep)
//   const existing = await prisma.article.findUnique({
//     where: { id },
//     select: { image: true, video: true },
//   });

//   const oldImages = safeParseJsonStringArray(existing?.image);
//   const oldVideos = safeParseJsonStringArray(existing?.video);

//   // ✅ URL arrays from request
//   const urlImages = safeParseArray(req.body.imageUrls);
//   const urlVideos = safeParseArray(req.body.videoUrls);

//   // ✅ Upload arrays
//   const uploadedImages: string[] = [];
//   const uploadedVideos: string[] = [];

//   if (files?.image?.length) {
//     for (const f of files.image) {
//       uploadedImages.push(
//         await uploadToCloudinary(f, "bharatvarta/articles/images")
//       );
//     }
//   }

//   if (files?.video?.length) {
//     for (const f of files.video) {
//       uploadedVideos.push(
//         await uploadToCloudinary(f, "bharatvarta/articles/videos")
//       );
//     }
//   }

//   /**
//    * ✅ Update Logic:
//    * - If user sends any new media (url/uploads), we REPLACE old
//    * - Otherwise keep old
//    */
//   const newFinalImages =
//     urlImages.length || uploadedImages.length ? [...urlImages, ...uploadedImages] : oldImages;

//   const newFinalVideos =
//     urlVideos.length || uploadedVideos.length ? [...urlVideos, ...uploadedVideos] : oldVideos;

//   data.image = newFinalImages.length ? JSON.stringify(newFinalImages) : null;
//   data.video = newFinalVideos.length ? JSON.stringify(newFinalVideos) : null;

//   const article = await prisma.article.update({
//     where: { id },
//     data,
//   });

//   res.json(article);
// }
// export async function deleteArticle(req: Request, res: Response) {
//   const id = Number(req.params.id);

//   if (Number.isNaN(id)) {
//     return res.status(400).json({ message: 'Invalid article id' });
//   }

//   await prisma.article.update({
//     where: { id },
//     data: { deletedAt: new Date() },
//   });

//   res.json({ ok: true });
// }

// export async function getArticleBySlug(req: Request, res: Response) {
//   const { slug } = req.params;

//   const article = await prisma.article.findUnique({
//     where: { slug },
//     include: {
//       category: true,
//       author: { select: { id: true, name: true } },
//     },
//   });

//   if (!article || article.deletedAt) {
//     return res.status(404).json({ message: "Article not found" });
//   }

//   res.json({
//     ...article,
//     image: safeParseJsonStringArray((article as any).image),
//     video: safeParseJsonStringArray((article as any).video),
//   });
// }

import { Request, Response } from "express";
import prisma from "../../database/prisma";
import cloudinary from "../../utils/cloudinary";
import slugify from "slugify";

/* ---------------- CLOUDINARY UPLOAD ---------------- */
async function uploadToCloudinary(file: Express.Multer.File, folder: string) {
  const base64 = file.buffer.toString("base64");
  const dataUri = `data:${file.mimetype};base64,${base64}`;

  const res = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "auto",
  });

  return res.secure_url;
}

/* ---------------- HELPERS ---------------- */
function safeParseArray(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean).map(String);
  if (typeof val === "string") return val.trim() ? [val.trim()] : [];
  return [];
}

function safeParseJsonStringArray(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val !== "string") return [];

  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return val.trim() ? [val.trim()] : [];
  }
}

function toLegacyMedia(images: string[], videos: string[]) {
  return {
    image: images?.[0] || null, // ✅ backward compatible single
    video: videos?.[0] || null, // ✅ backward compatible single
    images, // ✅ new
    videos, // ✅ new
  };
}

/* ---------------- LIST ---------------- */
export async function listArticles(req: Request, res: Response) {
  try {
    const { status, categoryId, q } = req.query;

    const articles = await prisma.article.findMany({
      where: {
        deletedAt: null,
        ...(status && { status: status as any }),
        ...(categoryId && { categoryId: Number(categoryId) }),
        ...(q && { title: { contains: String(q), mode: "insensitive" } }),
      },
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const fixed = articles.map((a: any) => {
      const images = safeParseJsonStringArray(a.image);
      const videos = safeParseJsonStringArray(a.video);

      return {
        ...a,
        ...toLegacyMedia(images, videos),
        displayAuthor: a.authorName || a.author?.name || `User #${a.authorId}`,
        ownerId: a.authorId,
      };
    });

    res.json(fixed);
  } catch (e) {
    console.error("listArticles error:", e);
    res.status(500).json({ message: "Failed to fetch articles" });
  }
}

/* ---------------- GET BY ID ---------------- */
export async function getArticleById(req: Request, res: Response) {
  try {
    const rawId = req.params.id;
    const id = Number(rawId);

    if (!rawId || Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid article id" });
    }

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        category: true,
      },
    });

    if (!article || article.deletedAt) {
      return res.status(404).json(null);
    }

    const images = safeParseJsonStringArray((article as any).image);
    const videos = safeParseJsonStringArray((article as any).video);

    res.json({
      ...article,
      ...toLegacyMedia(images, videos),
      displayAuthor:
        (article as any).authorName ||
        (article as any).author?.name ||
        `User #${(article as any).authorId}`,
      ownerId: (article as any).authorId,
    });
  } catch (e) {
    console.error("getArticleById error:", e);
    res.status(500).json({ message: "Failed to load article" });
  }
}

/* ---------------- GET BY SLUG ---------------- */
export async function getArticleBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: { select: { id: true, name: true } },
      },
    });

    if (!article || article.deletedAt) {
      return res.status(404).json({ message: "Article not found" });
    }

    const images = safeParseJsonStringArray((article as any).image);
    const videos = safeParseJsonStringArray((article as any).video);

    res.json({
      ...article,
      ...toLegacyMedia(images, videos),
      displayAuthor:
        (article as any).authorName ||
        (article as any).author?.name ||
        `User #${(article as any).authorId}`,
      ownerId: (article as any).authorId,
    });
  } catch (e) {
    console.error("getArticleBySlug error:", e);
    res.status(500).json({ message: "Failed to load article" });
  }
}

/* ---------------- CREATE ---------------- */
export async function createArticle(req: Request, res: Response) {
  try {
    const { title, content, action, categoryId, authorId, authorName } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });
    if (!content) return res.status(400).json({ message: "Content is required" });
    if (!categoryId) return res.status(400).json({ message: "Category is required" });

    const status =
      action === "publish" ? "PUBLISHED" : action === "review" ? "REVIEW" : "DRAFT";

    const baseSlug = slugify(title, { lower: true, strict: true });
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // ✅ URL arrays from FormData
    const urlImages = safeParseArray(req.body.imageUrls);
    const urlVideos = safeParseArray(req.body.videoUrls);

    // ✅ old single URL fallback (backward compatible)
    const singleImageUrl = req.body.imageUrl ? String(req.body.imageUrl) : "";
    const singleVideoUrl = req.body.videoUrl ? String(req.body.videoUrl) : "";

    const legacyUrlImages = singleImageUrl ? [singleImageUrl] : [];
    const legacyUrlVideos = singleVideoUrl ? [singleVideoUrl] : [];

    // ✅ Upload arrays
    const uploadedImages: string[] = [];
    const uploadedVideos: string[] = [];

    if (files?.image?.length) {
      for (const f of files.image) {
        uploadedImages.push(await uploadToCloudinary(f, "bharatvarta/articles/images"));
      }
    }

    if (files?.video?.length) {
      for (const f of files.video) {
        uploadedVideos.push(await uploadToCloudinary(f, "bharatvarta/articles/videos"));
      }
    }

    // ✅ final media (new + old compatible)
    const finalImages = [...urlImages, ...legacyUrlImages, ...uploadedImages].filter(Boolean);
    const finalVideos = [...urlVideos, ...legacyUrlVideos, ...uploadedVideos].filter(Boolean);

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        body: content,
        status,
        authorName: authorName?.trim() || null,

        image: finalImages.length ? JSON.stringify(finalImages) : null,
        video: finalVideos.length ? JSON.stringify(finalVideos) : null,

        category: { connect: { id: Number(categoryId) } },
        author: { connect: { id: Number(authorId || 1) } },
      },
    });

    res.json(article);
  } catch (e) {
    console.error("createArticle error:", e);
    res.status(500).json({ message: "Failed to create article" });
  }
}

/* ---------------- UPDATE ---------------- */
export async function updateArticle(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ message: "Invalid article id" });

    const { title, content, action, categoryId, authorId, authorName } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const data: any = {};

    if (title) {
      data.title = title;
      const baseSlug = slugify(title, { lower: true, strict: true });
      data.slug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    if (content) data.body = content;

    if (action) {
      data.status =
        action === "publish" ? "PUBLISHED" : action === "review" ? "REVIEW" : "DRAFT";
    }

    if (categoryId) data.category = { connect: { id: Number(categoryId) } };
    if (authorId) data.author = { connect: { id: Number(authorId) } };

    if (authorName !== undefined) {
      data.authorName = authorName?.trim() || null;
    }

    // ✅ get old media
    const existing = await prisma.article.findUnique({
      where: { id },
      select: { image: true, video: true },
    });

    const oldImages = safeParseJsonStringArray(existing?.image);
    const oldVideos = safeParseJsonStringArray(existing?.video);

    // ✅ new URL arrays
    const urlImages = safeParseArray(req.body.imageUrls);
    const urlVideos = safeParseArray(req.body.videoUrls);

    // ✅ old single URL fallback
    const singleImageUrl = req.body.imageUrl ? String(req.body.imageUrl) : "";
    const singleVideoUrl = req.body.videoUrl ? String(req.body.videoUrl) : "";

    const legacyUrlImages = singleImageUrl ? [singleImageUrl] : [];
    const legacyUrlVideos = singleVideoUrl ? [singleVideoUrl] : [];

    const uploadedImages: string[] = [];
    const uploadedVideos: string[] = [];

    if (files?.image?.length) {
      for (const f of files.image) {
        uploadedImages.push(await uploadToCloudinary(f, "bharatvarta/articles/images"));
      }
    }

    if (files?.video?.length) {
      for (const f of files.video) {
        uploadedVideos.push(await uploadToCloudinary(f, "bharatvarta/articles/videos"));
      }
    }

    // ✅ Replace logic: if any new sent -> replace old, else keep old
    const hasNewImages = urlImages.length || legacyUrlImages.length || uploadedImages.length;
    const hasNewVideos = urlVideos.length || legacyUrlVideos.length || uploadedVideos.length;

    const finalImages = hasNewImages ? [...urlImages, ...legacyUrlImages, ...uploadedImages] : oldImages;
    const finalVideos = hasNewVideos ? [...urlVideos, ...legacyUrlVideos, ...uploadedVideos] : oldVideos;

    data.image = finalImages.length ? JSON.stringify(finalImages) : null;
    data.video = finalVideos.length ? JSON.stringify(finalVideos) : null;

    const article = await prisma.article.update({ where: { id }, data });
    res.json(article);
  } catch (e) {
    console.error("updateArticle error:", e);
    res.status(500).json({ message: "Failed to update article" });
  }
}

/* ---------------- DELETE ---------------- */
export async function deleteArticle(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid article id" });

  await prisma.article.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  res.json({ ok: true });
}
