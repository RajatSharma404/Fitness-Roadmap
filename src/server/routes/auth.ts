import { Router } from "express";

const router = Router();

// POST /api/auth/session-sync
// This endpoint is intentionally disabled to avoid issuing bearer tokens
// without strong server-side session verification.
router.post("/session-sync", async (req, res) => {
  void req;
  res.status(410).json({
    error:
      "session-sync is disabled. Use server-side NextAuth session routes instead.",
  });
});

export default router;
