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
    gradient: "from-[#8a7d63] to-[#6f6450]",
    glow: "rgba(138,125,99,0.5)",
    shimmer: false,
  },
  Rare: {
    gradient: "from-[#5a869c] to-[#476b7d]",
    glow: "rgba(90,134,156,0.6)",
    shimmer: true,
  },
  Epic: {
    gradient: "from-[#8a6a9c] to-[#6f547d]",
    glow: "rgba(138,106,156,0.6)",
    shimmer: true,
  },
  Legendary: {
    gradient: "from-[#edc26a] to-[#d6a44c]",
    glow: "rgba(214,164,76,0.7)",
    shimmer: true,
  },
  Mythic: {
    gradient: "from-[#d6a44c] via-[#bf5b4b] to-[#8a6a9c]",
    glow: "rgba(191,91,75,0.7)",
    shimmer: true,
  },
};

const sizeClasses = {
  sm: "px-2 py-1 text-[7px]",
  md: "px-2.5 py-1 text-[8px]",
  lg: "px-3 py-1.5 text-[10px]",
};

export function RarityBadge({ rarity, size = "md", animated = true }: RarityBadgeProps) {
  const config = rarityConfig[rarity];

  return (
    <motion.div
      className={`
        relative inline-flex items-center justify-center
        rounded-[3px] font-pixel tracking-wide text-[#161310]
        bg-gradient-to-r ${config.gradient}
        ${sizeClasses[size]}
      `}
      initial={animated ? { scale: 0, opacity: 0 } : undefined}
      animate={animated ? { scale: 1, opacity: 1 } : undefined}
      whileHover={animated ? { scale: 1.05 } : undefined}
      style={{
        border: "2px solid #161310",
        boxShadow: `2px 2px 0 rgba(0,0,0,0.4)`,
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
            background: "radial-gradient(circle, rgba(191,91,75,0.3) 0%, transparent 70%)",
          }}
        />
      )}

      <span className="relative z-10">{rarity}</span>
    </motion.div>
  );
}
