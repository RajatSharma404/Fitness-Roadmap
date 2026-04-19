import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const plannerInputSchema = z.object({
  age: z.number().int().min(10).max(100),
  sex: z.enum(["male", "female"]),
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(25).max(400),
  goal: z.enum(["fat_loss", "weight_loss", "muscle_gain", "recomposition"]),
  activity: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  workoutDays: z.number().int().min(3).max(7),
  diet: z.enum(["veg", "non_veg", "mixed"]),
});

const weeklyCheckinSchema = z.object({
  date: z.string().min(8),
  weightKg: z.number().min(25).max(400),
  waistCm: z.number().min(30).max(250),
  sleepHours: z.number().min(0).max(24),
  stepsAvg: z.number().int().min(0).max(100000),
  stress: z.number().int().min(1).max(10),
  energy: z.number().int().min(1).max(10),
  workoutCompletion: z.number().min(0).max(100),
});

const persistedPlanStateSchema = z.object({
  input: plannerInputSchema,
  progress: z.record(z.string(), z.boolean()),
  checkins: z.array(weeklyCheckinSchema).max(104),
  equipment: z.enum(["gym", "home"]),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
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

  const planState = await prisma.userPlanState.findUnique({
    where: { userId },
    select: { state: true, updatedAt: true },
  });

  const parsedState = persistedPlanStateSchema.safeParse(planState?.state);

  return NextResponse.json({
    ok: true,
    state: parsedState.success ? parsedState.data : null,
    updatedAt: planState?.updatedAt ?? null,
  });
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

  const body = await req.json();
  const parsed = persistedPlanStateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid plan state", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const state = parsed.data;

  await prisma.$transaction([
    prisma.userPlanState.upsert({
      where: { userId },
      update: { state },
      create: {
        userId,
        state,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        bodyweight: state.input.weightKg,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
