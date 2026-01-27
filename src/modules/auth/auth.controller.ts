import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../database/prisma';
import { comparePassword } from '../../utils/hash';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const ok = await comparePassword(password, user.password||" ");
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role
    }
  });
}


export async function googleLogin(req: Request, res: Response) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Google token missing" });
    }

    // verify token with Google
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );

    if (!googleRes.ok) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const payload: any = await googleRes.json();

    const email = payload.email;
    const googleId = payload.sub;
    const name = payload.name || "Google User";

    if (!email || !googleId) {
      return res.status(400).json({ message: "Invalid Google payload" });
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          role: "PUBLIC_USER",
          active: true,
        },
      });
    }

    const jwtToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.json({
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Google auth error", err);
    return res.status(500).json({ message: "Google auth failed" });
  }
}
export async function me(req: Request, res: Response) {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json(null);

    const token = auth.split(" ")[1];

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) return res.status(401).json(null);

    return res.json({ user });
  } catch {
    return res.status(401).json(null);
  }
}
