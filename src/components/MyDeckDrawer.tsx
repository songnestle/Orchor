"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAllSkills } from "@/lib/useAllSkills";
import { useOrchorState } from "@/lib/useOrchorState";
import { RARITY, rarityOrder } from "@/lib/rarity";
import { useMemo } from "react";
import { EnergyBolt, MonadIcon } from "./TopNav";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenSkill: (id: number) => void;
}

export function MyDeckDrawer({ open, onClose, onOpenSkill }: Props) {
  const allSkills = useAllSkills();
  const { owned, subscribed, walletBalanceMON: balance, energy } = useOrchorState();

  const deckSkills = useMemo(() => {
    const ids = new Set<number>([...owned, ...subscribed]);
    return allSkills.filter((s) => ids.has(s.id)).sort(
      (a, b) => rarityOrder(b.rarity) - rarityOrder(a.rarity)
    );
  }, [allSkills, owned, subscribed]);

  const mythicCount = deckSkills.filter((s) => s.rarity === "Mythic").length;
  const legendaryCount = deckSkills.filter((s) => s.rarity === "Legendary").length;
  const epicCount = deckSkills.filter((s) => s.rarity === "Epic").length;
  const rareCount = deckSkills.filter((s) => s.rarity === "Rare").length;
  const commonCount = deckSkills.filter((s) => s.rarity === "Common").length;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-[min(96vw,520px)] glass-strong border-l border-white/10 overflow-y-auto scrollbar-thin"
          >
            <div className="sticky top-0 z-10 px-5 py-4 bg-bg/80 backdrop-blur-md border-b border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-mutedHi">
                    Orchor · Inventory
                  </div>
                  <div className="font-display text-2xl font-bold">
                    Your Skill <span className="text-gradient">Deck</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="h-9 w-9 rounded-full glass flex items-center justify-center"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path d="M6 6 L18 18 M18 6 L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-xl p-3 border border-white/5 bg-white/[0.02]">
                  <div className="text-[10px] uppercase tracking-wider text-muted">Energy</div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <EnergyBolt size={14} />
                    <span className="font-display text-lg tabular text-white">
                      {energy}
                    </span>
                    <span className="text-[10px] text-mutedHi font-mono">⚡</span>
                  </div>
                </div>
                <div className="rounded-xl p-3 border border-white/5 bg-white/[0.02]">
                  <div className="text-[10px] uppercase tracking-wider text-muted">Wallet</div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <MonadIcon size={14} />
                    <span className="font-display text-lg tabular text-white">
                      {balance.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-mutedHi font-mono">MON</span>
                  </div>
                </div>
                <div className="rounded-xl p-3 border border-white/5 bg-white/[0.02]">
                  <div className="text-[10px] uppercase tracking-wider text-muted">Skills</div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-display text-lg tabular text-white">
                      {deckSkills.length}
                    </span>
                    <span className="text-[10px] text-mutedHi">
                      ({owned.size}+{subscribed.size})
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-5 gap-1.5">
                <RarityChip label="Mythic" count={mythicCount} color="#f9a8d4" />
                <RarityChip label="Legend" count={legendaryCount} color="#fde68a" />
                <RarityChip label="Epic" count={epicCount} color="#d8b4fe" />
                <RarityChip label="Rare" count={rareCount} color="#7dd3fc" />
                <RarityChip label="Common" count={commonCount} color="#cdd5de" />
              </div>
            </div>

            <div className="p-5">
              {deckSkills.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="text-mutedHi text-sm">Your deck is empty.</div>
                  <div className="mt-1 text-xs text-muted">
                    Open a Skill Pack or unlock skills to start collecting.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {deckSkills.map((s) => {
                    const theme = RARITY[s.rarity];
                    const isOwned = owned.has(s.id);
                    const isSub = subscribed.has(s.id);
                    const isMythic = s.rarity === "Mythic";
                    return (
                      <button
                        key={s.id}
                        onClick={() => onOpenSkill(s.id)}
                        className={`relative rounded-xl p-[1.5px] text-left transition hover:scale-[1.02] ${
                          isMythic ? "animate-gradientShift bg-[length:300%_300%]" : ""
                        }`}
                        style={{
                          background: theme.border,
                          boxShadow: theme.shadow,
                        }}
                      >
                        <div
                          className="relative h-full w-full rounded-[10px] p-3 overflow-hidden"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(14,14,32,0.95), rgba(8,8,22,0.95))",
                          }}
                        >
                          <div
                            className="absolute -top-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-60"
                            style={{ background: theme.glow }}
                          />
                          <div className="relative">
                            <div
                              className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                              style={{ background: theme.tagBg, color: theme.tagText }}
                            >
                              {isMythic ? "✦ Mythic" : s.rarity}
                            </div>
                            <div className="mt-2 font-display font-semibold text-[13px] leading-tight">
                              {s.title}
                            </div>
                            <div className="mt-0.5 text-[10px] text-muted truncate">
                              {s.creator}
                            </div>
                            <div className="mt-3 flex items-center justify-between text-[10px]">
                              <span className="font-mono text-amber-200">
                                {s.energyCost} ⚡
                              </span>
                              <span className="text-mutedHi">
                                {isOwned && isSub
                                  ? "Owned · Sub"
                                  : isOwned
                                  ? "Owned"
                                  : "Subscribed"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function RarityChip({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-1.5 py-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
        <span className="font-mono text-[11px] tabular text-white">{count}</span>
      </div>
    </div>
  );
}
