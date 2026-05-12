"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

export function BackgroundFX() {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => {
        const seed = i + 1;
        const r = (seed * 9301 + 49297) % 233280;
        const rand = (r / 233280);
        const r2 = ((seed + 5) * 9301 + 49297) % 233280;
        const rand2 = r2 / 233280;
        const r3 = ((seed + 11) * 9301 + 49297) % 233280;
        const rand3 = r3 / 233280;
        return {
          id: i,
          x: rand * 100,
          y: rand2 * 100,
          size: 1 + rand3 * 3,
          duration: 8 + rand * 14,
          delay: rand2 * 6,
          hue: rand3 > 0.5 ? "rgba(139,92,246,0.5)" : "rgba(34,211,238,0.45)",
        };
      }),
    []
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* big radial glows */}
      <div
        className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full blur-3xl opacity-50"
        style={{
          background:
            "radial-gradient(closest-side, rgba(139,92,246,0.55), transparent 70%)",
        }}
      />
      <div
        className="absolute -top-20 right-0 h-[460px] w-[460px] rounded-full blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(closest-side, rgba(34,211,238,0.45), transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full blur-3xl opacity-30"
        style={{
          background:
            "radial-gradient(closest-side, rgba(244,114,182,0.40), transparent 70%)",
        }}
      />

      {/* subtle grid */}
      <div className="absolute inset-0 grid-bg opacity-60" />

      {/* particles */}
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.hue,
            boxShadow: `0 0 12px ${p.hue}`,
          }}
          animate={{
            y: [0, -22, 0, 18, 0],
            opacity: [0.2, 0.9, 0.4, 0.8, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
