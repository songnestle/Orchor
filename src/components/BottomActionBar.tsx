"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useOrchorState } from "@/lib/useOrchorState";
import { EnergyBolt, MonadIcon } from "./TopNav";

interface Props {
  onOpenPack: () => void;
  onOpenDeck: () => void;
  onOpenTopUp: () => void;
}

export const PACK_PRICE_MON = 0.5;

export function BottomActionBar({ onOpenPack, onOpenDeck, onOpenTopUp }: Props) {
  const { owned, subscribed, walletBalanceMON: balance, energy } = useOrchorState();
  const [countdown, setCountdown] = useState(secondsUntilTomorrow());

  useEffect(() => {
    const t = setInterval(() => setCountdown(secondsUntilTomorrow()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[min(96%,1080px)]">
      <div className="relative">
        <div
          className="absolute -inset-2 rounded-3xl blur-2xl opacity-60 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(139,92,246,0.5), rgba(34,211,238,0.5))",
          }}
        />
        <div className="relative rounded-2xl glass-strong px-4 py-3 flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-start min-w-[150px]">
            <span className="text-[9px] uppercase tracking-wider text-muted">
              Daily Discovery Resets
            </span>
            <span className="font-mono text-[13px] text-white tabular">
              {fmt(countdown)}
            </span>
          </div>

          <motion.button
            onClick={onOpenPack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative flex-1 h-12 rounded-xl btn-neon font-display tracking-wide text-[14px] flex items-center justify-center gap-2 overflow-hidden"
          >
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
              }}
            />
            <PackIcon />
            <span className="relative">Open New Skill Pack</span>
            <span className="relative font-mono text-[11px] opacity-80">
              · {PACK_PRICE_MON} MON
            </span>
          </motion.button>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenTopUp}
              className="flex items-center gap-1.5 px-3 h-10 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition"
              title="Top up Energy"
            >
              <EnergyBolt size={12} />
              <span className="font-mono text-[12px] text-white tabular">
                {energy}
              </span>
              <span className="text-[10px] text-muted">⚡</span>
            </button>
            <div className="flex items-center gap-2 px-3 h-10 rounded-xl border border-white/5 bg-white/[0.02]">
              <MonadIcon size={12} />
              <span className="font-mono text-[12px] text-white tabular">
                {balance.toFixed(2)}
              </span>
              <span className="text-[10px] text-muted">MON</span>
            </div>
            <button
              onClick={onOpenDeck}
              className="flex items-center gap-2 px-3 h-10 rounded-xl btn-ghost"
            >
              <DeckIcon />
              <span className="text-[11px] text-mutedHi">Deck</span>
              <span className="font-mono text-[12px] text-white tabular">
                {owned.size + subscribed.size}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function secondsUntilTomorrow() {
  const now = new Date();
  const tom = new Date(now);
  tom.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((tom.getTime() - now.getTime()) / 1000));
}

function fmt(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function PackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7 L12 3 L20 7 L20 17 L12 21 L4 17 Z"
        stroke="white"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M4 7 L12 11 L20 7" stroke="white" strokeWidth="1.6" />
      <path d="M12 11 L12 21" stroke="white" strokeWidth="1.6" />
    </svg>
  );
}

function DeckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="11" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="9" y="6" width="11" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" opacity="0.6" />
    </svg>
  );
}
