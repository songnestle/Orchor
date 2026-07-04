"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PremiumSkillCard } from "@/components/premium/PremiumSkillCard";
import { useAllSkills } from "@/lib/useAllSkills";
import type { SkillModule } from "@/lib/skills";

export default function ExplorePage() {
  const allSkills = useAllSkills();
  const [selected, setSelected] = useState<SkillModule | null>(null);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-bg/80 border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold gradient-text font-display">
            Explore Skills
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allSkills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <PremiumSkillCard
                skill={skill}
                onClick={() => setSelected(skill)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Sidebar - Trending */}
      <div className="fixed right-0 top-20 w-80 h-[calc(100vh-5rem)] overflow-y-auto p-6 glass-strong hidden xl:block">
        <h3 className="text-lg font-bold text-white mb-4">🔥 Trending</h3>
        <div className="space-y-3">
          {["#web3dev", "#research", "#automation", "#data"].map((tag) => (
            <div key={tag} className="p-3 rounded-lg glass hover:bg-white/10 cursor-pointer transition-all">
              <div className="text-violet-400 font-semibold text-sm">{tag}</div>
              <div className="text-xs text-gray-400 mt-1">2.4k posts</div>
            </div>
          ))}
        </div>

        <h3 className="text-lg font-bold text-white mt-8 mb-4">⭐ Top Creators</h3>
        <div className="space-y-3">
          {allSkills.slice(0, 5).map((skill) => (
            <div key={skill.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">@{skill.creatorHandle}</div>
                <div className="text-xs text-gray-400">{skill.usageCount} runs</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
