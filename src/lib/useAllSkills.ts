"use client";

import { useMemo } from "react";
import { SKILL_MODULES, type SkillModule } from "./skills";
import { usePublished } from "./publishedStore";

/**
 * Source of truth for skill listings: static seed catalog + any skills
 * the user has published locally (persisted to localStorage).
 *
 * In production this would be: static seed + chain-indexed skills + IPFS
 * metadata. For now the static seed represents what's onchain at deploy
 * time; user-published skills live alongside as off-chain metadata keyed
 * by the onchain skillId returned from registerSkill.
 */
export function useAllSkills(): SkillModule[] {
  const items = usePublished((s) => s.items);
  return useMemo(() => {
    const userSkills = Object.values(items)
      .map((m) => m.skill)
      .filter((s) => !SKILL_MODULES.some((seed) => seed.id === s.id));
    return [...SKILL_MODULES, ...userSkills];
  }, [items]);
}
