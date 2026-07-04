"use client";

import { useState } from "react";
import { BackgroundFX } from "@/components/BackgroundFX";
import { TopNav } from "@/components/TopNav";
import { PremiumArena } from "@/components/premium/PremiumArena";
import { CardDetailModal } from "@/components/premium/CardDetailModal";
import { SkillDetailModal } from "@/components/SkillDetailModal";
import { MyDeckDrawer } from "@/components/MyDeckDrawer";
import { TopUpEnergyModal } from "@/components/TopUpEnergyModal";
import { TopUpCreditsModal } from "@/components/TopUpCreditsModal";
import { PublishSkillModal } from "@/components/PublishSkillModal";
import { PremiumToast } from "@/components/premium/PremiumToast";

import { type SkillModule } from "@/lib/skills";
import { useAllSkills } from "@/lib/useAllSkills";

export default function Home() {
  const allSkills = useAllSkills();
  const [selected, setSelected] = useState<SkillModule | null>(null);
  const [deckOpen, setDeckOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpCreditsOpen, setTopUpCreditsOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleSkillRun = (skill: SkillModule) => {
    showToast(`Running ${skill.title}...`);
    // Open the execution modal
    setSelected(skill);
  };

  const handleSkillCollect = (skill: SkillModule) => {
    showToast(`Collecting ${skill.title}...`);
    // Handle collect logic
  };

  return (
    <main className="min-h-screen">
      <BackgroundFX />

      <TopNav
        onOpenDeck={() => setDeckOpen(true)}
        onOpenTopUp={() => setTopUpOpen(true)}
        onOpenTopUpCredits={() => setTopUpCreditsOpen(true)}
        onOpenPublish={() => setPublishOpen(true)}
      />

      {/* Premium Arena */}
      <PremiumArena
        skills={allSkills}
        onSkillClick={setSelected}
        onSkillRun={handleSkillRun}
        onSkillCollect={handleSkillCollect}
      />

      {/* Card Detail Modal */}
      <CardDetailModal
        skill={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        onOpenTopUp={() => setTopUpOpen(true)}
        onOpenTopUpCredits={() => setTopUpCreditsOpen(true)}
      />

      <MyDeckDrawer
        open={deckOpen}
        onClose={() => setDeckOpen(false)}
        onOpenSkill={(id) => {
          const skill = allSkills.find(s => s.id === id);
          if (skill) setSelected(skill);
        }}
      />

      <TopUpEnergyModal
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
      />

      <TopUpCreditsModal
        open={topUpCreditsOpen}
        onClose={() => setTopUpCreditsOpen(false)}
      />

      <PublishSkillModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
      />

      {/* Toast notifications */}
      <PremiumToast
        message={toastMessage}
        type="info"
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </main>
  );
}
