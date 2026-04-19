import { Router } from "express";
import { z } from "zod";
import { createJWT } from "../../lib/jwt";
import { prisma } from "../../lib/prisma";

const router = Router();

const sessionSyncSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).max(120).optional(),
  picture: z.string().url().optional(),
  userId: z.string().trim().min(1).max(64).optional(),
});

// POST /api/auth/session-sync
// Sync NextAuth session and issue app JWT
router.post("/session-sync", async (req, res) => {
  try {
    const parsed = sessionSyncSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.issues });
      return;
    }

    const { email, name, picture, userId } = parsed.data;

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          ...(userId ? { id: userId } : {}),
          email,
          name: name || email.split("@")[0],
          image: picture,
        },
      });
    }

    // Create JWT
    const token = await createJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    res.json({ token, user });
  } catch (error) {
    console.error("Session sync error:", error);
    res.status(500).json({ error: "Failed to sync session" });
  }
});

export default router;
