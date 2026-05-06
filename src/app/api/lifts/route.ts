import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { calculateEpley1RM } from "@/lib/formulas";
import { prisma } from "@/lib/prisma";

const liftSchema = z.object({
  name: z.string().min(1),
  weight: z.number().positive(),
  reps: z.number().int().positive(),
  setType: z.enum(["WORKING", "MAX_EFFORT", "COMPETITION"]).default("WORKING"),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
  videoUrl: z.string().url().optional(),
});

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lift = req.nextUrl.searchParams.get("lift") ?? undefined;
  const limitParam = req.nextUrl.searchParams.get("limit") ?? "50";
  const parsedLimit = Number.parseInt(limitParam, 10);
  const take = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 200)
    : 50;

  try {
    const lifts = await prisma.lift.findMany({
      where: {
        userId,
        ...(lift ? { name: lift } : {}),
      },
      orderBy: { date: "desc" },
      take,
    });

    return NextResponse.json(lifts);
  } catch (error) {
    console.error("Get lifts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lifts" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  const parsed = liftSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const data = parsed.data;
    const oneRM = calculateEpley1RM(data.weight, data.reps);

    const lift = await prisma.lift.create({
      data: {
        userId,
        name: data.name,
        weight: data.weight,
        reps: data.reps,
        oneRM,
        setType: data.setType,
        date: data.date ? new Date(data.date) : new Date(),
        notes: data.notes,
        videoUrl: data.videoUrl,
      },
    });

    return NextResponse.json(lift);
  } catch (error) {
    console.error("Create lift error:", error);
    return NextResponse.json(
      { error: "Failed to create lift" },
      { status: 500 },
    );
  }
}
