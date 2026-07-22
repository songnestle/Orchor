"use client";

import { motion } from "framer-motion";
import { useOrchorState } from "@/lib/useOrchorState";
import { useNextSkillId } from "@/lib/useOrchor";

interface Props {
  onOpenPack: () => void;
  onExplore: () => void;
}

export function HeroSection({ onOpenPack, onExplore }: Props) {
  const { owned, subscribed } = useOrchorState();
  const { nextSkillId } = useNextSkillId();

  return (
    <section className="relative pt-10 pb-8">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#bf5b4b] animate-pulseDot" />
            <span className="text-mutedHi tracking-wide uppercase">
              Season 01 · Live on Injective Testnet
            </span>
          </div>

          <h1 className="mt-5 font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02]">
            The <span className="text-gradient">Skill Layer</span>{" "}
            for AI Agents.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-mutedHi max-w-2xl leading-relaxed">
            Orchor turns AI capabilities into{" "}
            <span className="text-white">collectible, programmable Skills</span>{" "}
            — packaged as <span className="font-mono text-[#b6c98f]">.or</span>{" "}
            files, registered and settled on-chain on{" "}
            <span className="text-white">Injective</span>. No API keys. Just{" "}
            <span className="text-[#f0d493]">⚡ Energy</span>.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenPack}
              className="btn-neon px-6 h-12 rounded-2xl text-sm tracking-wide inline-flex items-center gap-2"
            >
              <SparkIcon /> Open Skill Pack
            </button>
            <button
              onClick={onExplore}
              className="btn-ghost px-6 h-12 rounded-2xl text-sm tracking-wide inline-flex items-center gap-2"
            >
              Discover Skills
              <span className="text-mutedHi">→</span>
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-mutedHi">
            <Stat label="In your deck" value={owned.size} accent="text-gradient" />
            <span className="opacity-40">·</span>
            <Stat label="Subscribed" value={subscribed.size} accent="text-[#b6c98f]" />
            <span className="opacity-40">·</span>
            <Stat label="Skills onchain" value={nextSkillId} />
            <span className="opacity-40">·</span>
            <Stat label="Energy rate" value="1 INJ = 100 ⚡" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className={`font-display font-semibold tabular ${accent || "text-white"}`}>
        {value}
      </span>
      <span className="uppercase tracking-wider text-[10px] text-muted">{label}</span>
    </span>
  );
}

function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z"
        fill="white"
      />
    </svg>
  );
}
