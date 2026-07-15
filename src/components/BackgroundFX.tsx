"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

export function BackgroundFX() {
  // warm floating dust motes (square pixels, low opacity) — replaces neon particles
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => {
        const seed = i + 1;
        const r = (seed * 9301 + 49297) % 233280;
        const rand = r / 233280;
        const r2 = ((seed + 5) * 9301 + 49297) % 233280;
        const rand2 = r2 / 233280;
        const r3 = ((seed + 11) * 9301 + 49297) % 233280;
        const rand3 = r3 / 233280;
        return {
          id: i,
          x: rand * 100,
          y: rand2 * 100,
          size: 2 + Math.round(rand3 * 2), // 2–4px hard pixels
          duration: 10 + rand * 16,
          delay: rand2 * 6,
          hue: rand3 > 0.5 ? "rgba(214,164,76,0.35)" : "rgba(122,148,80,0.28)",
        };
      }),
    []
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* soft warm corner lights (very subtle, no neon) */}
      <div
        className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(closest-side, rgba(214,164,76,0.30), transparent 70%)" }}
      />
      <div
        className="absolute -top-20 right-0 h-[460px] w-[460px] rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(closest-side, rgba(122,148,80,0.24), transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(closest-side, rgba(191,91,75,0.22), transparent 70%)" }}
      />

      {/* warm hairline grid */}
      <div className="absolute inset-0 grid-bg opacity-50" />

      {/* CRT scanlines across the whole viewport */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* dust motes */}
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
          }}
          animate={{
            y: [0, -18, 0, 14, 0],
            opacity: [0.15, 0.7, 0.3, 0.6, 0.15],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </div>
  );
}
