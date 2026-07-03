"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface Props {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
}

export function Toast({ message, type = "info", duration = 3000 }: Props) {
  const [isVisible, setIsVisible] = useState(true);

  setTimeout(() => setIsVisible(false), duration);

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  const colors = {
    success: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
    error: "bg-rose-500/20 border-rose-500/30 text-rose-300",
    info: "bg-cyan-500/20 border-cyan-500/30 text-cyan-300",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-[100]"
        >
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md ${colors[type]}`}
          >
            <span className="text-lg">{icons[type]}</span>
            <span className="text-[13px] font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toast Container for managing multiple toasts
let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: Props["type"] }>>([]);

  const showToast = (message: string, type: Props["type"] = "info") => {
    const id = toastId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return { showToast, toasts };
}
