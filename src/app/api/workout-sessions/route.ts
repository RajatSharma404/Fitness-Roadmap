import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const workoutSessionSchema = z.object({
  day: z.string().trim().min(1).max(32),
  tier: z.enum(["beginner", "intermediate", "advanced"]),
  phase: z.string().trim().max(64).nullable().optional(),
  focus: z.string().trim().min(1).max(200),
  setsReps: z.string().trim().min(1).max(80),
  exercises: z.array(z.string().trim().min(1).max(120)).min(1).max(50),
  completedExercises: z.array(z.string().trim().min(1).max(120)).max(50),
  durationMinutes: z.number().int().min(1).max(720).nullable().optional(),
  completedAt: z.string().datetime().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const sessions = await prisma.workoutSession.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
    take: 25,
  });

  return NextResponse.json({ ok: true, sessions });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const payload = await req.json();
  const parsed = workoutSessionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid workout session payload",
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const sessionRecord = await prisma.workoutSession.create({
    data: {
      userId,
      day: parsed.data.day,
      tier: parsed.data.tier,
      phase: parsed.data.phase ?? null,
      focus: parsed.data.focus,
      setsReps: parsed.data.setsReps,
      exercises: parsed.data.exercises,
      completedExercises: parsed.data.completedExercises,
      durationMinutes: parsed.data.durationMinutes ?? null,
      completedAt: parsed.data.completedAt
        ? new Date(parsed.data.completedAt)
        : new Date(),
    },
  });

  return NextResponse.json({ ok: true, session: sessionRecord });
}
