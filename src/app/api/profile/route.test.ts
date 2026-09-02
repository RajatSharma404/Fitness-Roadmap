import { describe, expect, it, vi } from "vitest";
import { GET, PATCH } from "./route";
import * as nextAuth from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("/api/profile endpoints", () => {
  it("GET returns 401 when unauthorized", async () => {
    (nextAuth.getServerSession as any).mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("GET returns profile data for current user", async () => {
    (nextAuth.getServerSession as any).mockResolvedValueOnce({
      user: { id: "user_prof_1" },
    });

    (prisma.user.findUnique as any).mockResolvedValueOnce({
      id: "user_prof_1",
      name: "Profile User",
      email: "profile@test.com",
      goal: "STRENGTH",
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("Profile User");
  });

  it("PATCH updates user profile data", async () => {
    (nextAuth.getServerSession as any).mockResolvedValueOnce({
      user: { id: "user_prof_1" },
    });

    (prisma.user.update as any).mockResolvedValueOnce({
      id: "user_prof_1",
      name: "Updated Name",
      goal: "POWERLIFTING",
      bodyweight: 85,
    });

    const req = new NextRequest("http://localhost/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated Name", goal: "POWERLIFTING", bodyweight: 85 }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Updated Name");
  });
});
