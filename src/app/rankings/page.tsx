"use client";

import { useAllSkills } from "@/lib/useAllSkills";

export default function RankingsPage() {
  const allSkills = useAllSkills();
  const sorted = [...allSkills].sort((a, b) => b.usageCount - a.usageCount);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold gradient-text font-display mb-8">
          🏆 Rankings
        </h1>

        <div className="glass-strong rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Skill</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Creator</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Runs</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Price</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((skill, i) => (
                <tr key={skill.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{skill.title}</div>
                    <div className="text-xs text-gray-400">{skill.category}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">@{skill.creatorHandle}</td>
                  <td className="px-6 py-4 text-right font-mono text-white">{skill.usageCount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-mono text-violet-400">{skill.priceMON} ETH</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
