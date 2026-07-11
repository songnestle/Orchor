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

const rarityColors: Record<Rarity, string> = {
  Common: "#64748B",
  Rare: "#3B82F6",
  Epic: "#8B5CF6",
  Legendary: "#F59E0B",
  Mythic: "#EC4899",
};

const rarityGradients: Record<Rarity, string> = {
  Common: "from-slate-500 to-slate-600",
  Rare: "from-blue-500 to-blue-600",
  Epic: "from-purple-500 to-purple-600",
  Legendary: "from-amber-500 to-amber-600",
  Mythic: "from-pink-500 to-fuchsia-600",
};

// Category-based gradients
function getCategoryGradient(category: string, rarity: Rarity): string {
  const baseGradients: Record<string, string> = {
    "Research": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "Product": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "Marketing": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "Automation": "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "Web3 Dev": "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "Data": "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  };

  // Enhance with rarity overlay
  const rarityOverlay = rarity === "Mythic" ? ", rgba(236, 72, 153, 0.3)" :
                        rarity === "Legendary" ? ", rgba(245, 158, 11, 0.2)" :
                        rarity === "Epic" ? ", rgba(139, 92, 246, 0.2)" : "";

  return baseGradients[category] || baseGradients["Research"];
}

// Category icons
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    "Research": "🔬",
    "Product": "🚀",
    "Marketing": "📢",
    "Automation": "⚙️",
    "Web3 Dev": "⛓️",
    "Data": "📊",
  };
  return icons[category] || "✨";
}

export function PremiumSkillCard({ skill, onClick, onRun, onCollect }: PremiumSkillCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const rarityColor = rarityColors[skill.rarity];
  const rarityGradient = rarityGradients[skill.rarity];

  return (
    <motion.div
      className="relative w-[280px] h-[400px] perspective-1000"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of Card */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden cursor-pointer"
          style={{
            backfaceVisibility: "hidden",
            boxShadow: isHovered
              ? `0 20px 60px ${rarityColor}66`
              : `0 10px 30px ${rarityColor}33`,
          }}
        >
          {/* Holographic Border */}
          <div className="holo-border w-full h-full">
            <div className="relative w-full h-full bg-gradient-to-br from-[#13141A] to-[#0A0B0F] rounded-2xl overflow-hidden">

              {/* Rarity Badge */}
              <div className="absolute top-3 right-3 z-10">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${rarityGradient} shadow-lg`}
                  style={{
                    boxShadow: `0 0 20px ${rarityColor}66`,
                  }}
                >
                  {skill.rarity}
                </div>
              </div>

              {/* Card Artwork */}
              <div className="relative w-full h-[160px] overflow-hidden bg-gradient-to-br from-violet-900/40 to-cyan-900/40">
                {/* Generated image */}
                <img
                  src={`/skills/skill-${skill.id}.png`}
                  alt={skill.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    // If the PNG is missing, hide the broken image so the
                    // gradient fallback behind it shows instead.
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />

                {/* Shimmer effect */}
                {isHovered && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                  />
                )}

                {/* Mythic particles */}
                {skill.rarity === "Mythic" && (
                  <div className="absolute inset-0">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-pink-400 rounded-full"
                        style={{
                          left: `${20 + i * 15}%`,
                          bottom: 0,
                        }}
                        animate={{
                          y: [-100, -120],
                          x: [0, 20],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Category badge */}
                <div className="absolute bottom-2 left-2">
                  <div className="px-2 py-1 rounded-md text-xs font-semibold bg-black/60 backdrop-blur-sm text-white border border-white/10">
                    {skill.category}
                  </div>
                </div>
              </div>

              {/* Card Info */}
              <div className="p-4 space-y-3">
                {/* Skill Name */}
                <h3 className="text-lg font-bold text-white font-display line-clamp-2 leading-tight">
                  {skill.title}
                </h3>

                {/* Creator */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500" />
                  <span className="text-xs text-gray-400">@{skill.creatorHandle}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-white font-semibold">{skill.rating}</span>
                  </div>
                  <div className="text-gray-400">
                    {skill.usageCount.toLocaleString()} runs
                  </div>
                </div>

                {/* Attributes */}
                <div className="space-y-1.5">
                  {[
                    { label: "Speed", value: 8 },
                    { label: "Power", value: 9 },
                    { label: "Cost", value: 6 },
                  ].map((attr) => (
                    <div key={attr.label} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-12">{attr.label}</span>
                      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${rarityGradient}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${attr.value * 10}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                      <span className="text-xs text-white font-mono">{attr.value}/10</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRun?.();
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
                >
                  Run
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCollect?.();
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white text-xs font-bold border border-white/20 hover:bg-white/20 transition-all"
                >
                  Collect
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back of Card (Stats) */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: `0 20px 60px ${rarityColor}66`,
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-[#13141A] to-[#0A0B0F] rounded-2xl p-6 flex flex-col justify-center">
            <h4 className="text-lg font-bold text-white mb-4 font-display">Card Stats</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Energy Cost:</span>
                <span className="text-white font-bold">{skill.energyCost} ⚡</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Runs:</span>
                <span className="text-white font-bold">{skill.usageCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rating:</span>
                <span className="text-white font-bold">{skill.rating} ⭐</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Origin:</span>
                <span className="text-white font-bold">{skill.origin}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Flip indicator */}
      <button
        className="absolute bottom-2 right-2 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white text-xs hover:bg-black/80 transition-all"
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
