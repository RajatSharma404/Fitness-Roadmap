"use client";

import { useState } from "react";
import { Check, Copy, Share2, ShoppingCart, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";

export interface GroceryItem {
  id: string;
  name: string;
  qty: string;
  bucket: "protein" | "carb" | "produce" | "dairy" | "other";
}

interface SmartGroceryListProps {
  groceries: GroceryItem[];
  planTitle?: string;
}

export function SmartGroceryList({ groceries, planTitle = "Weekly Plan" }: SmartGroceryListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const buckets = [
    { key: "protein", label: "🍗 High Protein Sources", items: groceries.filter((g) => g.bucket === "protein") },
    { key: "dairy", label: "🥛 Dairy & Eggs", items: groceries.filter((g) => g.bucket === "dairy") },
    { key: "carb", label: "🌾 Complex Carbs & Atta", items: groceries.filter((g) => g.bucket === "carb") },
    { key: "produce", label: "🥦 Fresh Produce & Veggies", items: groceries.filter((g) => g.bucket === "produce") },
    { key: "other", label: "🥜 Pantry & Healthy Fats", items: groceries.filter((g) => g.bucket === "other") },
  ];

  const handleCopyWhatsApp = () => {
    let text = `🛒 *FitFlow Weekly Grocery List* (${planTitle})\n\n`;

    buckets.forEach((b) => {
      if (b.items.length > 0) {
        text += `*${b.label}:*\n`;
        b.items.forEach((item) => {
          text += `• ${item.name} — ${item.qty}\n`;
        });
        text += "\n";
      }
    });

    text += "Generated with FitFlow Nutrition Planner 💪";

    navigator.clipboard.writeText(text);
    setCopyFeedback("Formatted WhatsApp checklist copied!");
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const completedCount = checkedItems.size;
  const totalCount = groceries.length;

  return (
    <div className="p-5 sm:p-6 rounded-3xl border border-white/10 bg-white/[0.02] space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase font-mono tracking-widest text-cyan-400">
              Kirana & Supermarket Checklist
            </span>
            <h3 className="font-display text-xl font-bold text-white mt-0.5">
              Consolidated Grocery List
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {copyFeedback && (
            <span className="text-xs font-mono text-cyan-400 animate-fade-in">
              {copyFeedback}
            </span>
          )}
          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold text-xs uppercase tracking-wider transition shadow-md font-mono"
          >
            <Share2 className="w-4 h-4" /> Share on WhatsApp
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 font-mono text-xs text-zinc-400">
        <div className="flex justify-between">
          <span>Shopping Progress</span>
          <span className="text-cyan-300 font-bold">
            {completedCount} / {totalCount} items bought
          </span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-400 rounded-full transition-all duration-300"
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Buckets Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {buckets.map((b) => {
          if (b.items.length === 0) return null;

          return (
            <div key={b.key} className="space-y-2.5">
              <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-300">
                {b.label}
              </h5>

              <div className="space-y-1.5">
                {b.items.map((item) => {
                  const isChecked = checkedItems.has(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={cn(
                        "p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between select-none",
                        isChecked
                          ? "bg-green-500/[0.04] border-green-500/30 text-zinc-400"
                          : "bg-white/[0.02] border-white/5 hover:border-white/15 text-white",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-5 h-5 rounded-lg border flex items-center justify-center transition",
                            isChecked
                              ? "bg-green-500 border-green-400 text-black"
                              : "border-white/20 bg-white/5",
                          )}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className={cn("text-sm font-medium", isChecked && "line-through text-zinc-500")}>
                          {item.name}
                        </span>
                      </div>

                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {item.qty}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
