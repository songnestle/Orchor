export type Rarity = "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";

export interface RarityTheme {
  label: Rarity;
  glow: string;
  accent: string;
  border: string;
  sheen: string;
  shadow: string;
  tagBg: string;
  tagText: string;
}

// Retro "aged cartridge" rarity themes — warm, muted, hard pixel shadows.
export const RARITY: Record<Rarity, RarityTheme> = {
  Common: {
    label: "Common",
    glow: "#8a7d63",
    accent: "#a89a80",
    border:
      "linear-gradient(135deg, rgba(138,125,99,0.7), rgba(138,125,99,0.25) 40%, rgba(138,125,99,0.7))",
    sheen:
      "linear-gradient(135deg, rgba(236,220,184,0.08), rgba(255,255,255,0.02) 40%, rgba(236,220,184,0.05))",
    shadow: "0 0 0 2px rgba(138,125,99,0.4), 4px 4px 0 rgba(0,0,0,0.4)",
    tagBg: "rgba(138,125,99,0.18)",
    tagText: "#cdbf9e",
  },
  Rare: {
    label: "Rare",
    glow: "#5a869c",
    accent: "#6d97ab",
    border:
      "linear-gradient(135deg, rgba(90,134,156,0.8), rgba(90,134,156,0.3) 40%, rgba(90,134,156,0.8))",
    sheen:
      "linear-gradient(135deg, rgba(90,134,156,0.15), rgba(109,151,171,0.05) 50%, rgba(90,134,156,0.10))",
    shadow: "0 0 0 2px rgba(90,134,156,0.5), 4px 4px 0 rgba(0,0,0,0.4)",
    tagBg: "rgba(90,134,156,0.18)",
    tagText: "#a9c6d5",
  },
  Epic: {
    label: "Epic",
    glow: "#8a6a9c",
    accent: "#9a7aac",
    border:
      "linear-gradient(135deg, rgba(138,106,156,0.85), rgba(138,106,156,0.3) 40%, rgba(138,106,156,0.85))",
    sheen:
      "linear-gradient(135deg, rgba(138,106,156,0.20), rgba(154,122,172,0.07) 50%, rgba(138,106,156,0.15))",
    shadow: "0 0 0 2px rgba(138,106,156,0.5), 5px 5px 0 rgba(0,0,0,0.4)",
    tagBg: "rgba(138,106,156,0.20)",
    tagText: "#c9aed5",
  },
  Legendary: {
    label: "Legendary",
    glow: "#d6a44c",
    accent: "#edc26a",
    border:
      "linear-gradient(135deg, rgba(214,164,76,0.95), rgba(191,91,75,0.5) 45%, rgba(214,164,76,0.95))",
    sheen:
      "linear-gradient(135deg, rgba(237,194,106,0.22), rgba(191,91,75,0.10) 50%, rgba(237,194,106,0.18))",
    shadow:
      "0 0 0 2px rgba(214,164,76,0.6), 5px 5px 0 rgba(0,0,0,0.4)",
    tagBg: "linear-gradient(90deg, rgba(214,164,76,0.28), rgba(191,91,75,0.22))",
    tagText: "#f0d493",
  },
  Mythic: {
    label: "Mythic",
    glow: "#bf5b4b",
    accent: "#d6a44c",
    border:
      "linear-gradient(135deg, #d6a44c 0%, #bf5b4b 40%, #8a6a9c 70%, #d6a44c 100%)",
    sheen:
      "linear-gradient(135deg, rgba(214,164,76,0.22), rgba(191,91,75,0.18) 45%, rgba(138,106,156,0.16) 80%)",
    shadow:
      "0 0 0 3px rgba(191,91,75,0.6), 6px 6px 0 rgba(0,0,0,0.4)",
    tagBg:
      "linear-gradient(90deg, rgba(214,164,76,0.3), rgba(191,91,75,0.3))",
    tagText: "#f4e4c8",
  },
};

export function rarityOrder(r: Rarity): number {
  return { Common: 0, Rare: 1, Epic: 2, Legendary: 3, Mythic: 4 }[r];
}
