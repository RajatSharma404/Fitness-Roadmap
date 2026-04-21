"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "violet" | "cyan" | "emerald" | "amber";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = "violet",
}: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const colorClasses = {
    violet: {
      bg: "bg-violet-500/20",
      icon: "text-violet-400",
      border: "border-violet-500/30",
      glow: "shadow-violet-500/20",
    },
    cyan: {
      bg: "bg-cyan-500/20",
      icon: "text-cyan-400",
      border: "border-cyan-500/30",
      glow: "shadow-cyan-500/20",
    },
    emerald: {
      bg: "bg-emerald-500/20",
      icon: "text-emerald-400",
      border: "border-emerald-500/30",
      glow: "shadow-emerald-500/20",
    },
    amber: {
      bg: "bg-amber-500/20",
      icon: "text-amber-400",
      border: "border-amber-500/30",
      glow: "shadow-amber-500/20",
    },
  };

  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const percentX = (e.clientX - centerX) / (rect.width / 2);
    const percentY = (e.clientY - centerY) / (rect.height / 2);

    setTilt({
      rotateX: -percentY * 8,
      rotateY: percentX * 8,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "glass rounded-2xl p-6 transition-shadow duration-300",
        isHovered && `shadow-lg ${colorClasses[color].glow}`,
        colorClasses[color].border,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-white">{value}</h3>
            {trend && trendValue && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trend === "up"
                    ? "text-emerald-400"
                    : trend === "down"
                      ? "text-red-400"
                      : "text-zinc-400",
                )}
              >
                {trend === "up" && "↑"}
                {trend === "down" && "↓"}
                {trendValue}
              </span>
            )}
          </div>
          {subtitle && <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>}
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            colorClasses[color].bg,
          )}
        >
          <Icon className={cn("w-6 h-6", colorClasses[color].icon)} />
        </div>
      </div>
    </motion.div>
  );
}
