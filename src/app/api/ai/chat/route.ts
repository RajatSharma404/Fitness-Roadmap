import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

const chatPayloadSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  context: z
    .object({
      goal: z.string().max(120).optional(),
      bodyweight: z.number().min(25).max(400).optional(),
      unit: z.enum(["kg", "lbs", "KG", "LBS"]).optional(),
      unlockedNodes: z.array(z.unknown()).max(200).optional(),
      PRs: z.array(z.unknown()).max(200).optional(),
    })
    .optional(),
});

const reqTimestampsByIp = new Map<string, number[]>();
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const existing = reqTimestampsByIp.get(ip) ?? [];
  const fresh = existing.filter(
    (timestamp) => now - timestamp < RATE_WINDOW_MS,
  );

  if (fresh.length >= RATE_MAX) {
    reqTimestampsByIp.set(ip, fresh);
    return true;
  }

  fresh.push(now);
  reqTimestampsByIp.set(ip, fresh);
  return false;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 },
    );
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "AI service is not configured" },
      { status: 503 },
    );
  }

  const payload = await req.json();
  const parsed = chatPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request payload",
        details: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const { message, context } = parsed.data;
  const safeGoal = String(context?.goal ?? "General Strength").slice(0, 120);
  const safeBodyweight =
    typeof context?.bodyweight === "number" ? context.bodyweight : 70;
  const safeUnit =
    context?.unit && ["kg", "lbs", "KG", "LBS"].includes(context.unit)
      ? context.unit
      : "kg";
  const safeRecentPRs = Array.isArray(context?.PRs)
    ? context.PRs.slice(0, 20).map((entry) => {
        const candidate = entry as {
          name?: unknown;
          weight?: unknown;
          reps?: unknown;
        };
        return {
          name: String(candidate.name ?? "").slice(0, 60),
          weight:
            typeof candidate.weight === "number" ? candidate.weight : null,
          reps: typeof candidate.reps === "number" ? candidate.reps : null,
        };
      })
    : [];
  const unlockedNodeCount = Array.isArray(context?.unlockedNodes)
    ? context.unlockedNodes.length
    : 0;

  const systemPrompt = `You are an expert strength training coach. Be concise but thorough.

User Context:
- Goal: ${safeGoal}
- Bodyweight: ${safeBodyweight} ${safeUnit}
- Unlocked Nodes: ${unlockedNodeCount}
- Recent PRs: ${JSON.stringify(safeRecentPRs)}

Provide evidence-based advice on training, technique, programming, and recovery.
Keep responses under 300 words unless detailed programming is requested.`;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      maxOutputTokens: 800,
      temperature: 0.7,
    },
  });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [
          {
            text: "I understand. I will provide expert strength training advice based on your context and goals.",
          },
        ],
      },
    ],
  });

  const streamResult = await chat.sendMessageStream(message);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamResult.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
            );
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "AI service error" })}\n\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
