import type { Rarity } from "./rarity";

export interface SkillCollection {
  id: string;
  name: string;
  creator: string;
  creatorAvatar: string;
  skillIds: number[];
  unlockPriceMON: number;
  rarity: Rarity;
  tagline: string;
}

export const COLLECTIONS: SkillCollection[] = [
  {
    id: "vc-analyst-toolkit",
    name: "VC Analyst Toolkit",
    creator: "Atlas Labs",
    creatorAvatar: "AT",
    skillIds: [0, 2, 3],
    unlockPriceMON: 6.8,
    rarity: "Legendary",
    tagline: "From thesis to term sheet in one workflow.",
  },
  {
    id: "web3-security-pack",
    name: "Web3 Dev Security Pack",
    creator: "Cipher Forge",
    creatorAvatar: "CF",
    skillIds: [1, 7, 8],
    unlockPriceMON: 8.4,
    rarity: "Legendary",
    tagline: "Audit, explain, and ship contracts with confidence.",
  },
  {
    id: "product-growth-os",
    name: "Product Growth OS",
    creator: "Mesh Studio",
    creatorAvatar: "MS",
    skillIds: [4, 5, 6],
    unlockPriceMON: 5.2,
    rarity: "Epic",
    tagline: "Discovery → roadmap → launch, one deck.",
  },
];
