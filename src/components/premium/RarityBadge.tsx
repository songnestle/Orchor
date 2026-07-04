"use client";

import { motion } from "framer-motion";
import type { Rarity } from "@/lib/rarity";

interface RarityBadgeProps {
  rarity: Rarity;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const rarityConfig: Record<Rarity, {
  gradient: string;
  glow: string;
  shimmer: boolean;
}> = {
  Common: {
    gradient: "from-slate-500 to-slate-600",
    glow: "shadow-slate-500/30",
    shimmer: false,
  },
  Rare: {
    gradient: "from-blue-500 to-blue-600",
    glow: "shadow-blue-500/40",
    shimmer: true,
  },
  Epic: {
    gradient: "from-purple-500 to-purple-600",
    glow: "shadow-purple-500/50",
    shimmer: true,
  },
  Legendary: {
    gradient: "from-amber-500 to-amber-600",
    glow: "shadow-amber-500/60",
    shimmer: true,
  },
  Mythic: {
    gradient: "from-pink-500 via-fuchsia-500 to-purple-600",
    glow: "shadow-fuchsia-500/70",
    shimmer: true,
  },
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

export function RarityBadge({ rarity, size = "md", animated = true }: RarityBadgeProps) {
  const config = rarityConfig[rarity];

  return (
    <motion.div
      className={`
        relative inline-flex items-center justify-center
        rounded-full font-bold text-white
        bg-gradient-to-r ${config.gradient}
        ${sizeClasses[size]}
        ${config.glow}
      `}
      initial={animated ? { scale: 0, opacity: 0 } : undefined}
      animate={animated ? { scale: 1, opacity: 1 } : undefined}
      whileHover={animated ? { scale: 1.05 } : undefined}
      style={{
        boxShadow: `0 0 20px ${rarityConfig[rarity].glow}`,
      }}
    >
      {/* Shimmer effect for rare+ cards */}
      {config.shimmer && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ["-200%", "200%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />
      )}

      {/* Mythic particle effect */}
      {rarity === "Mythic" && (
        <motion.div
          className="absolute -inset-1"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          style={{
            background: "radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)",
          }}
        />
      )}

      <span className="relative z-10">{rarity}</span>
    </motion.div>
  );
}
