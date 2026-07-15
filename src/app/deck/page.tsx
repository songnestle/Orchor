"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PremiumSkillCard } from "@/components/premium/PremiumSkillCard";
import { useAllSkills } from "@/lib/useAllSkills";
import { useOrchorState } from "@/lib/useOrchorState";
import { useI18n } from "@/lib/i18n";

export default function DeckPage() {
  const allSkills = useAllSkills();
  const { owned } = useOrchorState();
  const { t } = useI18n();

  // Filter owned skills
  const deck = allSkills.filter(skill => owned.has(skill.id));

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="border-b border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text font-display">
                {t("deck.title")}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {deck.length} {t("deck.collected")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="glass px-4 py-2 rounded-xl">
                <div className="text-xs text-gray-400">{t("deck.totalValue")}</div>
                <div className="text-lg font-bold text-white">
                  {(deck.reduce((sum, s) => sum + s.priceMON, 0)).toFixed(2)} ETH
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {deck.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-white mb-2">{t("deck.empty")}</h2>
            <p className="text-gray-400 mb-6">{t("deck.emptyHint")}</p>
            <a
              href="/"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#b07f2f] to-[#9c463a] text-white font-bold hover:shadow-lg hover:shadow-[#d6a44c]/50 transition-all"
            >
              {t("deck.browse")}
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {deck.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <PremiumSkillCard skill={skill} onClick={() => {}} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
