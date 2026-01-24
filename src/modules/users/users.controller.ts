import { Request, Response } from 'express';
import prisma from '../../database/prisma';
import bcrypt from 'bcryptjs';

export async function listUsers(_: Request, res: Response) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true
    }
  });
  res.json(users);
}

export async function createUser(req: Request, res: Response) {
  const { name, email, password, role } = req.body;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role,
      password: await bcrypt.hash(password, 10)
    }
  });

  res.json(user);
}

export async function updateUser(req: Request, res: Response) {
  const id = Number(req.params.id);
  const user = await prisma.user.update({
    where: { id },
    data: req.body
  });
  res.json(user);
}

export async function toggleUserStatus(req: Request, res: Response) {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) return res.status(404).json(null);

  const updated = await prisma.user.update({
    where: { id },
    data: { active: !user.active }
  });

  res.json(updated);
}
