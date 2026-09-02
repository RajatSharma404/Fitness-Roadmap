import { describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    lift: { findMany: vi.fn() },
    userNode: { findMany: vi.fn() },
    achievement: { findMany: vi.fn() },
  },
}));

describe("GET /api/profile/[id]", () => {
  it("returns 404 when user is not found", async () => {
    (prisma.user.findUnique as any).mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/profile/unknown_id");
    const res = await GET(req, { params: Promise.resolve({ id: "unknown_id" }) });
    expect(res.status).toBe(404);
  });

  it("returns public user profile with best lifts and nodes completed", async () => {
    (prisma.user.findUnique as any).mockResolvedValueOnce({
      id: "user_public_1",
      name: "Public Athlete",
      goal: "STRENGTH",
    });

    (prisma.lift.findMany as any).mockResolvedValueOnce([
      { name: "squat", oneRM: 150 },
      { name: "bench", oneRM: 110 },
    ]);
    (prisma.userNode.findMany as any).mockResolvedValueOnce([{ id: "un1" }]);
    (prisma.achievement.findMany as any).mockResolvedValueOnce([{ id: "ach1" }]);

    const req = new Request("http://localhost/api/profile/user_public_1");
    const res = await GET(req, { params: Promise.resolve({ id: "user_public_1" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("Public Athlete");
    expect(data.nodesCompleted).toBe(1);
    expect(data.bestLifts.squat).toBe(150);
  });
});
