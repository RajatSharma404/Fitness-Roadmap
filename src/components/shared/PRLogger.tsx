"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Dumbbell } from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/cn";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-32 bg-zinc-800/50 rounded-lg flex items-center justify-center">
      <span className="text-zinc-500">Loading editor...</span>
    </div>
  ),
});

interface PRLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    weight: number;
    reps: number;
    setType: "WORKING" | "MAX_EFFORT" | "COMPETITION";
    notes?: string;
    videoUrl?: string;
  }) => void;
}

const lifts = [
  { id: "squat", label: "Squat" },
  { id: "bench", label: "Bench Press" },
  { id: "deadlift", label: "Deadlift" },
  { id: "ohp", label: "Overhead Press" },
  { id: "barbell_row", label: "Barbell Row" },
];

export function PRLogger({ isOpen, onClose, onSave }: PRLoggerProps) {
  const [lift, setLift] = useState("squat");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [setType, setSetType] = useState<
    "WORKING" | "MAX_EFFORT" | "COMPETITION"
  >("WORKING");
  const [notes, setNotes] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [vimMode, setVimMode] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customLift, setCustomLift] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate estimated 1RM
  const estimated1RM =
    weight && reps ? parseFloat(weight) * (1 + parseInt(reps) / 30) : 0;

  const handleSave = async () => {
    if (!weight || !reps) return;

    setIsSubmitting(true);
    await onSave({
      name: showCustom ? customLift : lift,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      setType,
      notes,
      videoUrl: videoUrl || undefined,
    });
    setIsSubmitting(false);

    // Reset form
    setWeight("");
    setReps("");
    setNotes("");
    setVideoUrl("");
    setShowCustom(false);
    setCustomLift("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50"
          >
            <div className="h-full bg-zinc-900 border-l border-zinc-800 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Log PR</h2>
                    <p className="text-sm text-zinc-400">
                      Record your personal record
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Lift Selection */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-3">
                    Exercise
                  </label>
                  {!showCustom ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {lifts.map((l) => (
                          <button
                            key={l.id}
                            onClick={() => setLift(l.id)}
                            className={cn(
                              "px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left",
                              lift === l.id
                                ? "bg-violet-600 text-white"
                                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
                            )}
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowCustom(true)}
                        className="w-full py-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        + Custom Lift
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={customLift}
                        onChange={(e) => setCustomLift(e.target.value)}
                        placeholder="Enter lift name"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                      />
                      <button
                        onClick={() => {
                          setShowCustom(false);
                          setCustomLift("");
                        }}
                        className="text-sm text-zinc-400 hover:text-zinc-300"
                      >
                        ← Back to list
                      </button>
                    </div>
                  )}
                </div>

                {/* Weight & Reps */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Weight
                    </label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="0"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Reps
                    </label>
                    <input
                      type="number"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      placeholder="1"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                {/* Estimated 1RM */}
                {estimated1RM > 0 && (
                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <div className="text-sm text-cyan-400 mb-1">
                      Estimated 1RM (Epley)
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {estimated1RM.toFixed(1)}
                    </div>
                  </div>
                )}

                {/* Set Type */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Set Type
                  </label>
                  <div className="flex rounded-lg overflow-hidden border border-zinc-700">
                    {(["WORKING", "MAX_EFFORT", "COMPETITION"] as const).map(
                      (type) => (
                        <button
                          key={type}
                          onClick={() => setSetType(type)}
                          className={cn(
                            "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                            setType === type
                              ? "bg-violet-600 text-white"
                              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700",
                          )}
                        >
                          {type.replace("_", " ")}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Video URL (optional)
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-zinc-300">
                      Notes
                    </label>
                    <button
                      onClick={() => setVimMode(!vimMode)}
                      className={cn(
                        "text-xs px-2 py-1 rounded transition-colors",
                        vimMode
                          ? "bg-violet-500/20 text-violet-400"
                          : "bg-zinc-800 text-zinc-400",
                      )}
                    >
                      Vim {vimMode ? "ON" : "OFF"}
                    </button>
                  </div>
                  <div className="h-32 border border-zinc-700 rounded-lg overflow-hidden">
                    <Editor
                      value={notes}
                      onChange={(value) => setNotes(value || "")}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        lineNumbers: "off",
                        folding: false,
                        lineDecorationsWidth: 0,
                        lineNumbersMinChars: 0,
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        fontFamily: "Geist Mono, monospace",
                        wordWrap: "on",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-zinc-800 space-y-3">
                <button
                  onClick={handleSave}
                  disabled={!weight || !reps || isSubmitting}
                  className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
                >
                  {isSubmitting ? "Saving..." : "Save PR"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
