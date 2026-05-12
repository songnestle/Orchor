"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { BackgroundFX } from "@/components/BackgroundFX";
import { TopNav } from "@/components/TopNav";
import { HeroSection } from "@/components/HeroSection";
import { SkillCarousel } from "@/components/SkillCarousel";
import { SkillsGrid } from "@/components/SkillsGrid";
import { RightSidebar } from "@/components/RightSidebar";
import { BottomActionBar } from "@/components/BottomActionBar";
import { SkillDetailModal } from "@/components/SkillDetailModal";
import { SkillPackAnimation } from "@/components/SkillPackAnimation";
import { MyDeckDrawer } from "@/components/MyDeckDrawer";
import { TopUpEnergyModal } from "@/components/TopUpEnergyModal";
import { PublishSkillModal } from "@/components/PublishSkillModal";

import { type SkillModule } from "@/lib/skills";
import { useAllSkills } from "@/lib/useAllSkills";
import { COLLECTIONS } from "@/lib/collections";
import { RARITY } from "@/lib/rarity";

export default function Page() {
  const allSkills = useAllSkills();

  const [openSkill, setOpenSkill] = useState<SkillModule | null>(null);
  const [packOpen, setPackOpen] = useState(false);
  const [deckOpen, setDeckOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = allSkills;
    if (filter !== "All") list = list.filter((s) => s.category === filter);
    if (activeCollection) {
      const c = COLLECTIONS.find((x) => x.id === activeCollection);
      if (c) list = list.filter((s) => c.skillIds.includes(s.id));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.creator.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.origin.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allSkills, filter, query, activeCollection]);

  const activeColl = activeCollection
    ? COLLECTIONS.find((c) => c.id === activeCollection)
    : null;

  function scrollToCarousel() {
    document.getElementById("carousel")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="relative min-h-screen pb-32">
      <BackgroundFX />

      <TopNav
        onOpenDeck={() => setDeckOpen(true)}
        onOpenTopUp={() => setTopUpOpen(true)}
        onOpenPublish={() => setPublishOpen(true)}
      />

      <HeroSection
        onOpenPack={() => setPackOpen(true)}
        onExplore={scrollToCarousel}
      />

      <div
        id="carousel"
        className="mx-auto max-w-[1440px] px-6 lg:px-10 grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8 mt-2"
      >
        <div>
          {activeColl && (
            <CollectionBanner
              name={activeColl.name}
              tagline={activeColl.tagline}
              creator={activeColl.creator}
              count={activeColl.skillIds.length}
              priceMON={activeColl.unlockPriceMON}
              rarity={activeColl.rarity}
              onClear={() => setActiveCollection(null)}
            />
          )}
          <SkillCarousel
            skills={filtered}
            filter={filter}
            onFilter={(c) => {
              setFilter(c);
              setActiveCollection(null);
            }}
            query={query}
            onQuery={setQuery}
            onCardClick={(s) => setOpenSkill(s)}
            onInvoke={(s) => setOpenSkill(s)}
          />
        </div>

        <div className="xl:pt-2">
          <RightSidebar
            onOpenSkill={(id) => {
              const s = allSkills.find((x) => x.id === id);
              if (s) setOpenSkill(s);
            }}
            onOpenCollection={(id) => {
              setActiveCollection(id);
              setFilter("All");
              setQuery("");
              scrollToCarousel();
            }}
          />
        </div>
      </div>

      {/* Full-width grid of all skills (compact cards, browse mode) */}
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <SkillsGrid
          skills={filtered}
          onCardClick={(s) => setOpenSkill(s)}
        />
      </div>

      <BottomActionBar
        onOpenPack={() => setPackOpen(true)}
        onOpenDeck={() => setDeckOpen(true)}
        onOpenTopUp={() => setTopUpOpen(true)}
      />

      <SkillDetailModal
        skill={openSkill}
        onClose={() => setOpenSkill(null)}
        onOpenTopUp={() => setTopUpOpen(true)}
      />

      <SkillPackAnimation open={packOpen} onClose={() => setPackOpen(false)} />

      <MyDeckDrawer
        open={deckOpen}
        onClose={() => setDeckOpen(false)}
        onOpenSkill={(id) => {
          const s = allSkills.find((x) => x.id === id);
          if (s) {
            setDeckOpen(false);
            setOpenSkill(s);
          }
        }}
      />

      <TopUpEnergyModal open={topUpOpen} onClose={() => setTopUpOpen(false)} />

      <PublishSkillModal open={publishOpen} onClose={() => setPublishOpen(false)} />
    </main>
  );
}

function CollectionBanner({
  name,
  tagline,
  creator,
  count,
  priceMON,
  rarity,
  onClear,
}: {
  name: string;
  tagline: string;
  creator: string;
  count: number;
  priceMON: number;
  rarity: keyof typeof RARITY;
  onClear: () => void;
}) {
  const theme = RARITY[rarity];
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 rounded-2xl p-[1.5px]"
      style={{ background: theme.border }}
    >
      <div
        className="rounded-[14px] px-4 py-3 flex items-center justify-between gap-4"
        style={{
          background:
            "linear-gradient(180deg, rgba(14,14,32,0.9), rgba(8,8,22,0.9))",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            style={{ background: theme.tagBg, color: theme.tagText }}
          >
            Collection · {rarity}
          </div>
          <div className="min-w-0">
            <div className="font-display text-[15px] text-white truncate">
              {name}
            </div>
            <div className="text-[11px] text-mutedHi truncate">
              {tagline} · by {creator} · {count} skills
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted">
              Pack
            </div>
            <div className="font-mono text-[12px] text-white">{priceMON} MON</div>
          </div>
          <button onClick={onClear} className="btn-ghost h-9 px-3 rounded-lg text-[11px]">
            Clear filter
          </button>
        </div>
      </div>
    </motion.div>
  );
}
