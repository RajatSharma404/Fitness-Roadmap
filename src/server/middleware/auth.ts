import type { NextFunction, Request, Response } from "express";
import { verifyJWT } from "../../lib/jwt";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.substring(7);
    const payload = await verifyJWT(token);

    if (!payload) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Authentication failed" });
  }
}
