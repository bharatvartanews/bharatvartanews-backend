import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (process.env.ENABLE_STRICT_AUTH !== 'true') {
    return next();
  }

  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json(null);

  try {
    jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET as string);
    next();
  } catch {
    res.status(401).json(null);
  }
}
