"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAllSkills } from "@/lib/useAllSkills";
import { PremiumSkillCard } from "@/components/premium/PremiumSkillCard";

export default function ProfilePage() {
  const allSkills = useAllSkills();
  const [tab, setTab] = useState<"created" | "collected" | "stats">("created");

  // Mock creator data
  const creator = {
    handle: "nestle",
    name: "Nestle",
    avatar: "🎨",
    bio: "Building the future of AI skill economy",
    followers: 1234,
    following: 567,
    totalEarnings: 45.67,
    totalRuns: 89012,
  };

  const createdSkills = allSkills.slice(0, 8);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-bg/80 border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold gradient-text font-display">
            Creator Profile
          </h1>
        </div>
      </div>

      {/* Profile Card */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="glass-strong rounded-3xl p-8 mb-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-6xl">
              {creator.avatar}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{creator.name}</h2>
              <p className="text-violet-400 text-lg mb-4">@{creator.handle}</p>
              <p className="text-gray-300 mb-6">{creator.bio}</p>

              {/* Stats */}
              <div className="flex gap-6 mb-6">
                <div>
                  <div className="text-2xl font-bold text-white">{creator.followers.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{creator.following.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Following</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{creator.totalEarnings} ETH</div>
                  <div className="text-sm text-gray-400">Total Earnings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{creator.totalRuns.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Total Runs</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="px-6 py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-all">
                  Follow
                </button>
                <button className="px-6 py-3 rounded-xl glass text-white font-bold hover:bg-white/10 transition-all">
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          {[
            { key: "created", label: "Created" },
            { key: "collected", label: "Collected" },
            { key: "stats", label: "Stats" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-6 py-3 font-semibold transition-all ${
                tab === t.key
                  ? "text-violet-400 border-b-2 border-violet-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "created" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {createdSkills.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PremiumSkillCard skill={skill} onClick={() => {}} />
              </motion.div>
            ))}
          </div>
        )}

        {tab === "collected" && (
          <div className="text-center py-20 text-gray-400">
            No collected cards yet
          </div>
        )}

        {tab === "stats" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-strong rounded-xl p-6">
              <div className="text-4xl mb-3">📊</div>
              <div className="text-2xl font-bold text-white mb-2">
                {createdSkills.length}
              </div>
              <div className="text-sm text-gray-400">Skills Created</div>
            </div>
            <div className="glass-strong rounded-xl p-6">
              <div className="text-4xl mb-3">⚡</div>
              <div className="text-2xl font-bold text-white mb-2">
                {createdSkills.reduce((sum, s) => sum + s.usageCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Runs</div>
            </div>
            <div className="glass-strong rounded-xl p-6">
              <div className="text-4xl mb-3">💰</div>
              <div className="text-2xl font-bold text-white mb-2">
                {creator.totalEarnings} ETH
              </div>
              <div className="text-sm text-gray-400">Total Revenue</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
