import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const completeNodeSchema = z.object({
  nodeId: z.string().trim().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  const parsed = completeNodeSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "nodeId is required" }, { status: 400 });
  }

  try {
    const userNode = await prisma.userNode.findUnique({
      where: {
        userId_nodeId: {
          userId,
          nodeId: parsed.data.nodeId,
        },
      },
    });

    if (!userNode || userNode.status === "LOCKED") {
      return NextResponse.json(
        { error: "Node is locked or not unlocked yet" },
        { status: 400 },
      );
    }

    if (userNode.status === "COMPLETED") {
      return NextResponse.json({ ok: true, alreadyCompleted: true });
    }

    const completed = await prisma.userNode.update({
      where: { id: userNode.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, node: completed });
  } catch (error) {
    console.error("Complete node error:", error);
    return NextResponse.json(
      { error: "Failed to complete node" },
      { status: 500 },
    );
  }
}
