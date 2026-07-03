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
import { TopUpCreditsModal } from "@/components/TopUpCreditsModal";
import { PublishSkillModal } from "@/components/PublishSkillModal";

import { type SkillModule } from "@/lib/skills";
import { useAllSkills } from "@/lib/useAllSkills";
import { COLLECTIONS } from "@/lib/collections";

export default function Home() {
  const allSkills = useAllSkills();
  const [selected, setSelected] = useState<SkillModule | null>(null);
  const [packOpen, setPackOpen] = useState(false);
  const [deckOpen, setDeckOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpCreditsOpen, setTopUpCreditsOpen] = useState(false);
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

  function openCollection(id: string) {
    setActiveCollection(id);
    setPackOpen(true);
  }

  function closeCollection() {
    setActiveCollection(null);
    setPackOpen(false);
  }

  return (
    <div className="relative min-h-screen bg-bg text-white">
      <BackgroundFX />

      <TopNav
        onOpenDeck={() => setDeckOpen(true)}
        onOpenTopUp={() => setTopUpOpen(true)}
        onOpenTopUpCredits={() => setTopUpCreditsOpen(true)}
        onOpenPublish={() => setPublishOpen(true)}
      />

      <div className="relative mx-auto max-w-[1600px] px-6 lg:px-10">
        <HeroSection onOpenCollection={openCollection} />

        <div className="relative mt-10 lg:flex lg:gap-8">
          <div className="flex-1 min-w-0 space-y-6">
            <SkillCarousel skills={allSkills} onSelect={setSelected} />
            <SkillsGrid
              skills={filtered}
              filter={filter}
              setFilter={setFilter}
              query={query}
              setQuery={setQuery}
              onSelect={setSelected}
              activeCollection={activeCollection}
              onClearCollection={closeCollection}
            />
          </div>

          <RightSidebar skills={allSkills} onSelect={setSelected} />
        </div>
      </div>

      <BottomActionBar onOpenDeck={() => setDeckOpen(true)} />

      <SkillDetailModal
        skill={selected}
        onClose={() => setSelected(null)}
        onOpenTopUp={() => setTopUpOpen(true)}
      />

      <SkillPackAnimation
        open={packOpen}
        collectionId={activeCollection}
        onClose={closeCollection}
        onReveal={setSelected}
      />

      <MyDeckDrawer open={deckOpen} onClose={() => setDeckOpen(false)} />

      <TopUpEnergyModal open={topUpOpen} onClose={() => setTopUpOpen(false)} />

      <TopUpCreditsModal open={topUpCreditsOpen} onClose={() => setTopUpCreditsOpen(false)} />

      <PublishSkillModal open={publishOpen} onClose={() => setPublishOpen(false)} />
    </div>
  );
}
