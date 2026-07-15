"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { SkillModule } from "@/lib/skills";
import { SKILL_MODULES } from "@/lib/skills";
import { RARITY, rarityOrder } from "@/lib/rarity";

type Phase = "intro" | "tearing" | "revealing" | "result";

interface Props {
  open: boolean;
  onClose: () => void;
}

const PACK_PRICE = 0.5;

export function SkillPackAnimation({ open, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [reveal, setReveal] = useState<boolean[]>([false, false, false]);

  const pulls = useMemo<SkillModule[]>(() => {
    if (!open) return [];
    const pool = [...SKILL_MODULES];
    const picks: SkillModule[] = [];
    const seeds = [Date.now(), Date.now() + 1, Date.now() + 2];
    seeds.forEach((seed) => {
      const r = ((seed * 9301 + 49297) % 233280) / 233280;
      let tier: "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";
      if (r < 0.42) tier = "Common";
      else if (r < 0.74) tier = "Rare";
      else if (r < 0.91) tier = "Epic";
      else if (r < 0.985) tier = "Legendary";
      else tier = "Mythic";
      const matching = pool.filter((s) => s.rarity === tier);
      const fallback = matching.length > 0 ? matching : pool;
      const pick =
        fallback[Math.floor(((seed * 16807) % 2147483647) % fallback.length)];
      picks.push(pick);
    });
    return picks.sort((a, b) => rarityOrder(a.rarity) - rarityOrder(b.rarity));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setPhase("intro");
    setReveal([false, false, false]);

    const t1 = setTimeout(() => setPhase("tearing"), 600);
    const t2 = setTimeout(() => setPhase("revealing"), 1700);
    const t3 = setTimeout(() => setReveal([true, false, false]), 2000);
    const t4 = setTimeout(() => setReveal([true, true, false]), 2700);
    const t5 = setTimeout(() => setReveal([true, true, true]), 3400);
    const t6 = setTimeout(() => setPhase("result"), 4000);
    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function claim() {
    onClose();
  }

  const topRarity = pulls[pulls.length - 1]?.rarity;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={phase === "result" ? claim : undefined}
          />

          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: phase === "intro" || phase === "tearing" ? 1 : 0.6,
            }}
            transition={{ duration: 0.6 }}
            style={{
              background:
                "radial-gradient(closest-side, rgba(214,164,76,0.45) 0%, rgba(122,148,80,0.25) 35%, transparent 70%)",
            }}
          />

          {(phase === "tearing" || phase === "revealing") && (
            <motion.div
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 0.5, scale: 1 }}
            >
              <div
                className="h-[140vmax] w-[140vmax] rounded-full animate-spinSlow"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.06) 4deg, transparent 8deg, transparent 36deg, rgba(255,255,255,0.06) 40deg, transparent 44deg, transparent 78deg, rgba(255,255,255,0.06) 82deg, transparent 86deg)",
                }}
              />
            </motion.div>
          )}

          <AnimatePresence>
            {(phase === "intro" || phase === "tearing") && (
              <motion.div
                key="pack"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{
                  scale: phase === "tearing" ? [1, 1.1, 0.9, 1.15] : 1,
                  opacity: 1,
                  rotate: phase === "tearing" ? [0, -4, 4, -2] : 0,
                }}
                exit={{ opacity: 0, scale: 1.3 }}
                transition={{ duration: phase === "tearing" ? 1.0 : 0.6 }}
                className="relative w-[280px] h-[400px] rounded-3xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #d6a44c 0%, #7a9450 50%, #bf5b4b 100%)",
                  backgroundSize: "200% 200%",
                  boxShadow:
                    "0 40px 100px -20px rgba(214,164,76,0.6), 0 0 80px -10px rgba(122,148,80,0.5)",
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.0) 100%)",
                    backgroundSize: "200% 200%",
                    mixBlendMode: "screen",
                  }}
                />
                <div className="relative h-full w-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/80">
                    Orchor · Season 01
                  </div>
                  <div className="mt-3 font-display text-3xl font-bold text-white">
                    Skill Pack
                  </div>
                  <div className="mt-1 text-[12px] text-white/80">
                    3 hosted skills inside
                  </div>
                  <div className="mt-auto text-[10px] text-white/60">
                    Settled on Monad
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {(phase === "revealing" || phase === "result") && (
            <div className="relative z-10 flex items-center gap-6">
              {pulls.map((skill, i) => (
                <RevealCard
                  key={skill.id + "-" + i}
                  skill={skill}
                  revealed={reveal[i]}
                  delay={i * 0.1}
                />
              ))}
            </div>
          )}

          {phase === "result" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
            >
              <div className="text-center">
                <div className="font-display text-xl text-white">
                  {topRarity === "Mythic"
                    ? "MYTHIC PULL. Onchain-limited drop."
                    : topRarity === "Legendary"
                    ? "Insane pull. A Legendary dropped."
                    : topRarity === "Epic"
                    ? "Nice pack. Epic inside."
                    : "Pack opened — added to your deck."}
                </div>
                <div className="mt-1 text-[12px] text-mutedHi">
                  Paid {PACK_PRICE} MON · settled on Monad Testnet
                </div>
              </div>
              <button
                onClick={claim}
                className="btn-neon h-12 px-6 rounded-2xl text-sm font-semibold"
              >
                Claim to Deck
              </button>
            </motion.div>
          )}

          {phase === "result" && (
            <button
              onClick={claim}
              className="absolute top-6 right-6 h-10 w-10 rounded-full glass flex items-center justify-center"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path
                  d="M6 6 L18 18 M18 6 L6 18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RevealCard({
  skill,
  revealed,
  delay,
}: {
  skill: SkillModule;
  revealed: boolean;
  delay: number;
}) {
  const theme = RARITY[skill.rarity];
  const isMythic = skill.rarity === "Mythic";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 22 }}
      style={{ perspective: 1000 }}
      className="relative"
    >
      {(skill.rarity === "Legendary" || isMythic) && revealed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: isMythic ? 1.2 : 1, scale: isMythic ? 1.4 : 1.2 }}
          className="legendary-aura"
        />
      )}
      <motion.div
        className="relative w-[240px] h-[340px]"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: revealed ? 0 : 180 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background:
              "linear-gradient(135deg, #d6a44c, #7a9450, #bf5b4b)",
            backgroundSize: "200% 200%",
            boxShadow: "0 20px 60px -20px rgba(214,164,76,0.6)",
          }}
        >
          <div className="h-full w-full rounded-2xl border border-white/20 flex items-center justify-center">
            <svg viewBox="0 0 32 32" className="h-12 w-12 opacity-90">
              <circle cx="16" cy="16" r="11" stroke="white" strokeWidth="1.4" fill="none" />
              <circle cx="16" cy="16" r="6" stroke="white" strokeWidth="1.4" fill="none" opacity="0.7" />
              <circle cx="16" cy="16" r="2" fill="white" />
            </svg>
          </div>
        </div>

        <div
          className={`absolute inset-0 rounded-2xl p-[1.5px] ${isMythic ? "animate-gradientShift bg-[length:300%_300%]" : ""}`}
          style={{
            backfaceVisibility: "hidden",
            background: theme.border,
            boxShadow: theme.shadow,
          }}
        >
          <div
            className="relative h-full w-full rounded-[14px] overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(14,14,32,0.95), rgba(8,8,22,0.95))",
            }}
          >
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div
              className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-60"
              style={{ background: theme.glow }}
            />
            <div className="relative h-full w-full p-4 flex flex-col">
              <div
                className="self-start px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase"
                style={{ background: theme.tagBg, color: theme.tagText }}
              >
                {skill.rarity === "Mythic"
                  ? "✦ MYTHIC"
                  : skill.rarity === "Legendary"
                  ? "★ Legendary"
                  : skill.rarity}
              </div>
              <div className="mt-3 text-[9px] uppercase tracking-wider text-mutedHi">
                {skill.category}
              </div>
              <div className="mt-1 font-display text-[20px] font-bold leading-tight">
                {skill.title}
              </div>
              <div className="mt-2 text-[10px] text-mutedHi line-clamp-3">
                {skill.shortDescription}
              </div>
              {isMythic && skill.mintedOf && (
                <div className="mt-2 text-[9px] font-mono text-[#d98a7d]">
                  ✦ {skill.mintedOf.current}/{skill.mintedOf.cap} minted onchain
                </div>
              )}
              <div className="mt-auto flex items-center justify-between text-[10px]">
                <span className="text-muted">{skill.creator}</span>
                <span className="font-mono text-[#f0d493]">
                  {skill.energyCost} ⚡
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
