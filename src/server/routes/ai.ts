import { Router } from "express";
import rateLimit from "express-rate-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const router = Router();

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

// AI route rate limiter: 20 requests per minute
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: "Rate limit exceeded. Please try again later." },
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// POST /api/ai/chat (SSE streaming)
router.post("/chat", aiLimiter, async (req, res) => {
  try {
    const parsed = chatPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid request payload",
        details: parsed.error.issues,
      });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({ error: "AI service is not configured" });
      return;
    }

    const { message, context } = parsed.data;

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Build system prompt
    const systemPrompt = `You are an expert strength training coach. Be concise but thorough.

User Context:
- Goal: ${context?.goal || "General Strength"}
- Bodyweight: ${context?.bodyweight || 70} ${context?.unit || "kg"}
- Unlocked Nodes: ${context?.unlockedNodes?.length || 0}
- Recent PRs: ${JSON.stringify(context?.PRs || [])}

Provide evidence-based advice on training, technique, programming, and recovery.
Keep responses under 300 words unless detailed programming is requested.`;

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

    const result = await chat.sendMessageStream(message);

    // Stream response chunks
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}

`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("AI chat error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "AI service error" });
      return;
    }

    res.write(`data: ${JSON.stringify({ error: "AI service error" })}

`);
    res.end();
  }
});

export default router;
