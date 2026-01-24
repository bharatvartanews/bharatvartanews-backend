// import { Request, Response } from 'express';
// import prisma from '../../database/prisma';
// import { generateSlug } from '../../utils/slug';

// export async function listCategories(_: Request, res: Response) {
//   const categories = await prisma.category.findMany({
//     where: { deletedAt: null }
//   });
//   res.json(categories);
// }

// export async function createCategory(req: Request, res: Response) {
//   const { name } = req.body;

//   const category = await prisma.category.create({
//     data: {
//       name,
//       slug: generateSlug(name)
//     }
//   });

//   res.json(category);
// }

// export async function updateCategory(req: Request, res: Response) {
//   const id = Number(req.params.id);
//   const { name } = req.body;

//   const category = await prisma.category.update({
//     where: { id },
//     data: {
//       name,
//       slug: generateSlug(name)
//     }
//   });

//   res.json(category);
// }

// export async function deleteCategory(req: Request, res: Response) {
//   const id = Number(req.params.id);

//   await prisma.category.update({
//     where: { id },
//     data: { deletedAt: new Date() }
//   });

//   res.json({ ok: true });
// }
// export async function getCategoryBySlug(
//   req: Request,
//   res: Response
// ) {
//   const { slug } = req.params;

//   const category = await prisma.category.findFirst({
//     where: {
//       slug,
//       deletedAt: null
//     }
//   });

//   if (!category) {
//     return res.status(404).json(null);
//   }

//   res.json(category);
// }
// import { Request, Response } from 'express';
// import prisma from '../../database/prisma';
// import { generateSlug } from '../../utils/slug';

// const APP_URL = process.env.APP_URL || 'http://localhost:8080';

// function withAbsoluteUrl(path: string | null) {
//   if (!path) return null;
//   if (path.startsWith('http')) return path;
//   return `${APP_URL}${path}`;
// }

// /* ---------------- LIST ---------------- */
// export async function listCategories(_: Request, res: Response) {
//   const categories = await prisma.category.findMany({
//     where: { deletedAt: null },
//     orderBy: { id: 'asc' },
//   });

//   return res.json(
//     categories.map((c) => ({
//       id: c.id,
//       name: c.name,
//       slug: c.slug,
//       active: c.active,
//       icon: withAbsoluteUrl((c as any).icon ?? null),
//     }))
//   );
// }

// /* ---------------- CREATE ---------------- */
// export async function createCategory(req: Request, res: Response) {
//   const { name, icon, active } = req.body;

//   if (!name?.trim()) {
//     return res.status(400).json({ message: 'Name required' });
//   }

//   const cleanName = name.trim();
//   const slug = generateSlug(cleanName);

//   const existing = await prisma.category.findUnique({ where: { slug } });

//   if (existing && existing.deletedAt === null) {
//     return res.status(409).json({ message: 'Category already exists' });
//   }

//   if (existing && existing.deletedAt !== null) {
//     const revived = await prisma.category.update({
//       where: { id: existing.id },
//       data: {
//         name: cleanName,
//         slug,
//         active: active !== undefined ? Boolean(active) : true,
//         deletedAt: null,
//         ...(icon !== undefined ? { icon } : {}),
//       } as any,
//     });

//     return res.json({
//       id: revived.id,
//       name: revived.name,
//       slug: revived.slug,
//       active: revived.active,
//       icon: withAbsoluteUrl((revived as any).icon ?? null),
//     });
//   }

//   const created = await prisma.category.create({
//     data: {
//       name: cleanName,
//       slug,
//       active: active !== undefined ? Boolean(active) : true,
//       ...(icon !== undefined ? { icon } : {}),
//     } as any,
//   });

//   return res.json({
//     id: created.id,
//     name: created.name,
//     slug: created.slug,
//     active: created.active,
//     icon: withAbsoluteUrl((created as any).icon ?? null),
//   });
// }

// /* ---------------- UPDATE ---------------- */
// export async function updateCategory(req: Request, res: Response) {
//   const id = Number(req.params.id);
//   const { name, icon, active } = req.body;

//   const data: any = {};

//   if (name?.trim()) {
//     const newSlug = generateSlug(name.trim());
//     const conflict = await prisma.category.findFirst({
//       where: { slug: newSlug, id: { not: id } },
//     });

//     if (conflict) {
//       return res.status(409).json({ message: 'Duplicate category name' });
//     }

//     data.name = name.trim();
//     data.slug = newSlug;
//   }

//   if (icon !== undefined) data.icon = icon || null;
//   if (active !== undefined) data.active = Boolean(active);

//   const updated = await prisma.category.update({ where: { id }, data });

//   return res.json({
//     id: updated.id,
//     name: updated.name,
//     slug: updated.slug,
//     active: updated.active,
//     icon: withAbsoluteUrl((updated as any).icon ?? null),
//   });
// }

// /* ---------------- DELETE ---------------- */
// export async function deleteCategory(req: Request, res: Response) {
//   await prisma.category.update({
//     where: { id: Number(req.params.id) },
//     data: { deletedAt: new Date() },
//   });

//   res.json({ ok: true });
// }

// /* ---------------- WEBSITE ---------------- */
// export async function getCategoryBySlug(req: Request, res: Response) {
//   const category = await prisma.category.findFirst({
//     where: { slug: req.params.slug, active: true, deletedAt: null },
//   });

//   if (!category) return res.status(404).json(null);

//   return res.json({
//     id: category.id,
//     name: category.name,
//     slug: category.slug,
//     active: category.active,
//     icon: withAbsoluteUrl((category as any).icon ?? null),
//   });
// }
import { Request, Response } from 'express';
import prisma from '../../database/prisma';
import { generateSlug } from '../../utils/slug';

const APP_URL = process.env.APP_URL || 'http://localhost:8080';

function abs(path: string | null) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${APP_URL}${path}`;
}

/* ================= LIST ================= */
export async function listCategories(_: Request, res: Response) {
  const rows = await prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { id: 'asc' },
  });

  res.json(
    rows.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      active: c.active,
      icon: abs((c as any).icon ?? null),
    }))
  );
}

/* ================= CREATE ================= */
// export async function createCategory(req: Request, res: Response) {
//   const { name, active } = req.body;

//   if (!name?.trim()) {
//     return res.status(400).json({ message: 'Name required' });
//   }

//   const cleanName = name.trim();
//   const slug = generateSlug(cleanName);

//   const existing = await prisma.category.findUnique({ where: { slug } });
//   if (existing && existing.deletedAt === null) {
//     return res.status(409).json({ message: 'Category already exists' });
//   }

//   // 🔑 THIS IS THE FIX
//   let iconPath: string | null = null;

//   if (req.file) {
//     iconPath = `/uploads/categories/${req.file.filename}`;
//   } else if (typeof req.body.icon === 'string') {
//     iconPath = req.body.icon;
//   }

//   const created = await prisma.category.create({
//     data: {
//       name: cleanName,
//       slug,
//       active: active !== undefined ? active === 'true' || active === true : true,
//       ...(iconPath ? { icon: iconPath } : {}),
//     } as any,
//   });

//   res.json({
//     id: created.id,
//     name: created.name,
//     slug: created.slug,
//     active: created.active,
//     icon: abs((created as any).icon ?? null),
//   });
// }


// /* ================= UPDATE ================= */
// export async function updateCategory(req: Request, res: Response) {
//   const id = Number(req.params.id);
//   const { name, icon, active } = req.body;

//   const data: Record<string, any> = {};

//   if (name?.trim()) {
//     const newSlug = generateSlug(name.trim());

//     const conflict = await prisma.category.findFirst({
//       where: { slug: newSlug, id: { not: id } },
//     });

//     if (conflict) {
//       return res
//         .status(409)
//         .json({ message: 'Duplicate category name' });
//     }

//     data.name = name.trim();
//     data.slug = newSlug;
//   }

//   if (icon !== undefined) data.icon = icon || null;
//   if (active !== undefined) data.active = Boolean(active);

//   const updated = await prisma.category.update({
//     where: { id },
//     data: data as any, // 🔑 THIS avoids icon TS error
//   });

//   return res.json({
//     id: updated.id,
//     name: updated.name,
//     slug: updated.slug,
//     active: updated.active,
//     icon: abs((updated as any).icon ?? null),
//   });
// }

export async function createCategory(req: Request, res: Response) {
  const { name, active } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: 'Name required' });
  }

  const cleanName = name.trim();
  const slug = generateSlug(cleanName);

  const existing = await prisma.category.findUnique({ where: { slug } });

  // active duplicate → block
  if (existing && existing.deletedAt === null) {
    return res.status(409).json({ message: 'Category already exists' });
  }

  // icon (file OR url)
  let iconPath: string | null = null;
  if (req.file) {
    iconPath = `/uploads/categories/${req.file.filename}`;
  } else if (typeof req.body.icon === 'string') {
    iconPath = req.body.icon;
  }

  // revive soft-deleted
  if (existing && existing.deletedAt !== null) {
    const revived = await prisma.category.update({
      where: { id: existing.id },
      data: {
        name: cleanName,
        active: active !== undefined ? Boolean(active) : true,
        deletedAt: null,
        ...(iconPath ? { icon: iconPath } : {}),
      } as any,
    });

    return res.json({
      id: revived.id,
      name: revived.name,
      slug: revived.slug,
      active: revived.active,
      icon: abs((revived as any).icon ?? null),
    });
  }

  // new
  const created = await prisma.category.create({
    data: {
      name: cleanName,
      slug,
      active: active !== undefined ? Boolean(active) : true,
      ...(iconPath ? { icon: iconPath } : {}),
    } as any,
  });

  res.json({
    id: created.id,
    name: created.name,
    slug: created.slug,
    active: created.active,
    icon: abs((created as any).icon ?? null),
  });
}

/* ================= UPDATE ================= */
// export async function updateCategory(req: Request, res: Response) {
//   const id = Number(req.params.id);
//   const { name, active } = req.body;

//   if (!id) {
//     return res.status(400).json({ message: 'Invalid category id' });
//   }

//   const data: Record<string, any> = {};

//   // load current row once
//   const current = await prisma.category.findUnique({ where: { id } });
//   if (!current) {
//     return res.status(404).json({ message: 'Category not found' });
//   }

//   /* ---- NAME / SLUG (ONLY IF NAME CHANGED) ---- */
//   if (typeof name === 'string' && name.trim() && name.trim() !== current.name) {
//     const cleanName = name.trim();
//     const newSlug = generateSlug(cleanName);

//     const conflict = await prisma.category.findFirst({
//       where: {
//         slug: newSlug,
//         id: { not: id },
//         deletedAt: null,
//       },
//     });

//     if (conflict) {
//       return res
//         .status(409)
//         .json({ message: 'Duplicate category name' });
//     }

//     data.name = cleanName;
//     data.slug = newSlug;
//   }

//   /* ---- ICON (FILE OR URL) ---- */
//   if (req.file) {
//     data.icon = `/uploads/categories/${req.file.filename}`;
//   } else if (typeof req.body.icon === 'string') {
//     data.icon = req.body.icon || null;
//   }
//   // if icon not sent → untouched

//   /* ---- ACTIVE TOGGLE ---- */
//   if (active !== undefined) {
//     data.active = Boolean(active);
//   }

//   const updated = await prisma.category.update({
//     where: { id },
//     data: data as any,
//   });

//   res.json({
//     id: updated.id,
//     name: updated.name,
//     slug: updated.slug,
//     active: updated.active,
//     icon: abs((updated as any).icon ?? null),
//   });
// }

// export async function updateCategory(req: Request, res: Response) {
//   const id = Number(req.params.id);
//   const { name, active } = req.body;

//   if (!id) {
//     return res.status(400).json({ message: 'Invalid category id' });
//   }

//   const data: Record<string, any> = {};

//   // fetch current category once
//   const current = await prisma.category.findUnique({
//     where: { id },
//   });

//   if (!current) {
//     return res.status(404).json({ message: 'Category not found' });
//   }

//   /* ---------- NAME / SLUG (FIXED) ---------- */
//   if (typeof name === 'string' && name.trim()) {
//     const cleanName = name.trim();

//     // 🔑 ONLY run slug logic if name actually changed
//     if (cleanName !== current.name) {
//       const newSlug = generateSlug(cleanName);

//       const conflict = await prisma.category.findFirst({
//         where: {
//           slug: newSlug,
//           id: { not: id },     // allow self
//           deletedAt: null,     // only active conflicts
//         },
//       });

//       if (conflict) {
//         return res
//           .status(409)
//           .json({ message: 'Duplicate category name' });
//       }

//       data.slug = newSlug;
//     }

//     data.name = cleanName;
//   }

//   /* ---------- ICON (FILE OR URL – UNCHANGED LOGIC) ---------- */
//   if (req.file) {
//     data.icon = `/uploads/categories/${req.file.filename}`;
//   } else if (typeof req.body.icon === 'string') {
//     data.icon = req.body.icon || null;
//   }
//   // if icon not sent → untouched

//   /* ---------- ACTIVE TOGGLE (FIXED) ---------- */
//   if (active !== undefined) {
//     data.active = active === 'true' || active === true;
//   }

//   const updated = await prisma.category.update({
//     where: { id },
//     data: data as any,
//   });

//   return res.json({
//     id: updated.id,
//     name: updated.name,
//     slug: updated.slug,
//     active: updated.active,
//     icon: abs((updated as any).icon ?? null),
//   });
// }


export async function updateCategory(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { name, active } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Invalid category id' });
  }

  const current = await prisma.category.findUnique({
    where: { id },
  });

  if (!current) {
    return res.status(404).json({ message: 'Category not found' });
  }

  const data: Record<string, any> = {};

  /* ---------- NAME (NO SLUG UPDATE EVER) ---------- */
  if (typeof name === 'string' && name.trim()) {
    data.name = name.trim();
    // ❌ slug is IMMUTABLE — never touch it
  }

  /* ---------- ICON (FILE OR URL) ---------- */
  if (req.file) {
    data.icon = `/uploads/categories/${req.file.filename}`;
  } else if (typeof req.body.icon === 'string') {
    data.icon = req.body.icon || null;
  }
  // if icon not sent → unchanged

  /* ---------- ACTIVE TOGGLE ---------- */
  if (active !== undefined) {
    data.active = active === 'true' || active === true;
  }

  // nothing to update
  if (Object.keys(data).length === 0) {
    return res.json({
      id: current.id,
      name: current.name,
      slug: current.slug,
      active: current.active,
      icon: abs((current as any).icon ?? null),
    });
  }

  const updated = await prisma.category.update({
    where: { id },
    data: data as any,
  });

  return res.json({
    id: updated.id,
    name: updated.name,
    slug: updated.slug,
    active: updated.active,
    icon: abs((updated as any).icon ?? null),
  });
}


/* ================= DELETE ================= */
export async function deleteCategory(req: Request, res: Response) {
  await prisma.category.update({
    where: { id: Number(req.params.id) },
    data: { deletedAt: new Date() },
  });

  res.json({ ok: true });
}

/* ================= WEBSITE ================= */
export async function getCategoryBySlug(req: Request, res: Response) {
  const c = await prisma.category.findFirst({
    where: {
      slug: req.params.slug,
      active: true,
      deletedAt: null,
    },
  });

  if (!c) return res.status(404).json(null);

  res.json({
    id: c.id,
    name: c.name,
    slug: c.slug,
    active: c.active,
    icon: abs((c as any).icon ?? null),
  });
}
