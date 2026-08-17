"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlateDefinition, WeightUnit } from "@/lib/plateCalculator";
import { cn } from "@/lib/cn";

interface VisualBarbellProps {
  platesPerSide: PlateDefinition[];
  barWeight: number;
  totalWeight: number;
  unit: WeightUnit;
  collarWeight?: number;
  className?: string;
}

export const VisualBarbell = memo(function VisualBarbell({
  platesPerSide,
  barWeight,
  totalWeight,
  unit,
  collarWeight = 0,
  className,
}: VisualBarbellProps) {
  // Height scaling: standard 450mm diameter plate = 150px
  const maxPlateHeight = 150;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0e0e17] via-[#090910] to-[#040408] p-6 shadow-2xl flex flex-col items-center justify-center min-h-[300px]",
        className,
      )}
    >
      {/* Header Info Overlay */}
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between pointer-events-none z-10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 font-mono">
            Barbell Loader
          </span>
          <h3 className="text-xl font-bold font-display text-white">
            {totalWeight} {unit}{" "}
            <span className="text-xs font-normal text-zinc-400 font-mono">
              ({barWeight} {unit} bar + {collarWeight > 0 ? `${collarWeight} ${unit} collars + ` : ""}{platesPerSide.reduce((sum, p) => sum + p.weight, 0) * 2} {unit} plates)
            </span>
          </h3>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 font-mono">
            Per Sleeve
          </span>
          <div className="text-sm font-bold font-mono text-amber-400">
            {platesPerSide.reduce((sum, p) => sum + p.weight, 0)} {unit}
          </div>
        </div>
      </div>

      {/* Barbell 2D Rendering Stage */}
      <div className="relative w-full max-w-4xl h-48 flex items-center justify-center mt-6">
        {/* Background Guide Line */}
        <div className="absolute w-full h-px bg-white/5 top-1/2 -translate-y-1/2" />

        {/* Full Barbell Assembly */}
        <div className="relative w-full flex items-center justify-center">
          {/* LEFT SLEEVE PLATES (Reversed order: innermost near center) */}
          <div className="flex items-center justify-end flex-row-reverse h-40 mr-1.5">
            <AnimatePresence mode="popLayout">
              {platesPerSide.map((plate, idx) => {
                const heightPx = Math.max(34, Math.round(maxPlateHeight * plate.diameterRatio));
                const widthPx = Math.max(14, Math.round(24 * plate.widthRatio));

                return (
                  <motion.div
                    key={`left-plate-${idx}-${plate.weight}`}
                    layout
                    initial={{ opacity: 0, scaleY: 0.2, x: -30 }}
                    animate={{ opacity: 1, scaleY: 1, x: 0 }}
                    exit={{ opacity: 0, scaleY: 0.2, x: -20 }}
                    transition={{ type: "spring", damping: 20, stiffness: 220 }}
                    className="relative flex items-center justify-center rounded-sm mx-[1px] shadow-lg group cursor-pointer"
                    style={{
                      height: `${heightPx}px`,
                      width: `${widthPx}px`,
                      backgroundColor: plate.color,
                      border: "1px solid rgba(0, 0, 0, 0.4)",
                      boxShadow: "inset 0 0 4px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0,0,0,0.5)",
                    }}
                  >
                    {/* Ridge Lines */}
                    <div className="absolute inset-x-0 top-1 bottom-1 border-x border-white/20 pointer-events-none" />
                    
                    {/* Vertical Weight Text */}
                    <span
                      className="text-[9px] font-bold font-mono tracking-tighter transform -rotate-90 select-none pointer-events-none"
                      style={{ color: plate.textColor }}
                    >
                      {plate.weight}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Left Collar Clip */}
            {platesPerSide.length > 0 && (
              <div
                className="h-10 w-2.5 bg-zinc-400 border border-zinc-700 rounded-sm ml-0.5 shadow-md flex items-center justify-center"
                title="Collar Clip"
              >
                <div className="h-4 w-1 bg-red-500 rounded-full" />
              </div>
            )}
          </div>

          {/* LEFT SLEEVE STOPPER COLLAR */}
          <div className="h-14 w-3.5 bg-gradient-to-r from-zinc-600 to-zinc-400 border border-zinc-900 rounded-sm shadow-md z-10" />

          {/* CENTER BAR SHAFT (Knurled Steel) */}
          <div className="relative h-4 flex-1 max-w-[280px] bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-400 border-y border-zinc-600 shadow-inner flex items-center justify-between overflow-hidden">
            {/* Knurling Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(#71717a_1px,transparent_1px)] [background-size:3px_3px] opacity-40" />
            
            {/* Center Smooth Ring */}
            <div className="w-10 h-full bg-zinc-300 mx-auto border-x border-zinc-500/50" />

            {/* Left & Right Grip Rings */}
            <div className="absolute left-10 w-1 h-full bg-zinc-500/60" />
            <div className="absolute right-10 w-1 h-full bg-zinc-500/60" />
          </div>

          {/* RIGHT SLEEVE STOPPER COLLAR */}
          <div className="h-14 w-3.5 bg-gradient-to-r from-zinc-400 to-zinc-600 border border-zinc-900 rounded-sm shadow-md z-10" />

          {/* RIGHT SLEEVE PLATES */}
          <div className="flex items-center justify-start h-40 ml-1.5">
            <AnimatePresence mode="popLayout">
              {platesPerSide.map((plate, idx) => {
                const heightPx = Math.max(34, Math.round(maxPlateHeight * plate.diameterRatio));
                const widthPx = Math.max(14, Math.round(24 * plate.widthRatio));

                return (
                  <motion.div
                    key={`right-plate-${idx}-${plate.weight}`}
                    layout
                    initial={{ opacity: 0, scaleY: 0.2, x: 30 }}
                    animate={{ opacity: 1, scaleY: 1, x: 0 }}
                    exit={{ opacity: 0, scaleY: 0.2, x: 20 }}
                    transition={{ type: "spring", damping: 20, stiffness: 220 }}
                    className="relative flex items-center justify-center rounded-sm mx-[1px] shadow-lg group cursor-pointer"
                    style={{
                      height: `${heightPx}px`,
                      width: `${widthPx}px`,
                      backgroundColor: plate.color,
                      border: "1px solid rgba(0, 0, 0, 0.4)",
                      boxShadow: "inset 0 0 4px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0,0,0,0.5)",
                    }}
                  >
                    {/* Ridge Lines */}
                    <div className="absolute inset-x-0 top-1 bottom-1 border-x border-white/20 pointer-events-none" />
                    
                    {/* Vertical Weight Text */}
                    <span
                      className="text-[9px] font-bold font-mono tracking-tighter transform -rotate-90 select-none pointer-events-none"
                      style={{ color: plate.textColor }}
                    >
                      {plate.weight}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Right Collar Clip */}
            {platesPerSide.length > 0 && (
              <div
                className="h-10 w-2.5 bg-zinc-400 border border-zinc-700 rounded-sm mr-0.5 shadow-md flex items-center justify-center"
                title="Collar Clip"
              >
                <div className="h-4 w-1 bg-red-500 rounded-full" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plate Legend / Loading Sequence */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-white/5 w-full">
        <span className="text-[11px] font-mono text-zinc-500 mr-2 uppercase tracking-wider">
          Sleeve Sequence (Inside → Out):
        </span>
        {platesPerSide.length === 0 ? (
          <span className="text-xs font-mono text-zinc-400 italic">
            Empty Bar — No plates needed
          </span>
        ) : (
          platesPerSide.map((plate, index) => (
            <span
              key={`${plate.weight}-${index}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold font-mono border border-white/10"
              style={{ backgroundColor: `${plate.color}22`, color: plate.color === "#f4f4f5" ? "#ffffff" : plate.color }}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: plate.color }}
              />
              {plate.label}
            </span>
          ))
        )}
      </div>
    </div>
  );
});
