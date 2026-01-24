import { Request, Response } from "express";
import prisma from "../../database/prisma";

/* =================================================
   CREATE COMMENT (TOP LEVEL OR REPLY)
================================================= */
export async function createComment(req: Request, res: Response) {
  const { articleId, content, ownerKey, parentId } = req.body;

  if (!articleId || !content || !ownerKey) {
    return res.status(400).json({ message: "Invalid data" });
  }

  const comment = await prisma.comment.create({
    data: {
      articleId: Number(articleId),
      content,
      ownerKey,
      parentId: parentId ? Number(parentId) : null,
    },
  });

  res.json(comment);
}

/* =================================================
   LIST COMMENTS WITH REPLIES (1 LEVEL)
================================================= */
export async function listComments(req: Request, res: Response) {
  const articleId = Number(req.query.articleId);

  if (!articleId) {
    return res.status(400).json({ message: "Article id required" });
  }

  const all = await prisma.comment.findMany({
    where: { articleId },
    orderBy: { createdAt: "asc" },
  });

  const map: Record<number, any> = {};
  const result: any[] = [];

  // parents
  for (const c of all) {
    if (!c.parentId) {
      map[c.id] = { ...c, replies: [] };
      result.push(map[c.id]);
    }
  }

  // replies
  for (const c of all) {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].replies.push(c);
    }
  }

  res.json(result);
}

/* =================================================
   UPDATE COMMENT (OWNER ONLY)
================================================= */
export async function updateComment(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { content, ownerKey } = req.body;

  if (!id || !content || !ownerKey) {
    return res.status(400).json({ message: "Invalid data" });
  }

  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment || comment.ownerKey !== ownerKey) {
    return res.status(403).json({ message: "Not allowed" });
  }

  const updated = await prisma.comment.update({
    where: { id },
    data: { content },
  });

  res.json(updated);
}

/* =================================================
   DELETE COMMENT (OWNER ONLY)
   – also deletes replies
================================================= */
export async function deleteComment(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { ownerKey } = req.body;

  if (!id || !ownerKey) {
    return res.status(400).json({ message: "Invalid data" });
  }

  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment || comment.ownerKey !== ownerKey) {
    return res.status(403).json({ message: "Not allowed" });
  }

  // delete replies first
  await prisma.comment.deleteMany({
    where: { parentId: id },
  });

  await prisma.comment.delete({
    where: { id },
  });

  res.json({ ok: true });
}

/* =================================================
   REPORT COMMENT (ANY USER)
================================================= */
export async function reportComment(req: Request, res: Response) {
  const { commentId, reason } = req.body;

  if (!commentId) {
    return res.status(400).json({ message: "Comment id required" });
  }

  await prisma.commentReport.create({
    data: {
      commentId: Number(commentId),
      reason: reason || null,
    },
  });

  res.json({ ok: true });
}
