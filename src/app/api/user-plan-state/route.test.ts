import { describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";
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
    userPlanState: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("/api/user-plan-state endpoints", () => {
  it("GET returns 401 when unauthenticated", async () => {
    (nextAuth.getServerSession as any).mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("GET returns parsed plan state for user", async () => {
    (nextAuth.getServerSession as any).mockResolvedValueOnce({
      user: { id: "user_plan_1" },
    });

    (prisma.userPlanState.findUnique as any).mockResolvedValueOnce({
      state: {
        input: {
          age: 25,
          sex: "male",
          heightCm: 180,
          weightKg: 80,
          goal: "fat_loss",
          activity: "moderate",
          workoutDays: 5,
          diet: "mixed",
        },
        progress: {},
        checkins: [],
        equipment: "gym",
        experience: "beginner",
      },
      updatedAt: new Date(),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.state.input.age).toBe(25);
  });

  it("POST validates and saves user plan state", async () => {
    (nextAuth.getServerSession as any).mockResolvedValueOnce({
      user: { id: "user_plan_1" },
    });

    const validState = {
      input: {
        age: 28,
        sex: "male",
        heightCm: 175,
        weightKg: 78,
        goal: "muscle_gain",
        activity: "active",
        workoutDays: 5,
        diet: "non_veg",
      },
      progress: { assessment: true },
      checkins: [],
      equipment: "gym",
      experience: "intermediate",
    };

    const req = new NextRequest("http://localhost/api/user-plan-state", {
      method: "POST",
      body: JSON.stringify(validState),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
