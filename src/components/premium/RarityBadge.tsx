"use client";

import { useI18n } from "@/lib/i18n";
import type { Rarity } from "@/lib/rarity";

/**
 * 稀有度是金属，不是色块。
 * 五个金属名只靠字色区分 —— 填充徽章在网格里会形成噪点，
 * 两个字的小字反而更贵气。唯一的例外是黑金卡的边框。
 */

/** 只管颜色；文案在 i18n 的 metal.* 里。 */
const METAL_COLOR: Record<Rarity, string> = {
  Common: "#a07d54",
  Rare: "#b9bfc5",
  Epic: "#d7b76e",
  Legendary: "#d9dde1",
  Mythic: "#e8d5a0",
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
  const { t } = useI18n();
  return (
    <span className={SIZE[size]} style={{ color: METAL_COLOR[rarity] }}>
      {t(`metal.${rarity}` as never)}
    </span>
  );
}

export function rarityColor(rarity: Rarity) {
  return METAL_COLOR[rarity];
}
