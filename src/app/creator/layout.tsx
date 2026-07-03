import { ReactNode } from "react";
import { BackgroundFX } from "@/components/BackgroundFX";
import { TopNav } from "@/components/TopNav";

export default function CreatorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-bg text-white">
      <BackgroundFX />
      <TopNav
        onOpenDeck={() => {}}
        onOpenTopUp={() => {}}
        onOpenTopUpCredits={() => {}}
        onOpenPublish={() => {}}
      />
      <main>{children}</main>
    </div>
  );
}
