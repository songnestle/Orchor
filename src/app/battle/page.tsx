"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAllSkills } from "@/lib/useAllSkills";
import { PremiumSkillCard } from "@/components/premium/PremiumSkillCard";
import type { SkillModule } from "@/lib/skills";

type BattlePhase = "select" | "battle" | "result";

export default function BattleArenaPage() {
  const allSkills = useAllSkills();
  const [phase, setPhase] = useState<BattlePhase>("select");
  const [playerCard, setPlayerCard] = useState<SkillModule | null>(null);
  const [opponentCard, setOpponentCard] = useState<SkillModule | null>(null);
  const [winner, setWinner] = useState<"player" | "opponent" | null>(null);

  const startBattle = () => {
    if (!playerCard) return;
    // Random opponent
    const opponent = allSkills[Math.floor(Math.random() * allSkills.length)];
    setOpponentCard(opponent);
    setPhase("battle");

    // Simulate battle after 2s
    setTimeout(() => {
      const playerPower = playerCard.usageCount + (playerCard.priceMON * 1000);
      const opponentPower = opponent.usageCount + (opponent.priceMON * 1000);
      setWinner(playerPower > opponentPower ? "player" : "opponent");
      setPhase("result");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-bg/80 border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold gradient-text font-display">
            ⚔️ Battle Arena
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Challenge skills in head-to-head battles
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Select Phase */}
        {phase === "select" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Choose Your Fighter</h2>
            {playerCard ? (
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-64">
                    <PremiumSkillCard skill={playerCard} onClick={() => {}} />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white mb-2">Selected: {playerCard.title}</div>
                    <button
                      onClick={() => setPlayerCard(null)}
                      className="px-4 py-2 rounded-lg glass text-sm text-white hover:bg-white/10 transition-all"
                    >
                      Change
                    </button>
                  </div>
                </div>
                <button
                  onClick={startBattle}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-red-500/50 transition-all"
                >
                  🔥 Start Battle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {allSkills.slice(0, 12).map((skill) => (
                  <div key={skill.id} onClick={() => setPlayerCard(skill)} className="cursor-pointer">
                    <PremiumSkillCard skill={skill} onClick={() => {}} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Battle Phase */}
        {phase === "battle" && playerCard && opponentCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-12 py-20"
          >
            <motion.div
              animate={{ x: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
            >
              <PremiumSkillCard skill={playerCard} onClick={() => {}} />
              <div className="text-center mt-4 text-lg font-bold text-white">You</div>
            </motion.div>

            <div className="text-6xl animate-pulse">⚔️</div>

            <motion.div
              animate={{ x: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
            >
              <PremiumSkillCard skill={opponentCard} onClick={() => {}} />
              <div className="text-center mt-4 text-lg font-bold text-white">Opponent</div>
            </motion.div>
          </motion.div>
        )}

        {/* Result Phase */}
        {phase === "result" && playerCard && opponentCard && winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="glass-strong rounded-3xl p-12 text-center">
              <div className="text-8xl mb-6">{winner === "player" ? "🏆" : "😔"}</div>
              <h2 className="text-4xl font-bold text-white mb-4">
                {winner === "player" ? "Victory!" : "Defeat"}
              </h2>
              <p className="text-gray-400 mb-8">
                {winner === "player"
                  ? `${playerCard.title} defeats ${opponentCard.title}!`
                  : `${opponentCard.title} defeats ${playerCard.title}!`
                }
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setPhase("select");
                    setPlayerCard(null);
                    setOpponentCard(null);
                    setWinner(null);
                  }}
                  className="px-6 py-3 rounded-xl glass text-white font-bold hover:bg-white/10 transition-all"
                >
                  New Battle
                </button>
                <button
                  onClick={startBattle}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
                >
                  Rematch
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
