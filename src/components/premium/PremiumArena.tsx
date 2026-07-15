"use client";

import { motion } from "framer-motion";
import { PremiumSkillCard } from "./PremiumSkillCard";
import type { SkillModule } from "@/lib/skills";

interface PremiumArenaProps {
  skills: SkillModule[];
  onSkillClick?: (skill: SkillModule) => void;
  onSkillRun?: (skill: SkillModule) => void;
  onSkillCollect?: (skill: SkillModule) => void;
}

export function PremiumArena({
  skills,
  onSkillClick,
  onSkillRun,
  onSkillCollect,
}: PremiumArenaProps) {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <motion.div
        className="relative py-20 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="w-2 h-2 rounded-full bg-[#bf5b4b] animate-pulse" />
            <span className="text-sm text-gray-300 font-semibold">
              Season 01 · AI Skill Runtime Economy
            </span>
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 gradient-text font-display">
            Skill Card Arena
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Collect, trade, and deploy executable AI expertise cards.<br />
            Build your deck. Battle with skills.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="glass px-6 py-3 rounded-xl">
              <div className="text-2xl font-bold text-white mb-1">
                {skills.length}
              </div>
              <div className="text-gray-400">Skills</div>
            </div>
            <div className="glass px-6 py-3 rounded-xl">
              <div className="text-2xl font-bold text-white mb-1">
                {skills.reduce((sum, s) => sum + s.usageCount, 0).toLocaleString()}
              </div>
              <div className="text-gray-400">Total Runs</div>
            </div>
            <div className="glass px-6 py-3 rounded-xl">
              <div className="text-2xl font-bold text-white mb-1">
                4.7⭐
              </div>
              <div className="text-gray-400">Avg Rating</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Featured Section */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white font-display">
            🔥 Trending Skills
          </h2>
          <button className="text-[#d6a44c] hover:text-[#f0d493] font-semibold text-sm transition-colors">
            View All →
          </button>
        </div>

        {/* Horizontal scroll for featured cards */}
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {skills.slice(0, 5).map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0"
            >
              <PremiumSkillCard
                skill={skill}
                onClick={() => onSkillClick?.(skill)}
                onRun={() => onSkillRun?.(skill)}
                onCollect={() => onSkillCollect?.(skill)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Card Gallery */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white font-display">
            All Skills
          </h2>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <select className="px-4 py-2 rounded-lg glass text-white text-sm font-semibold cursor-pointer hover:bg-white/10 transition-all">
              <option>All Categories</option>
              <option>Research</option>
              <option>Web3 Dev</option>
              <option>Product</option>
              <option>Marketing</option>
            </select>

            <select className="px-4 py-2 rounded-lg glass text-white text-sm font-semibold cursor-pointer hover:bg-white/10 transition-all">
              <option>All Rarities</option>
              <option>Common</option>
              <option>Rare</option>
              <option>Epic</option>
              <option>Legendary</option>
              <option>Mythic</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <PremiumSkillCard
                skill={skill}
                onClick={() => onSkillClick?.(skill)}
                onRun={() => onSkillRun?.(skill)}
                onCollect={() => onSkillCollect?.(skill)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
