"use client";

import { create } from "zustand";

/**
 * 1 MON = 100 Energy. Mirrors OrchorCore.MON_TO_ENERGY().
 */
export const MON_TO_ENERGY = 100;

/**
 * deckStore now only holds UI-local state (recently-invoked list for the
 * "Recently Invoked" sidebar, and a tick counter used to nudge wagmi reads
 * after a tx confirms). Actual ownership / energy / wallet balance is read
 * directly from OrchorCore via wagmi hooks (see lib/useOrchor.ts).
 */
interface DeckState {
  recentInvocations: number[];
  /** Bumped after each successful onchain action so children can refetch. */
  refetchTick: number;
  noteInvoke: (id: number) => void;
  bumpRefetch: () => void;
}

export const useDeck = create<DeckState>((set) => ({
  recentInvocations: [],
  refetchTick: 0,
  noteInvoke: (id) =>
    set((s) => ({
      recentInvocations: [id, ...s.recentInvocations.filter((x) => x !== id)].slice(0, 6),
    })),
  bumpRefetch: () => set((s) => ({ refetchTick: s.refetchTick + 1 })),
}));
