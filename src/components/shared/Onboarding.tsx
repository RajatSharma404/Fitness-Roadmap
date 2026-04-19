"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Target, Scale } from "lucide-react";
import { cn } from "@/lib/cn";

interface OnboardingProps {
  isOpen: boolean;
  onComplete: (data: {
    displayName: string;
    goal: "STRENGTH" | "POWERLIFTING" | "BODYBUILDING" | "ATHLETIC";
    bodyweight: number;
    unit: "KG" | "LBS";
  }) => void;
}

const goals = [
  {
    id: "STRENGTH",
    label: "Strength",
    icon: Dumbbell,
    description: "Build overall strength",
  },
  {
    id: "POWERLIFTING",
    label: "Powerlifting",
    icon: Target,
    description: "Compete in SBD",
  },
  {
    id: "BODYBUILDING",
    label: "Bodybuilding",
    icon: Scale,
    description: "Build muscle size",
  },
  {
    id: "ATHLETIC",
    label: "Athletic",
    icon: Target,
    description: "Sports performance",
  },
] as const;

export function Onboarding({ isOpen, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [goal, setGoal] = useState<
    "STRENGTH" | "POWERLIFTING" | "BODYBUILDING" | "ATHLETIC"
  >("STRENGTH");
  const [bodyweight, setBodyweight] = useState("");
  const [unit, setUnit] = useState<"KG" | "LBS">("KG");

  const normalizedName = displayName.trim();
  const parsedBodyweight = Number(bodyweight);
  const isValidBodyweight =
    Number.isFinite(parsedBodyweight) &&
    parsedBodyweight >= 25 &&
    parsedBodyweight <= 400;

  if (!isOpen) return null;

  const handleComplete = () => {
    onComplete({
      displayName: normalizedName,
      goal,
      bodyweight: isValidBodyweight ? parsedBodyweight : 70,
      unit,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glass rounded-2xl p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Welcome! 🏋️</h2>
              </div>

              <div className="mb-6">
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors",
                        i <= step ? "bg-violet-500" : "bg-zinc-700",
                      )}
                    />
                  ))}
                </div>
              </div>

              {step === 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      What should we call you?
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <button
                    onClick={() => setStep(1)}
                    disabled={!normalizedName}
                    className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
                  >
                    Continue
                  </button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    What&apos;s your primary goal?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {goals.map((g) => {
                      const Icon = g.icon;
                      return (
                        <button
                          key={g.id}
                          onClick={() => setGoal(g.id)}
                          className={cn(
                            "p-4 rounded-xl border transition-all text-left",
                            goal === g.id
                              ? "border-violet-500 bg-violet-500/20"
                              : "border-zinc-700 hover:border-zinc-600",
                          )}
                        >
                          <Icon className="w-6 h-6 text-violet-400 mb-2" />
                          <div className="font-medium text-white">
                            {g.label}
                          </div>
                          <div className="text-xs text-zinc-400">
                            {g.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(0)}
                      className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-3 rounded-lg transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 rounded-lg transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Current Bodyweight
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={bodyweight}
                        onChange={(e) => setBodyweight(e.target.value)}
                        placeholder="70"
                        min={25}
                        max={400}
                        className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                      />
                      <div className="flex rounded-lg overflow-hidden border border-zinc-700">
                        {(["KG", "LBS"] as const).map((u) => (
                          <button
                            key={u}
                            onClick={() => setUnit(u)}
                            className={cn(
                              "px-4 py-3 text-sm font-medium transition-colors",
                              unit === u
                                ? "bg-violet-600 text-white"
                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700",
                            )}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                    {!isValidBodyweight && bodyweight.length > 0 ? (
                      <p className="mt-2 text-xs text-amber-400">
                        Enter a bodyweight between 25 and 400.
                      </p>
                    ) : null}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-3 rounded-lg transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleComplete}
                      disabled={!isValidBodyweight}
                      className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
                    >
                      Complete Setup
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
