import { Router } from "express";
import { createJWT } from "../../lib/jwt";
import { prisma } from "../../lib/prisma";

const router = Router();

// POST /api/auth/session-sync
// Sync NextAuth session and issue app JWT
router.post("/session-sync", async (req, res) => {
  try {
    const { email, name, picture, userId } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
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
