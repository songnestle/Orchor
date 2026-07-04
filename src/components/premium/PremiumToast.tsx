"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface PremiumToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const typeConfig = {
  success: {
    icon: "✓",
    gradient: "from-green-500 to-emerald-500",
    glow: "shadow-green-500/50",
  },
  error: {
    icon: "✕",
    gradient: "from-red-500 to-rose-500",
    glow: "shadow-red-500/50",
  },
  info: {
    icon: "ⓘ",
    gradient: "from-blue-500 to-cyan-500",
    glow: "shadow-blue-500/50",
  },
  warning: {
    icon: "⚠",
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/50",
  },
};

export function PremiumToast({
  message,
  type = "info",
  isVisible,
  onClose,
  duration = 3000,
}: PremiumToastProps) {
  const config = typeConfig[type];

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 right-4 z-50"
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl
              bg-gradient-to-r ${config.gradient}
              ${config.glow}
              backdrop-blur-sm border border-white/10
              min-w-[300px] max-w-[400px]
            `}
            style={{
              boxShadow: `0 0 30px ${config.glow}`,
            }}
          >
            {/* Icon */}
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
              {config.icon}
            </div>

            {/* Message */}
            <p className="flex-1 text-sm font-semibold text-white">
              {message}
            </p>

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xs transition-all"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
