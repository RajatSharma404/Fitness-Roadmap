import { Router } from "express";
import rateLimit from "express-rate-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

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
    const { message, context } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

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
    res.write(`data: ${JSON.stringify({ error: "AI service error" })}

`);
    res.end();
  }
});

export default router;
