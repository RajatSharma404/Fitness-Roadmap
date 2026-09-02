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
    workoutSession: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("/api/workout-sessions endpoints", () => {
  it("GET returns 401 when unauthorized", async () => {
    (nextAuth.getServerSession as any).mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("GET returns workout sessions for user", async () => {
    (nextAuth.getServerSession as any).mockResolvedValueOnce({
      user: { id: "user_ws_1" },
    });

    (prisma.workoutSession.findMany as any).mockResolvedValueOnce([
      { id: "ws_1", day: "Monday", focus: "Chest & Triceps", tier: "Beginner" },
    ]);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.sessions.length).toBe(1);
  });

  it("POST validates and logs workout session", async () => {
    (nextAuth.getServerSession as any).mockResolvedValueOnce({
      user: { id: "user_ws_1" },
    });

    (prisma.workoutSession.create as any).mockImplementation(({ data }: any) =>
      Promise.resolve({ id: "ws_new_1", ...data })
    );

    const req = new NextRequest("http://localhost/api/workout-sessions", {
      method: "POST",
      body: JSON.stringify({
        day: "Tuesday",
        tier: "Beginner",
        focus: "Back & Biceps",
        setsReps: "3 sets x 10 reps",
        exercises: ["Lat pulldown", "Seated cable row"],
        completedExercises: ["Lat pulldown"],
        durationMinutes: 45,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.session.day).toBe("Tuesday");
  });
});
