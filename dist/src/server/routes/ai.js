"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const generative_ai_1 = require("@google/generative-ai");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const chatPayloadSchema = zod_1.z.object({
    message: zod_1.z.string().trim().min(1).max(4000),
    context: zod_1.z
        .object({
        goal: zod_1.z.string().max(120).optional(),
        bodyweight: zod_1.z.number().min(25).max(400).optional(),
        unit: zod_1.z.enum(["kg", "lbs", "KG", "LBS"]).optional(),
        unlockedNodes: zod_1.z.array(zod_1.z.unknown()).max(200).optional(),
        PRs: zod_1.z.array(zod_1.z.unknown()).max(200).optional(),
    })
        .optional(),
});
// AI route rate limiter: 20 requests per minute
const aiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    message: { error: "Rate limit exceeded. Please try again later." },
});
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// POST /api/ai/chat (SSE streaming)
router.post("/chat", aiLimiter, async (req, res) => {
    var _a, e_1, _b, _c;
    var _d;
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
- Goal: ${(context === null || context === void 0 ? void 0 : context.goal) || "General Strength"}
- Bodyweight: ${(context === null || context === void 0 ? void 0 : context.bodyweight) || 70} ${(context === null || context === void 0 ? void 0 : context.unit) || "kg"}
- Unlocked Nodes: ${((_d = context === null || context === void 0 ? void 0 : context.unlockedNodes) === null || _d === void 0 ? void 0 : _d.length) || 0}
- Recent PRs: ${JSON.stringify((context === null || context === void 0 ? void 0 : context.PRs) || [])}

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
        try {
            // Stream response chunks
            for (var _e = true, _f = __asyncValues(result.stream), _g; _g = await _f.next(), _a = _g.done, !_a; _e = true) {
                _c = _g.value;
                _e = false;
                const chunk = _c;
                const text = chunk.text();
                if (text) {
                    res.write(`data: ${JSON.stringify({ text })}

`);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_e && !_a && (_b = _f.return)) await _b.call(_f);
            }
            finally { if (e_1) throw e_1.error; }
        }
        res.write("data: [DONE]\n\n");
        res.end();
    }
    catch (error) {
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
exports.default = router;
