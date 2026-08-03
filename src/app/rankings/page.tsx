"use client";

import { useAllSkills } from "@/lib/useAllSkills";
import { useSkillStats } from "@/lib/hooks/useSkillStats";
import { useI18n } from "@/lib/i18n";

export default function RankingsPage() {
  const allSkills = useAllSkills();
  const { t } = useI18n();
  const { stats } = useSkillStats();
  // 排行以链上真实调用数为准。索引未就绪时不假排序 —— 按编号列出并显示破折号。
  const sorted = [...allSkills].sort(
    (a, b) => (stats?.[b.id]?.calls ?? 0) - (stats?.[a.id]?.calls ?? 0) || a.id - b.id
  );

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold gradient-text font-display mb-8">
          {t("rankings.title")}
        </h1>

        <div className="glass-strong rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">{t("rankings.rank")}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">{t("rankings.skill")}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">{t("nav.creator")}</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">{t("common.runs")}</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">{t("rankings.price")}</th>
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
                  <td className="px-6 py-4 text-right font-mono text-white">{stats?.[skill.id]?.calls === undefined ? "—" : stats[skill.id].calls.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-mono text-[#d6a44c]">{skill.priceMON} INJ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
