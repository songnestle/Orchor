"use client";

import { useEffect, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { BackgroundFX } from "@/components/BackgroundFX";
import { MyDeckDrawer } from "@/components/MyDeckDrawer";
import { TopUpEnergyModal } from "@/components/TopUpEnergyModal";
import { TopUpCreditsModal } from "@/components/TopUpCreditsModal";
import { PublishSkillModal } from "@/components/PublishSkillModal";

/**
 * App-wide chrome: background, top navigation bar, and the global modals the
 * nav can open (deck, top-up, publish). Rendered once in the root layout so
 * the nav bar is always present on every page.
 */
export function AppChrome({ children }: { children: React.ReactNode }) {
  const [deckOpen, setDeckOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpCreditsOpen, setTopUpCreditsOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  // Any component (e.g. a card modal on a sub-page) can request the top-up
  // dialog by dispatching this event, without needing a callback prop.
  useEffect(() => {
    const open = () => setTopUpCreditsOpen(true);
    window.addEventListener("orchor:open-topup", open);
    return () => window.removeEventListener("orchor:open-topup", open);
  }, []);

  return (
    <>
      <BackgroundFX />

      <TopNav
        onOpenDeck={() => setDeckOpen(true)}
        onOpenTopUp={() => setTopUpOpen(true)}
        onOpenTopUpCredits={() => setTopUpCreditsOpen(true)}
        onOpenPublish={() => setPublishOpen(true)}
      />

      {children}

      <MyDeckDrawer
        open={deckOpen}
        onClose={() => setDeckOpen(false)}
        onOpenSkill={() => setDeckOpen(false)}
      />
      <TopUpEnergyModal open={topUpOpen} onClose={() => setTopUpOpen(false)} />
      <TopUpCreditsModal open={topUpCreditsOpen} onClose={() => setTopUpCreditsOpen(false)} />
      <PublishSkillModal open={publishOpen} onClose={() => setPublishOpen(false)} />
    </>
  );
}
