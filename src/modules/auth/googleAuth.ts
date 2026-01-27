import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../database/prisma";

export async function googleLogin(req: Request, res: Response) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    // 🔐 Verify token with Google
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );

    if (!googleRes.ok) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const payload: any = await googleRes.json();

    const email = payload.email;
    const googleId = payload.sub;
    const name = payload.name;

    if (!email) {
      return res.status(400).json({ message: "Email not found" });
    }

    // 🔍 Find existing user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // 🆕 Create user if not exists
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

    // 🔑 Generate JWT (same as normal login)
    const jwtToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Google login error", err);
    res.status(500).json({ message: "Google login failed" });
  }
}
