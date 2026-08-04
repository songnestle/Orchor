"use client";

import { useMemo } from "react";
import { CertificateCard } from "./CertificateCard";
import { useBalances, useOnchainSkills, useOrchorWrites } from "@/lib/useOrchor";
import { useSkillStats } from "@/lib/hooks/useSkillStats";
import { ORCHOR_CORE_ADDRESS, activeChain } from "@/lib/chain";
import { useI18n } from "@/lib/i18n";
import type { SkillModule } from "@/lib/skills";

/**
 * SkillGrid — 全站唯一的卡片网格。
 *
 * 把链上读取集中在这里做一次，页面只管传 skills。
 * 之前每个页面各自 map + PremiumSkillCard，导致同样的 RPC 被重复发起，
 * 而且改一处样式要改六个文件。
 *
 * 没有 stagger 入场动画 —— 原来的 delay: index * 0.05 让第 20 张卡
 * 在 1 秒后才出现，而且卡越多越慢。
 */

interface Props {
  skills: SkillModule[];
  onSelect?: (skill: SkillModule) => void;
  emptyText?: string;
}

export function SkillGrid({ skills, onSelect, emptyText }: Props) {
  const { t } = useI18n();
  const { balances } = useBalances();
  const { skills: onchain } = useOnchainSkills();
  const { unlock } = useOrchorWrites();
  const { stats } = useSkillStats();

  const explorer = activeChain.blockExplorers?.default.url;

  const items = useMemo(() => skills, [skills]);

  // 全站单日调用峰值:所有卡的曲线共用这把尺子,卡间高度差才等于调用量差。
  const seriesPeak = useMemo(() => {
    if (!stats) return undefined;
    let peak = 0;
    for (const s of Object.values(stats)) {
      for (const v of s.series ?? []) if (v > peak) peak = v;
    }
    return peak || undefined;
  }, [stats]);

  if (!items.length) {
    return (
      <p className="text-[13px] py-16 text-center" style={{ color: "var(--o-ink-3)" }}>
        {emptyText ?? t("market.empty")}
      </p>
    );
  }

  return (
    <div className="grid gap-[18px] grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map((skill) => {
        const chain = onchain.get(skill.id);
        // 中英文语序不同，供给说明用带占位符的 key 而不是拼字符串。
        const supplyLabel = chain
          ? chain.mintCap > 0
            ? t("cert.minted", { a: chain.minted, b: chain.mintCap })
            : chain.minted > 0
              ? t("cert.circulating", { n: chain.minted })
              : t("cert.notMinted")
          : undefined;

        return (
          <CertificateCard
            key={skill.id}
            skill={skill}
            unlockPriceWei={chain?.unlockPriceWei}
            supplyLabel={supplyLabel}
            balance={balances.get(skill.id) ?? 0}
            onchainCalls={stats?.[skill.id]?.calls}
            creatorEarned={stats?.[skill.id]?.creatorEarnedInj}
            series={stats?.[skill.id]?.series ?? (stats ? [] : undefined)}
            seriesPeak={seriesPeak}
            onClick={() => onSelect?.(skill)}
            onUnlock={() => {
              if (!chain) return;
              void unlock(skill.id, chain.unlockPriceWei, 1);
            }}
            onVerify={() => {
              if (explorer) window.open(`${explorer}/address/${ORCHOR_CORE_ADDRESS}`, "_blank");
            }}
          />
        );
      })}
    </div>
  );
}
