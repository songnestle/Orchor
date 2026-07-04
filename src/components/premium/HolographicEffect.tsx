"use client";

import { motion } from "framer-motion";

interface HolographicEffectProps {
  children: React.ReactNode;
  intensity?: "low" | "medium" | "high";
  animated?: boolean;
}

export function HolographicEffect({
  children,
  intensity = "medium",
  animated = true,
}: HolographicEffectProps) {
  const intensityConfig = {
    low: {
      opacity: 0.3,
      duration: 8,
    },
    medium: {
      opacity: 0.5,
      duration: 6,
    },
    high: {
      opacity: 0.7,
      duration: 4,
    },
  };

  const config = intensityConfig[intensity];

  return (
    <div className="relative">
      {children}

      {animated && (
        <>
          {/* Holographic shimmer overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(
                135deg,
                transparent 0%,
                rgba(124, 58, 237, ${config.opacity}) 25%,
                rgba(34, 211, 238, ${config.opacity * 0.6}) 50%,
                rgba(192, 38, 211, ${config.opacity * 0.8}) 75%,
                transparent 100%
              )`,
              backgroundSize: "200% 200%",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: config.duration,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Moving shine effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut",
            }}
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
              transform: "skewX(-20deg)",
            }}
          />
        </>
      )}
    </div>
  );
}
