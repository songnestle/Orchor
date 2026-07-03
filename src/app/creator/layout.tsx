"use client";

import { ReactNode, useState } from "react";
import { BackgroundFX } from "@/components/BackgroundFX";
import { TopNav } from "@/components/TopNav";

export default function CreatorLayout({ children }: { children: ReactNode }) {
  const [deckOpen, setDeckOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpCreditsOpen, setTopUpCreditsOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-bg text-white">
      <BackgroundFX />
      <TopNav
        onOpenDeck={() => setDeckOpen(true)}
        onOpenTopUp={() => setTopUpOpen(true)}
        onOpenTopUpCredits={() => setTopUpCreditsOpen(true)}
        onOpenPublish={() => setPublishOpen(true)}
      />
      <main>{children}</main>
    </div>
  );
}
