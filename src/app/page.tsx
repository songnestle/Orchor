"use client";

import { useState } from "react";
import { PremiumArena } from "@/components/premium/PremiumArena";
import { CardDetailModal } from "@/components/premium/CardDetailModal";
import { PremiumToast } from "@/components/premium/PremiumToast";

import { type SkillModule } from "@/lib/skills";
import { useAllSkills } from "@/lib/useAllSkills";

export default function Home() {
  const allSkills = useAllSkills();
  const [selected, setSelected] = useState<SkillModule | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleSkillRun = (skill: SkillModule) => {
    showToast(`Running ${skill.title}...`);
    setSelected(skill);
  };

  const handleSkillCollect = (skill: SkillModule) => {
    showToast(`Collecting ${skill.title}...`);
    setSelected(skill);
  };

  return (
    <main className="min-h-screen">
      {/* Premium Arena */}
      <PremiumArena
        skills={allSkills}
        onSkillClick={setSelected}
        onSkillRun={handleSkillRun}
        onSkillCollect={handleSkillCollect}
      />

      {/* Card Detail Modal (opened by clicking a card) */}
      <CardDetailModal
        skill={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
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
