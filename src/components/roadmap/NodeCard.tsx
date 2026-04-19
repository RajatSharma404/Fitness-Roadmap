"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, Circle } from "lucide-react";
import { Node, NodeProps } from "@xyflow/react";
import { cn } from "@/lib/cn";

interface NodeCardData {
  [key: string]: unknown;
  id: string;
  name: string;
  track: string;
  level: number;
  status: "locked" | "active" | "completed";
  criteriaMet?: boolean;
  description?: string;
  muscles?: string[];
  onClick: () => void;
}

const trackColors: Record<string, string> = {
  BEGINNER: "border-emerald-500",
  INTERMEDIATE: "border-blue-500",
  ADVANCED: "border-violet-500",
  ELITE: "border-amber-500",
};

const trackBgColors: Record<string, string> = {
  BEGINNER: "bg-emerald-500/20",
  INTERMEDIATE: "bg-blue-500/20",
  ADVANCED: "bg-violet-500/20",
  ELITE: "bg-amber-500/20",
};

export function NodeCard({ id, data }: NodeProps<Node<NodeCardData>>) {
  const { name, track, status, criteriaMet, onClick } = data;
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setTilt({
      x: y * -8, // rotateX
      y: x * 8, // rotateY
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-cyan-400" />;
      case "active":
        return <Circle className="w-5 h-5 text-violet-400" />;
      default:
        return <Lock className="w-5 h-5 text-zinc-500" />;
    }
  };

  return (
    <motion.div
      ref={cardRef}
      layoutId={`node-${id}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
      whileHover={{ scale: status === "locked" ? 1 : 1.05 }}
      className={cn(
        "relative w-48 p-4 rounded-xl cursor-pointer transition-all duration-200",
        status === "locked"
          ? "bg-zinc-900/50 border-2 border-zinc-700 opacity-60"
          : status === "completed"
            ? `bg-zinc-900 border-2 ${trackColors[track]} ${trackBgColors[track]}`
            : `bg-zinc-900 border-2 ${trackColors[track]} glow-pulse`,
      )}
    >
      {/* Status indicator */}
      <div className="absolute top-2 right-2">{getStatusIcon()}</div>

      {/* Glassmorphism overlay for locked */}
      {status === "locked" && (
        <div className="absolute inset-0 bg-zinc-900/30 backdrop-blur-[2px] rounded-xl pointer-events-none" />
      )}

      {/* Content */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          {track.toLowerCase()}
        </div>
        <div
          className={cn(
            "font-semibold text-sm leading-tight",
            status === "locked" ? "text-zinc-500" : "text-white",
          )}
        >
          {name}
        </div>
      </div>

      {/* Criteria indicator */}
      {status === "active" && criteriaMet && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900"
        />
      )}
    </motion.div>
  );
}
