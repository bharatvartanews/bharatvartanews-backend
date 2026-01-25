import { Request, Response } from 'express';
import prisma from '../../database/prisma';
import { generateSlug } from '../../utils/slug';
import cloudinary from "../../utils/cloudinary";


import slugify from "slugify";
async function uploadToCloudinary(file: Express.Multer.File, folder: string) {
  const base64 = file.buffer.toString("base64");
  const dataUri = `data:${file.mimetype};base64,${base64}`;

  const res = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "auto",
  });

  return res.secure_url;
}




export async function listArticles(req: Request, res: Response) {
  const { status, categoryId, q } = req.query;

  const articles = await prisma.article.findMany({
    where: {
      deletedAt: null,
      ...(status && { status: status as any }),
      ...(categoryId && { categoryId: Number(categoryId) }),
      ...(q && {
        title: { contains: String(q), mode: 'insensitive' }
      })
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(articles);
}

export async function getArticleById(req: Request, res: Response) {
  const rawId = req.params.id;
  const id = Number(rawId);

  if (!rawId || Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid article id' });
  }

  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article || article.deletedAt) {
    return res.status(404).json(null);
  }

  res.json(article);
}


// export async function createArticle(req: Request, res: Response) {
//   const {
//     title,
//     content,
//     action,
//     imageUrl,
//     videoUrl,
//     categoryId,
//     authorId,
//   } = req.body;

//   console.log('BODY:', req.body);

//   if (!title) {
//     return res.status(400).json({ message: 'Title is required' });
//   }

//   const status =
//     action === 'publish'
//       ? 'PUBLISHED'
//       : action === 'review'
//       ? 'REVIEW'
//       : 'DRAFT';
// // 🔥 slug = first word only
//   //const slug = title.trim().split(/\s+/)[0].toLowerCase();

//   const baseSlug = slugify(title, {
//   lower: true,
//   strict: true
// });

// const slug = `${baseSlug}-${Date.now().toString(36)}`;
//   const article = await prisma.article.create({
//     data: {
//       title,
//       slug,
//       body: content,
//       status,

//       image: imageUrl || null,   // ✅ FIXED
//       video: videoUrl || null,   // ✅ FIXED

//     // ✅ REQUIRED
//       category: {
//         connect: { id: Number(categoryId) },
//       },

//       // ✅ REQUIRED
//       author: {
//         connect: { id: Number(authorId || 1) },
//       },
//     },
//   });

//   res.json(article);
// }
export async function createArticle(req: Request, res: Response) {
  const {
    title,
    content,
    action,
    imageUrl,
    videoUrl,
    categoryId,
    authorId,
  } = req.body;

  console.log("BODY:", req.body);

  if (!title) return res.status(400).json({ message: "Title is required" });
  if (!content) return res.status(400).json({ message: "Content is required" });
  if (!categoryId) return res.status(400).json({ message: "Category is required" });

  const status =
    action === "publish"
      ? "PUBLISHED"
      : action === "review"
      ? "REVIEW"
      : "DRAFT";

  // ✅ unique slug
  const baseSlug = slugify(title, { lower: true, strict: true });
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  // ✅ multer fields
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  let finalImage = imageUrl || null;
  let finalVideo = videoUrl || null;

  // ✅ if uploaded file, upload to cloudinary
  if (files?.image?.[0]) {
    finalImage = await uploadToCloudinary(files.image[0], "bharatvarta/articles/images");
  }

  if (files?.video?.[0]) {
    finalVideo = await uploadToCloudinary(files.video[0], "bharatvarta/articles/videos");
  }

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      body: content,
      status,
      image: finalImage,
      video: finalVideo,

      category: {
        connect: { id: Number(categoryId) },
      },
      author: {
        connect: { id: Number(authorId || 1) },
      },
    },
  });

  res.json(article);
}


// export async function updateArticle(req: Request, res: Response) {
//   const id = Number(req.params.id);

//   if (!id || Number.isNaN(id)) {
//     return res.status(400).json({ message: 'Invalid article id' });
//   }

//   const {
//     title,
//     content,
//     action,
//     imageUrl,
//     videoUrl,
//     categoryId,
//     authorId,
//   } = req.body;

//   const data: any = {
//     ...(content && { body: content }),
//     ...(imageUrl !== undefined && { image: imageUrl || null }),
//     ...(videoUrl !== undefined && { video: videoUrl || null }),
//   };

//   if (title) {
//     data.title = title;
//     data.slug = title.trim().split(/\s+/)[0].toLowerCase();
//   }

//   if (action) {
//     data.status =
//       action === 'publish'
//         ? 'PUBLISHED'
//         : action === 'review'
//         ? 'REVIEW'
//         : 'DRAFT';
//   }

//   if (categoryId) {
//     data.category = {
//       connect: { id: Number(categoryId) },
//     };
//   }

//   if (authorId) {
//     data.author = {
//       connect: { id: Number(authorId) },
//     };
//   }

//   const article = await prisma.article.update({
//     where: { id },
//     data,
//   });

//   res.json(article);
// }


// export async function updateArticle(req: Request, res: Response) {
//   const id = Number(req.params.id);

//   if (!id || Number.isNaN(id)) {
//     return res.status(400).json({ message: 'Invalid article id' });
//   }

//   const {
//     title,
//     content,
//     action,
//     imageUrl,
//     videoUrl,
//     categoryId,
//     authorId,
//   } = req.body;

//   const status =
//     action === 'publish'
//       ? 'PUBLISHED'
//       : action === 'review'
//       ? 'REVIEW'
//       : action === 'draft'
//       ? 'DRAFT'
//       : undefined;

//   const article = await prisma.article.update({
//     where: { id },
//     data: {
//       ...(title && {
//         title,
//         slug: generateSlug(title),
//       }),

//       ...(content && { body: content }),
//       ...(imageUrl !== undefined && { image: imageUrl || null }), // ✅ FIXED
//       ...(videoUrl !== undefined && { video: videoUrl || null }), // ✅ FIXED
//       ...(status && { status }),

//       ...(categoryId && { categoryId: Number(categoryId) }),
//       ...(authorId && { authorId: Number(authorId) }),
//     },
//   });

//   res.json(article);
// }
export async function updateArticle(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid article id" });
  }

  const {
    title,
    content,
    action,
    imageUrl,
    videoUrl,
    categoryId,
    authorId,
  } = req.body;

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  const data: any = {};

  if (title) {
    data.title = title;

    // ✅ keep unique slug for update too
    const baseSlug = slugify(title, { lower: true, strict: true });
    data.slug = `${baseSlug}-${Date.now().toString(36)}`;
  }

  if (content) {
    data.body = content;
  }

  if (action) {
    data.status =
      action === "publish"
        ? "PUBLISHED"
        : action === "review"
        ? "REVIEW"
        : "DRAFT";
  }

  // ✅ if user typed url, update
  if (imageUrl !== undefined) {
    data.image = imageUrl || null;
  }
  if (videoUrl !== undefined) {
    data.video = videoUrl || null;
  }

  // ✅ if file uploaded, override url and upload to cloudinary
  if (files?.image?.[0]) {
    data.image = await uploadToCloudinary(files.image[0], "bharatvarta/articles/images");
  }

  if (files?.video?.[0]) {
    data.video = await uploadToCloudinary(files.video[0], "bharatvarta/articles/videos");
  }

  if (categoryId) {
    data.category = { connect: { id: Number(categoryId) } };
  }

  if (authorId) {
    data.author = { connect: { id: Number(authorId) } };
  }

  const article = await prisma.article.update({
    where: { id },
    data,
  });

  res.json(article);
}

export async function deleteArticle(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid article id' });
  }

  await prisma.article.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  res.json({ ok: true });
}

export async function getArticleBySlug(req: Request, res: Response) {
  const { slug } = req.params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true
    }
  });

  if (!article) {
    return res.status(404).json({ message: "Article not found" });
  }

  res.json(article);
}
