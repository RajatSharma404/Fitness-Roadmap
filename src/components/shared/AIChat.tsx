"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  X,
  Send,
  Loader2,
  CheckCircle2,
  Dumbbell,
  Compass,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { readPlannerSnapshot, persistPlannerSnapshot } from "@/lib/plannerView";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface ActionItem {
  type: "COMPLETE_NODE" | "CALCULATE_PLATES" | "LOG_PR" | "OPEN_ROADMAP";
  nodeId?: string;
  title?: string;
  xp?: number;
  weight?: number;
  unit?: string;
  liftName?: string;
  reps?: number;
}

interface AIChatProps {
  isOpen: boolean;
  onToggle: () => void;
  context: {
    goal?: string;
    PRs: Array<{ name: string; weight: number; reps: number }>;
    unlockedNodes: number;
    bodyweight?: number;
  };
}

const STARTER_PROMPTS = [
  "Analyze my current roadmap progress",
  "What milestone should I tackle next?",
  "Give me warm-up sets for 100kg Squat",
  "How can I break through my bench plateau?",
];

function extractActions(content: string): { cleanContent: string; actions: ActionItem[] } {
  const actions: ActionItem[] = [];
  const actionRegex = /\[ACTION:(COMPLETE_NODE|CALCULATE_PLATES|LOG_PR|OPEN_ROADMAP):([^\]]+)\]/g;

  const cleanContent = content.replace(actionRegex, (match, type, paramsStr) => {
    const params = paramsStr.split(":");
    if (type === "COMPLETE_NODE") {
      actions.push({
        type: "COMPLETE_NODE",
        nodeId: params[0],
        title: params[1] || params[0],
        xp: Number(params[2]) || 150,
      });
    } else if (type === "CALCULATE_PLATES") {
      actions.push({
        type: "CALCULATE_PLATES",
        weight: Number(params[0]) || 100,
        unit: params[1] || "kg",
      });
    } else if (type === "LOG_PR") {
      actions.push({
        type: "LOG_PR",
        liftName: params[0] || "Squat",
        weight: Number(params[1]) || 100,
        reps: Number(params[2]) || 1,
      });
    } else if (type === "OPEN_ROADMAP") {
      actions.push({
        type: "OPEN_ROADMAP",
        nodeId: params[0],
      });
    }
    return "";
  }).trim();

  return { cleanContent, actions };
}

export function AIChat({ isOpen, onToggle, context }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI strength & bioenergetics coach with direct interactive access to your **RPG Fitness Roadmap** and **Barbell Plate Calculator**. Ask me anything about programming, warm-ups, or unlocking your next milestone!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [completedNodeIds, setCompletedNodeIds] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for contextual prompts from NodeDrawer, Workouts, Guides
  useEffect(() => {
    const handleContextualPrompt = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt: string; autoSend?: boolean }>;
      if (customEvent.detail?.prompt) {
        setInput(customEvent.detail.prompt);
        if (!isOpen) onToggle();
      }
    };

    window.addEventListener("open-ai-chat-prompt", handleContextualPrompt);
    return () => window.removeEventListener("open-ai-chat-prompt", handleContextualPrompt);
  }, [isOpen, onToggle]);

  const handleExecuteCompleteNode = async (nodeId: string, title: string, xp: number) => {
    try {
      const current = readPlannerSnapshot();
      const nextProgress = { ...current.progress, [nodeId]: true };
      setCompletedNodeIds((prev) => ({ ...prev, [nodeId]: true }));

      await persistPlannerSnapshot({
        ...current,
        progress: nextProgress,
      });

      // Dispatch global unlock event
      window.dispatchEvent(
        new CustomEvent("roadmap-milestone-unlocked", {
          detail: {
            nodeId,
            title,
            xp,
            reason: `Completed via AI Coach directive`,
          },
        }),
      );

      // Add feedback message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `🎉 **Milestone Unlocked:** Marked **${title}** as complete! You earned **+${xp} XP**! Keep up the momentum!`,
        },
      ]);
    } catch (err) {
      console.error("Failed to complete node:", err);
    }
  };

  const handleExecuteLogPR = async (liftName: string, weight: number, reps: number) => {
    try {
      const payload = {
        name: liftName,
        weight,
        reps,
        setType: "WORKING" as const,
      };

      await fetch("/api/lifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {
        // Guest fallback
        const guestPRs = JSON.parse(localStorage.getItem("guestPRs") || "[]");
        const oneRM = weight * (1 + reps / 30);
        localStorage.setItem(
          "guestPRs",
          JSON.stringify([{ ...payload, oneRM, date: new Date().toISOString() }, ...guestPRs]),
        );
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `✅ Successfully recorded PR of **${weight}kg × ${reps}** on **${liftName}**!`,
        },
      ]);
    } catch (err) {
      console.error("Failed to log PR:", err);
    }
  };

  const sendMessage = async (overridePrompt?: string) => {
    const textToSend = (overridePrompt || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", isStreaming: true },
    ]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          context: {
            goal: context.goal,
            PRs: context.PRs,
            unlockedNodes: context.unlockedNodes,
            bodyweight: context.bodyweight,
          },
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("AUTH_REQUIRED");
        }
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullContent += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: fullContent } : m,
                  ),
                );
              }
            } catch {}
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m,
        ),
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  error instanceof Error && error.message === "AUTH_REQUIRED"
                    ? "Please sign in to use AI Coach, or ask general questions."
                    : "Sorry, I had trouble connecting. Please try again.",
                isStreaming: false,
              }
            : m,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating FAB */}
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center justify-center transition-all",
          isOpen
            ? "bg-zinc-800 text-zinc-300 border border-white/10"
            : "bg-cyan-500 hover:bg-cyan-400 text-black border border-cyan-400 font-bold",
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] z-40"
          >
            <div className="bg-[#0b0b14]/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col h-[520px]">
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/[0.02]">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-cyan-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-white text-sm flex items-center gap-1.5">
                    <span>AI Strength Copilot</span>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-[11px] text-[#8e8ea6] font-mono truncate">
                    Roadmap Sync & Gemini Intelligence
                  </div>
                </div>
                <button
                  onClick={onToggle}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const { cleanContent, actions } = extractActions(message.content);

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex flex-col space-y-2",
                        message.role === "user" ? "items-end" : "items-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[90%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed",
                          message.role === "user"
                            ? "bg-cyan-500 text-black font-medium shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                            : "bg-white/[0.04] border border-white/10 text-zinc-200",
                        )}
                      >
                        <div className="prose prose-invert prose-xs max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="m-0 mb-1 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="m-0 my-1 pl-4 list-disc space-y-0.5">{children}</ul>,
                              li: ({ children }) => <li className="m-0">{children}</li>,
                              strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                            }}
                          >
                            {cleanContent}
                          </ReactMarkdown>
                        </div>
                        {message.isStreaming && <span className="typewriter-cursor" />}
                      </div>

                      {/* Interactive Action Cards */}
                      {actions.length > 0 && (
                        <div className="w-full max-w-[90%] space-y-1.5 pt-1">
                          {actions.map((action, aIdx) => {
                            if (action.type === "COMPLETE_NODE" && action.nodeId) {
                              const isDone = completedNodeIds[action.nodeId];

                              return (
                                <div
                                  key={aIdx}
                                  className="flex items-center justify-between p-2.5 rounded-xl border border-green-500/30 bg-green-500/10 text-xs text-white"
                                >
                                  <div className="min-w-0 pr-2">
                                    <div className="font-bold text-green-300 truncate">
                                      {action.title}
                                    </div>
                                    <span className="font-mono text-[10px] text-amber-400">
                                      +{action.xp} XP Bounty
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleExecuteCompleteNode(
                                        action.nodeId!,
                                        action.title!,
                                        action.xp!,
                                      )
                                    }
                                    disabled={isDone}
                                    className={cn(
                                      "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition font-mono shrink-0",
                                      isDone
                                        ? "bg-green-500/20 text-green-300 cursor-default"
                                        : "bg-green-500 hover:bg-green-400 text-black",
                                    )}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {isDone ? "Completed" : "Complete"}
                                  </button>
                                </div>
                              );
                            }

                            if (action.type === "CALCULATE_PLATES") {
                              return (
                                <Link
                                  key={aIdx}
                                  href={`/tools/plate-calculator`}
                                  className="flex items-center justify-between p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs text-white transition"
                                >
                                  <div className="flex items-center gap-2">
                                    <Dumbbell className="w-4 h-4 text-cyan-300" />
                                    <span className="font-bold text-cyan-200">
                                      Load {action.weight} {action.unit} on Barbell
                                    </span>
                                  </div>
                                  <span className="font-mono text-[10px] text-cyan-300">
                                    Open Loader →
                                  </span>
                                </Link>
                              );
                            }

                            if (action.type === "LOG_PR" && action.liftName) {
                              return (
                                <div
                                  key={aIdx}
                                  className="flex items-center justify-between p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-white"
                                >
                                  <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-amber-400" />
                                    <div>
                                      <span className="font-bold text-amber-200">
                                        Log PR: {action.weight}kg × {action.reps}
                                      </span>
                                      <div className="text-[10px] text-zinc-400">
                                        {action.liftName}
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleExecuteLogPR(
                                        action.liftName!,
                                        action.weight!,
                                        action.reps!,
                                      )
                                    }
                                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs"
                                  >
                                    Save PR
                                  </button>
                                </div>
                              );
                            }

                            if (action.type === "OPEN_ROADMAP") {
                              return (
                                <Link
                                  key={aIdx}
                                  href="/roadmap"
                                  className="flex items-center justify-between p-2 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-xs text-white transition"
                                >
                                  <div className="flex items-center gap-2">
                                    <Compass className="w-3.5 h-3.5 text-purple-300" />
                                    <span className="font-bold text-purple-200">
                                      View Phase in Roadmap
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono text-purple-300">
                                    View →
                                  </span>
                                </Link>
                              );
                            }

                            return null;
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Starter Prompt Chips */}
              {messages.length <= 2 && (
                <div className="px-4 py-2 border-t border-white/5 bg-white/[0.01] flex flex-wrap gap-1.5">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="text-[10px] font-mono text-zinc-400 bg-white/[0.03] hover:bg-white/[0.08] hover:text-cyan-300 border border-white/5 rounded-md px-2 py-1 transition text-left"
                    >
                      {prompt} →
                    </button>
                  ))}
                </div>
              )}

              {/* Input Bar */}
              <div className="p-3 border-t border-white/10 bg-white/[0.02]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ask AI Coach..."
                    disabled={isLoading}
                    className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 disabled:opacity-50"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    className="p-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-black font-bold rounded-xl transition flex items-center justify-center"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
