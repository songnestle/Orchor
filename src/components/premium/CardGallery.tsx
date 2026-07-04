"use client";

import { motion } from "framer-motion";

interface CardGalleryProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5;
  gap?: "sm" | "md" | "lg";
  animated?: boolean;
}

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
};

const gapClasses = {
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
};

export function CardGallery({
  children,
  columns = 4,
  gap = "md",
  animated = true,
}: CardGalleryProps) {
  return (
    <motion.div
      className={`grid ${columnClasses[columns]} ${gapClasses[gap]}`}
      initial={animated ? { opacity: 0 } : undefined}
      animate={animated ? { opacity: 1 } : undefined}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
