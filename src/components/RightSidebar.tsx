"use client";

import { motion } from "framer-motion";
import { COLLECTIONS } from "@/lib/collections";
import { TOP_CREATORS } from "@/lib/creators";
import { useAllSkills } from "@/lib/useAllSkills";
import type { SkillModule } from "@/lib/skills";
import { RARITY } from "@/lib/rarity";
import { useDeck } from "@/lib/deckStore";
import { MonadIcon } from "./TopNav";

interface Props {
  onOpenSkill: (id: number) => void;
  onOpenCollection: (id: string) => void;
}

export function RightSidebar({ onOpenSkill, onOpenCollection }: Props) {
  const allSkills = useAllSkills();
  const recent = useDeck((s) => s.recentInvocations);
  const recentSkills = recent
    .map((id) => allSkills.find((s) => s.id === id))
    .filter(Boolean)
    .slice(0, 3) as SkillModule[];

  const dailyDrop =
    allSkills.find((s) => s.rarity === "Mythic") ||
    allSkills.find((s) => s.rarity === "Legendary")!;

  return (
    <aside className="space-y-4">
      {/* Daily Legendary Drop */}
      <Panel
        title="Daily Legendary Drop"
        accent="gold"
        kicker="Resets in 14h 22m"
      >
        <button
          onClick={() => onOpenSkill(dailyDrop.id)}
          className="group w-full text-left"
        >
          <div className="relative rounded-xl overflow-hidden p-3"
            style={{
              background:
                "linear-gradient(135deg, rgba(214,164,76,0.18), rgba(214,164,76,0.18))",
              border: "1px solid rgba(214,164,76,0.30)",
            }}
          >
            <div className="absolute inset-0 opacity-30 grid-bg pointer-events-none" />
            <div className="relative flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center font-display font-bold text-sm shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #f0d493, #bf5b4b, #d6a44c)",
                  color: "#1a1a2a",
                }}
              >
                {dailyDrop.creatorAvatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-wider text-[#f0d493]">
                  ★ Legendary
                </div>
                <div className="text-[13px] font-display font-semibold text-white truncate">
                  {dailyDrop.title}
                </div>
                <div className="text-[10px] text-mutedHi truncate">
                  by {dailyDrop.creator}
                </div>
              </div>
            </div>
            <div className="relative mt-3 flex items-center justify-between text-[11px]">
              <span className="text-mutedHi">Today only</span>
              <span className="font-mono text-white flex items-center gap-1">
                <MonadIcon size={10} />
                {dailyDrop.priceMON} MON
              </span>
            </div>
          </div>
        </button>
      </Panel>

      {/* Trending Collections */}
      <Panel title="Trending Collections" kicker="Hot">
        <div className="space-y-2">
          {COLLECTIONS.map((c) => {
            const theme = RARITY[c.rarity];
            return (
              <button
                key={c.id}
                onClick={() => onOpenCollection(c.id)}
                className="group w-full flex items-center gap-3 p-2 rounded-lg border border-white/5 hover:border-white/15 hover:bg-white/[0.03] transition text-left"
              >
                <div
                  className="h-10 w-10 rounded-lg shrink-0 flex items-center justify-center font-display font-bold text-[11px]"
                  style={{ background: theme.border, color: "white" }}
                >
                  <div
                    className="h-full w-full rounded-[7px] flex items-center justify-center"
                    style={{ background: "rgba(8,8,22,0.85)" }}
                  >
                    {c.creatorAvatar}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-medium text-white truncate">
                    {c.name}
                  </div>
                  <div className="text-[10px] text-muted truncate">
                    {c.skillIds.length} skills · {c.tagline.slice(0, 36)}
                    {c.tagline.length > 36 ? "…" : ""}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase tracking-wider text-mutedHi">
                    Pack
                  </div>
                  <div className="font-mono text-[11px] text-white">
                    {c.unlockPriceMON} MON
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Panel>

      {/* Top Creators */}
      <Panel title="Top Creators">
        <div className="space-y-2">
          {TOP_CREATORS.slice(0, 4).map((c, i) => (
            <div
              key={c.handle}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition"
            >
              <div className="text-[11px] font-mono text-muted w-4">{i + 1}</div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-[10px] font-display font-bold">
                {c.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] text-white truncate">{c.name}</div>
                <div className="text-[10px] text-muted truncate">
                  {c.skillsPublished} skills · {(c.totalInvocations / 1000).toFixed(0)}k invokes
                </div>
              </div>
              <div className="font-mono text-[10px] text-[#b6c98f]">
                {(c.followers / 1000).toFixed(1)}k
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Recently Invoked */}
      <Panel title="Recently Invoked">
        {recentSkills.length === 0 ? (
          <div className="text-[11px] text-muted">
            No invocations yet. Pick a card and tap{" "}
            <span className="text-white">Invoke</span>.
          </div>
        ) : (
          <div className="space-y-2">
            {recentSkills.map((s) => (
              <button
                key={s.id}
                onClick={() => onOpenSkill(s.id)}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.03] transition text-left"
              >
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: RARITY[s.rarity].glow }}
                />
                <span className="text-[12px] text-white truncate flex-1">
                  {s.title}
                </span>
                <span className="text-[10px] font-mono text-muted">
                  {s.priceMON} MON
                </span>
              </button>
            ))}
          </div>
        )}
      </Panel>

      {/* Monad Network Status */}
      <Panel title="Monad Network">
        <div className="space-y-1.5 text-[11px]">
          <Row label="Network" value="Testnet" valueClass="text-[#b6c98f]" />
          <Row label="Block" value="#8,124,902" mono />
          <Row label="Avg gas" value="0.0001 MON" mono />
          <Row label="TPS (1m)" value="9,420" mono valueClass="text-[#7a9450]" />
        </div>
      </Panel>
    </aside>
  );
}

function Panel({
  title,
  kicker,
  accent,
  children,
}: {
  title: string;
  kicker?: string;
  accent?: "gold";
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative rounded-2xl glass p-4"
    >
      {accent === "gold" && (
        <div
          className="absolute -inset-px rounded-2xl opacity-50 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(214,164,76,0.4), rgba(214,164,76,0.3))",
            mask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "1px",
          }}
        />
      )}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] uppercase tracking-[0.18em] text-mutedHi">
          {title}
        </h3>
        {kicker && (
          <span className="text-[10px] text-muted">{kicker}</span>
        )}
      </div>
      {children}
    </motion.div>
  );
}

function Row({
  label,
  value,
  mono,
  valueClass,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={`${mono ? "font-mono tabular" : ""} ${valueClass || "text-white"}`}>
        {value}
      </span>
    </div>
  );
}
