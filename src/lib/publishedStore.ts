"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SkillModule, SkillCategory, OrigPlatform, RuntimeModel } from "./skills";
import type { Rarity } from "./rarity";

/**
 * Off-chain metadata for skills published by users on this client.
 * Onchain only stores: name / rarity / energyCost / prices / mintCap.
 * Everything else (description, pipeline, runtime, sample IO, creator
 * display name + handle) lives here. In production this would be a
 * backend / IPFS index — for the hackathon we persist to localStorage.
 */
export interface PublishedMeta {
  /** onchain skillId returned by registerSkill */
  skillId: number;
  /** ISO timestamp */
  publishedAt: string;
  /** publisher address */
  publisher: `0x${string}`;
  /** tx hash of the registerSkill call */
  txHash: `0x${string}`;
  /** the full SkillModule shape — same as static SKILL_MODULES */
  skill: SkillModule;
}

interface PublishedState {
  /** all skills any local user has published (keyed by skillId) */
  items: Record<number, PublishedMeta>;
  add: (m: PublishedMeta) => void;
  remove: (skillId: number) => void;
  list: () => PublishedMeta[];
}

export const usePublished = create<PublishedState>()(
  persist(
    (set, get) => ({
      items: {},
      add: (m) =>
        set((s) => ({ items: { ...s.items, [m.skillId]: m } })),
      remove: (skillId) =>
        set((s) => {
          const next = { ...s.items };
          delete next[skillId];
          return { items: next };
        }),
      list: () => Object.values(get().items).sort((a, b) => b.skillId - a.skillId),
    }),
    {
      name: "orchor.published.v1",
      // Set is not JSON-serializable, but we don't store any here.
      partialize: (s) => ({ items: s.items }),
    }
  )
);

/**
 * Helper: build a SkillModule from publish form input. Used both by the
 * modal (for live preview) and after a successful tx.
 */
export function buildSkillFromForm(input: {
  skillId: number;
  title: string;
  shortDescription: string;
  category: SkillCategory;
  rarity: Rarity;
  energyCost: number;
  priceMON: number;
  subscriptionMON: number;
  mintCap?: number;
  creator: string;
  creatorHandle: string;
  creatorAvatar: string;
  origin: OrigPlatform;
  model: RuntimeModel;
  tools: string[];
  memory: "none" | "ephemeral" | "persistent";
  pipeline: string[];
  inputExample: string;
  outputPreview: string;
}): SkillModule {
  return {
    id: input.skillId,
    title: input.title,
    creator: input.creator,
    creatorAvatar: input.creatorAvatar,
    creatorHandle: input.creatorHandle,
    category: input.category,
    rarity: input.rarity,
    pricingType: "PerInvoke",
    priceMON: input.priceMON,
    subscriptionMON: input.subscriptionMON,
    energyCost: input.energyCost,
    rating: 0,
    usageCount: 0,
    shortDescription: input.shortDescription,
    inputExample: input.inputExample,
    outputPreview: input.outputPreview,
    pipeline: input.pipeline,
    sparkline: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    origin: input.origin,
    runtime: {
      model: input.model,
      tools: input.tools,
      memory: input.memory,
      avgLatencyMs: 2200,
      tokenCostCents: 1.0,
    },
    ...(input.rarity === "Mythic" && input.mintCap
      ? { mintedOf: { current: 0, cap: input.mintCap } }
      : {}),
  };
}
