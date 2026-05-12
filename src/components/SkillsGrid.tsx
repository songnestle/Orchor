"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { SkillModule } from "@/lib/skills";
import { RARITY, rarityOrder, type Rarity } from "@/lib/rarity";
import { useOrchorState } from "@/lib/useOrchorState";

interface Props {
  skills: SkillModule[];
  onCardClick: (s: SkillModule) => void;
}

type RarityFilter = "All" | Rarity;
const RARITY_TABS: RarityFilter[] = ["All", "Mythic", "Legendary", "Epic", "Rare", "Common"];

export function SkillsGrid({ skills, onCardClick }: Props) {
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("All");
  const { owned, subscribed } = useOrchorState();

  const sorted = useMemo(() => {
    const filtered =
      rarityFilter === "All"
        ? skills
        : skills.filter((s) => s.rarity === rarityFilter);
    return [...filtered].sort(
      (a, b) => rarityOrder(b.rarity) - rarityOrder(a.rarity)
    );
  }, [skills, rarityFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: skills.length };
    skills.forEach((s) => {
      c[s.rarity] = (c[s.rarity] ?? 0) + 1;
    });
    return c;
  }, [skills]);

  return (
    <section className="mt-16">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-mutedHi">
            All Hosted Skills
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold">
            Browse the <span className="text-gradient">Skill Library</span>
          </h2>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-full glass flex-wrap">
          {RARITY_TABS.map((r) => {
            const active = r === rarityFilter;
            const count = counts[r] ?? 0;
            return (
              <button
                key={r}
                onClick={() => setRarityFilter(r)}
                className={`relative px-3 py-1 rounded-full text-[11px] transition flex items-center gap-1.5 ${
                  active ? "text-white" : "text-mutedHi hover:text-white"
                }`}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/30 to-accent2/30 border border-white/10"
                  />
                )}
                {r !== "All" && (
                  <span
                    aria-hidden
                    className="relative h-1.5 w-1.5 rounded-full"
                    style={{ background: RARITY[r as Rarity].glow }}
                  />
                )}
                <span className="relative">{r}</span>
                <span className="relative text-[10px] font-mono opacity-60 tabular">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="py-12 text-center text-mutedHi text-sm">
          No skills match the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map((s, i) => (
            <GridCard
              key={s.id}
              skill={s}
              index={i}
              isOwned={owned.has(s.id)}
              isSubscribed={subscribed.has(s.id)}
              onClick={() => onCardClick(s)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ────────── compact grid card ────────── */
function GridCard({
  skill,
  index,
  isOwned,
  isSubscribed,
  onClick,
}: {
  skill: SkillModule;
  index: number;
  isOwned: boolean;
  isSubscribed: boolean;
  onClick: () => void;
}) {
  const theme = RARITY[skill.rarity];
  const isMythic = skill.rarity === "Mythic";
  const isLegendary = skill.rarity === "Legendary";

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.4), duration: 0.35 }}
      whileHover={{ y: -4 }}
      className={`group relative text-left rounded-2xl p-[1.5px] transition ${
        isMythic ? "animate-gradientShift bg-[length:300%_300%]" : ""
      }`}
      style={{
        background: theme.border,
        backgroundSize: isMythic ? "300% 300%" : "200% 200%",
        boxShadow: theme.shadow,
      }}
    >
      <div
        className="relative h-full w-full rounded-[14px] overflow-hidden flex flex-col"
        style={{
          background:
            "linear-gradient(180deg, rgba(14,14,32,0.96) 0%, rgba(8,8,22,0.96) 100%)",
        }}
      >
        {/* sheen */}
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{ background: theme.sheen }}
        />
        {/* grid bg */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        {/* corner glow */}
        <div
          className="absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-60 pointer-events-none"
          style={{ background: theme.glow }}
        />
        {/* hover sheen */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            className="absolute -inset-y-10 -left-1/2 w-1/3 animate-holoSheen"
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
              mixBlendMode: "screen",
            }}
          />
        </div>

        <div className="relative p-3 flex flex-col h-full">
          {/* top row: rarity + status */}
          <div className="flex items-center justify-between gap-1">
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase"
              style={{
                background: theme.tagBg,
                color: theme.tagText,
                textShadow: isMythic
                  ? "0 0 10px rgba(244,114,182,0.7)"
                  : isLegendary
                  ? "0 0 8px rgba(251,191,36,0.6)"
                  : "none",
              }}
            >
              {isMythic ? "✦ Mythic" : isLegendary ? "★ Legend" : skill.rarity}
            </span>
            {(isOwned || isSubscribed) && (
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider"
                style={{
                  background: "rgba(16,185,129,0.12)",
                  color: "#6ee7b7",
                  border: "1px solid rgba(16,185,129,0.25)",
                }}
              >
                {isOwned ? "Owned" : "Sub"}
              </span>
            )}
          </div>

          {/* category + origin */}
          <div className="mt-2 flex items-center justify-between text-[9px] text-mutedHi uppercase tracking-wider">
            <span>{skill.category}</span>
            <span className="opacity-60">via {skill.origin}</span>
          </div>

          {/* title */}
          <h3 className="mt-1 font-display text-[15px] font-bold leading-tight text-white line-clamp-2 min-h-[2.4em]">
            {skill.title}
          </h3>

          {/* description */}
          <p className="mt-1.5 text-[10.5px] text-mutedHi leading-snug line-clamp-2">
            {skill.shortDescription}
          </p>

          {/* pipeline preview */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1">
            {skill.pipeline.slice(0, 3).map((n, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded text-[9px] font-medium border border-white/10"
                style={{
                  background: `linear-gradient(135deg, ${theme.glow}22, ${theme.glow}08)`,
                  color: theme.tagText,
                }}
              >
                {n}
              </span>
            ))}
            {skill.pipeline.length > 3 && (
              <span className="text-[9px] text-muted">+{skill.pipeline.length - 3}</span>
            )}
          </div>

          {/* creator */}
          <div className="mt-2.5 flex items-center gap-1.5 text-[10px]">
            <div
              className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-display font-bold"
              style={{
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.7), rgba(34,211,238,0.7))",
              }}
            >
              {skill.creatorAvatar}
            </div>
            <span className="text-mutedHi truncate">{skill.creator}</span>
          </div>

          {/* mythic mint counter */}
          {isMythic && skill.mintedOf && (
            <div className="mt-1.5 text-[9px] font-mono text-pink-200">
              ✦ {skill.mintedOf.current}/{skill.mintedOf.cap} minted
            </div>
          )}

          {/* footer */}
          <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/5">
            <div className="flex items-center gap-2 text-[10.5px]">
              <span className="font-mono text-amber-200 tabular">
                {skill.energyCost} ⚡
              </span>
              <span className="text-muted">·</span>
              <span className="font-mono text-mutedHi tabular">
                {skill.priceMON} MON
              </span>
            </div>
            <span className="text-[9px] text-mutedHi opacity-0 group-hover:opacity-100 transition-opacity">
              View →
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
