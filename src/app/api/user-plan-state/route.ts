import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATE_PREFIX = "FITNESS_PLAN_STATE::";

function extractState(bio: string | null | undefined): unknown {
  if (!bio || !bio.startsWith(STATE_PREFIX)) return null;

  const raw = bio.slice(STATE_PREFIX.length);
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { bio: true, updatedAt: true },
  });

  return NextResponse.json({
    ok: true,
    state: extractState(user?.bio),
    updatedAt: user?.updatedAt ?? null,
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
  const serialized = `${STATE_PREFIX}${JSON.stringify(body)}`;

  await prisma.user.update({
    where: { id: userId },
    data: {
      bio: serialized,
      bodyweight:
        typeof body?.input?.weightKg === "number"
          ? body.input.weightKg
          : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
