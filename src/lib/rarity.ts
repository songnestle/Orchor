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

export const RARITY: Record<Rarity, RarityTheme> = {
  Common: {
    label: "Common",
    glow: "#7a8a9a",
    accent: "#9aa6b2",
    border:
      "linear-gradient(135deg, rgba(154,166,178,0.55), rgba(154,166,178,0.15) 40%, rgba(154,166,178,0.55))",
    sheen:
      "linear-gradient(135deg, rgba(154,166,178,0.10), rgba(255,255,255,0.02) 40%, rgba(154,166,178,0.06))",
    shadow: "0 20px 60px -20px rgba(154,166,178,0.35)",
    tagBg: "rgba(154,166,178,0.12)",
    tagText: "#cdd5de",
  },
  Rare: {
    label: "Rare",
    glow: "#22d3ee",
    accent: "#38bdf8",
    border:
      "linear-gradient(135deg, rgba(34,211,238,0.7), rgba(56,189,248,0.25) 40%, rgba(34,211,238,0.7))",
    sheen:
      "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(56,189,248,0.05) 50%, rgba(34,211,238,0.10))",
    shadow: "0 24px 70px -18px rgba(34,211,238,0.5)",
    tagBg: "rgba(34,211,238,0.15)",
    tagText: "#7dd3fc",
  },
  Epic: {
    label: "Epic",
    glow: "#a855f7",
    accent: "#8b5cf6",
    border:
      "linear-gradient(135deg, rgba(168,85,247,0.85), rgba(139,92,246,0.3) 40%, rgba(168,85,247,0.85))",
    sheen:
      "linear-gradient(135deg, rgba(168,85,247,0.20), rgba(139,92,246,0.07) 50%, rgba(168,85,247,0.15))",
    shadow: "0 28px 80px -16px rgba(168,85,247,0.55)",
    tagBg: "rgba(168,85,247,0.18)",
    tagText: "#d8b4fe",
  },
  Legendary: {
    label: "Legendary",
    glow: "#f59e0b",
    accent: "#fb923c",
    border:
      "linear-gradient(135deg, rgba(251,191,36,0.95), rgba(244,114,182,0.55) 30%, rgba(168,85,247,0.85) 60%, rgba(251,191,36,0.95))",
    sheen:
      "linear-gradient(135deg, rgba(251,191,36,0.22), rgba(244,114,182,0.10) 40%, rgba(168,85,247,0.18) 70%, rgba(251,191,36,0.22))",
    shadow:
      "0 30px 90px -14px rgba(251,191,36,0.45), 0 0 60px -10px rgba(168,85,247,0.5)",
    tagBg: "linear-gradient(90deg, rgba(251,191,36,0.25), rgba(168,85,247,0.25))",
    tagText: "#fde68a",
  },
  Mythic: {
    label: "Mythic",
    glow: "#f472b6",
    accent: "#67e8f9",
    border:
      "linear-gradient(135deg, #67e8f9 0%, #a78bfa 25%, #f472b6 50%, #fde68a 75%, #67e8f9 100%)",
    sheen:
      "linear-gradient(135deg, rgba(103,232,249,0.25), rgba(167,139,250,0.18) 30%, rgba(244,114,182,0.22) 60%, rgba(253,230,138,0.18) 90%)",
    shadow:
      "0 36px 110px -12px rgba(244,114,182,0.55), 0 0 90px -10px rgba(103,232,249,0.55), 0 0 120px -10px rgba(167,139,250,0.5)",
    tagBg:
      "linear-gradient(90deg, rgba(103,232,249,0.30), rgba(244,114,182,0.30), rgba(253,230,138,0.30))",
    tagText: "#fdf4ff",
  },
};

export function rarityOrder(r: Rarity): number {
  return { Common: 0, Rare: 1, Epic: 2, Legendary: 3, Mythic: 4 }[r];
}
