"use client";

import type { Rarity } from "@/lib/rarity";

/**
 * 稀有度是金属，不是色块。
 * 五个金属名只靠字色区分 —— 填充徽章在网格里会形成噪点，
 * 两个字的小字反而更贵气。唯一的例外是黑金卡的边框。
 */

const METAL: Record<Rarity, { label: string; color: string }> = {
  Common:    { label: "青铜", color: "#a07d54" },
  Rare:      { label: "白银", color: "#b9bfc5" },
  Epic:      { label: "黄金", color: "#d7b76e" },
  Legendary: { label: "铂金", color: "#d9dde1" },
  Mythic:    { label: "黑金", color: "#e8d5a0" },
};

const SIZE = {
  sm: "text-[11px] tracking-[2px]",
  md: "text-[12px] tracking-[2.5px]",
  lg: "text-[14px] tracking-[3px]",
} as const;

interface Props {
  rarity: Rarity;
  size?: keyof typeof SIZE;
  /** 保留旧签名，不再有动画 —— 安静的界面比会动的界面高级。 */
  animated?: boolean;
}

export function RarityBadge({ rarity, size = "md" }: Props) {
  const metal = METAL[rarity];
  return (
    <span className={SIZE[size]} style={{ color: metal.color }}>
      {metal.label}
    </span>
  );
}

export function rarityMetal(rarity: Rarity) {
  return METAL[rarity];
}
