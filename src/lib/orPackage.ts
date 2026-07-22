import type { SkillModule } from "./skills";
import { activeChain } from "./chain";

/**
 * Build a synthetic `.or Skill Package` manifest from a SkillModule.
 * This is the user-facing view of the Orchor Skill Protocol — what you'd
 * see if you ran `orchor export --dry`.
 */
export function buildOrPackage(skill: SkillModule) {
  const slug = skill.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return {
    protocol: "orchor/skill",
    version: "0.1.0",
    id: `or:${slug}@1.2.${skill.id}`,
    origin: skill.origin,
    manifest: {
      name: skill.title,
      description: skill.shortDescription,
      creator: skill.creator,
      creator_handle: skill.creatorHandle,
      category: skill.category,
      tags: [skill.category.toLowerCase(), skill.rarity.toLowerCase(), skill.origin.toLowerCase().replace(/\s+/g, "-")],
      rarity: skill.rarity,
      version: "1.2." + skill.id,
    },
    runtime: {
      hosted: true,
      network: "orchor.injective-testnet",
      model: skill.runtime.model,
      memory: skill.runtime.memory,
      tools: skill.runtime.tools,
      avg_latency_ms: skill.runtime.avgLatencyMs,
    },
    inputs: [
      { name: "prompt", type: "string", required: true, example: skill.inputExample },
    ],
    outputs: [
      { name: "result", type: "markdown" },
    ],
    pipeline: skill.pipeline.map((step, i) => ({
      step: i + 1,
      name: step,
    })),
    economics: {
      invoke_cost_energy: skill.energyCost,
      invoke_cost_usd_cents: skill.runtime.tokenCostCents,
      creator_share_bps: 7000,
      platform_share_bps: 2500,
      onchain_record_bps: 500,
    },
    permissions: {
      network: skill.runtime.tools.some((t) => t.startsWith("web.") || t.startsWith("chain.")),
      filesystem: skill.runtime.tools.some((t) => t.startsWith("fs.")),
      onchain_write: false,
    },
    onchain: {
      chain: activeChain.name.toLowerCase().replace(/\s+/g, "-"),
      chain_id: activeChain.id,
      skill_id: skill.id,
      ...(skill.mintedOf ? { minted: skill.mintedOf.current, cap: skill.mintedOf.cap } : {}),
    },
    signature: "0x" + (skill.id * 0xa7b3c9).toString(16).padStart(8, "0") + "…e41d",
  };
}

export type OrPackage = ReturnType<typeof buildOrPackage>;
