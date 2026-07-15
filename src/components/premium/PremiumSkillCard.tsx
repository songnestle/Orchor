"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { SkillModule } from "@/lib/skills";
import type { Rarity } from "@/lib/rarity";

interface PremiumSkillCardProps {
  skill: SkillModule;
  onClick?: () => void;
  onRun?: () => void;
  onCollect?: () => void;
}

// Retro "aged cartridge" rarity tints (kept in sync with globals.css)
const rarityColors: Record<Rarity, string> = {
  Common: "#8a7d63",
  Rare: "#5a869c",
  Epic: "#8a6a9c",
  Legendary: "#d6a44c",
  Mythic: "#bf5b4b",
};

// Pixel category glyphs
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Research: "🔬",
    Product: "🚀",
    Marketing: "📢",
    Automation: "⚙️",
    "Web3 Dev": "⛓️",
    Data: "📊",
  };
  return icons[category] || "✨";
}

export function PremiumSkillCard({ skill, onClick, onRun, onCollect }: PremiumSkillCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rarityColor = rarityColors[skill.rarity];

  const attrs = [
    { label: "SPD", value: 8 },
    { label: "PWR", value: 9 },
    { label: "COST", value: 6 },
  ];

  return (
    <motion.div
      className="relative w-[280px] h-[400px]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      style={{ perspective: "1200px" }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ---------- Front ---------- */}
        <div
          className="retro-card absolute inset-0 flex flex-col cursor-pointer"
          data-rarity={skill.rarity}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* name plate */}
          <div className="retro-plate flex items-center justify-between gap-2 px-3 py-2.5">
            <div className="retro-name text-[9px] leading-[1.4] line-clamp-2">{skill.title}</div>
            <div
              className="retro-badge shrink-0 px-1.5 py-1 text-[7px]"
              data-rarity={skill.rarity}
            >
              {skill.rarity.toUpperCase()}
            </div>
          </div>

          {/* art window */}
          <div className="retro-art mx-2.5 mt-2.5 h-[150px]">
            <img
              src={`/skills/skill-${skill.id}.png`}
              alt={skill.title}
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            {/* category chip */}
            <div className="absolute bottom-1.5 left-1.5 z-[2]">
              <span className="font-pixel text-[6px] px-1.5 py-1 bg-black/70 text-cream border border-black/60"
                style={{ color: "var(--r-cream)" }}>
                {getCategoryIcon(skill.category)} {skill.category.toUpperCase()}
              </span>
            </div>
          </div>

          {/* body */}
          <div className="flex-1 flex flex-col px-3 pt-2.5 pb-3">
            {/* creator + rating */}
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-retro text-[15px]" style={{ color: "var(--r-ink)" }}>
                @{skill.creatorHandle}
              </span>
              <span className="font-retro text-[15px]" style={{ color: "var(--r-gold)" }}>
                ★ {skill.rating}
              </span>
            </div>

            {/* attribute bars */}
            <div className="flex flex-col gap-1.5 mb-2.5">
              {attrs.map((a) => (
                <div key={a.label} className="flex items-center gap-2">
                  <span className="font-pixel text-[6px] w-8" style={{ color: "var(--r-ink-dim)" }}>
                    {a.label}
                  </span>
                  <div className="retro-bar flex-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className={`retro-bar__seg ${i < a.value ? "on" : ""}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* runs + cost */}
            <div className="flex items-center justify-between mb-2.5 mt-auto">
              <span className="font-retro text-[15px]" style={{ color: "var(--r-ink-dim)" }}>
                {skill.usageCount.toLocaleString()} runs
              </span>
              <span className="font-retro text-[16px]" style={{ color: "var(--r-ink)" }}>
                <b style={{ color: "var(--r-gold)" }}>{skill.energyCost * 10}</b> cr
              </span>
            </div>

            {/* actions */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRun?.();
                }}
                className="retro-btn flex-1 py-2 text-[8px]"
              >
                RUN
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCollect?.();
                }}
                className="retro-btn retro-btn--ghost flex-1 py-2 text-[8px]"
              >
                COLLECT
              </button>
            </div>
          </div>
        </div>

        {/* ---------- Back (stats) ---------- */}
        <div
          className="retro-card absolute inset-0 flex flex-col justify-center px-6"
          data-rarity={skill.rarity}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="font-pixel text-[11px] mb-5" style={{ color: "var(--r-gold)" }}>
            CARD STATS
          </div>
          <div className="flex flex-col gap-3.5 font-retro text-[17px]">
            {[
              ["ENERGY", `${skill.energyCost} ⚡`],
              ["RUNS", skill.usageCount.toLocaleString()],
              ["RATING", `${skill.rating} ★`],
              ["ORIGIN", skill.origin],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-dashed pb-1"
                style={{ borderColor: "var(--r-line)" }}>
                <span style={{ color: "var(--r-ink-dim)" }}>{k}</span>
                <span style={{ color: "var(--r-cream)" }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 font-pixel text-[7px]" style={{ color: rarityColor }}>
            ◆ {skill.rarity.toUpperCase()} ◆
          </div>
        </div>
      </motion.div>

      {/* flip toggle */}
      <button
        className="absolute bottom-1.5 right-1.5 z-20 w-7 h-7 flex items-center justify-center font-pixel text-[9px]"
        style={{
          background: "var(--r-panel)",
          color: "var(--r-cream)",
          border: "2px solid var(--r-line-strong)",
          borderRadius: 3,
        }}
        onClick={(e) => {
          e.stopPropagation();
          setIsFlipped(!isFlipped);
        }}
      >
        ↻
      </button>
    </motion.div>
  );
}
