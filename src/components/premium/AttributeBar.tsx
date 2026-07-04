"use client";

import { motion } from "framer-motion";

interface AttributeBarProps {
  label: string;
  value: number; // 0-10
  maxValue?: number;
  color?: "violet" | "blue" | "green" | "amber" | "red";
  showValue?: boolean;
  animated?: boolean;
}

const colorClasses = {
  violet: "from-violet-500 to-fuchsia-500",
  blue: "from-blue-500 to-cyan-500",
  green: "from-green-500 to-emerald-500",
  amber: "from-amber-500 to-orange-500",
  red: "from-red-500 to-rose-500",
};

export function AttributeBar({
  label,
  value,
  maxValue = 10,
  color = "violet",
  showValue = true,
  animated = true,
}: AttributeBarProps) {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="flex items-center gap-2">
      {/* Label */}
      <span className="text-xs text-gray-400 w-16 flex-shrink-0">
        {label}
      </span>

      {/* Bar container */}
      <div className="flex-1 h-2 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div
          className={`h-full bg-gradient-to-r ${colorClasses[color]} relative`}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        </motion.div>
      </div>

      {/* Value */}
      {showValue && (
        <span className="text-xs text-white font-mono w-10 text-right flex-shrink-0">
          {value}/{maxValue}
        </span>
      )}
    </div>
  );
}
