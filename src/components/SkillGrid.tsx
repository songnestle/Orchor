"use client";

import { useMemo } from "react";
import { CertificateCard } from "./CertificateCard";
import { useBalances, useOnchainSkills, useOrchorWrites } from "@/lib/useOrchor";
import { ORCHOR_CORE_ADDRESS, activeChain } from "@/lib/chain";
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

export function SkillGrid({ skills, onSelect, emptyText = "这里还没有卡片。" }: Props) {
  const { balances } = useBalances();
  const { skills: onchain } = useOnchainSkills();
  const { unlock } = useOrchorWrites();

  const explorer = activeChain.blockExplorers?.default.url;

  const items = useMemo(() => skills, [skills]);

  if (!items.length) {
    return (
      <p className="text-[13px] py-16 text-center" style={{ color: "var(--o-ink-3)" }}>
        {emptyText}
      </p>
    );
  }

  return (
    <div className="grid gap-[18px] grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map((skill) => {
        const chain = onchain.get(skill.id);
        const supplyLabel = chain
          ? chain.mintCap > 0
            ? `${chain.minted} / ${chain.mintCap}`
            : chain.minted > 0
              ? `${chain.minted} 份流通`
              : "尚未铸造"
          : undefined;

        return (
          <CertificateCard
            key={skill.id}
            skill={skill}
            unlockPriceWei={chain?.unlockPriceWei}
            supplyLabel={supplyLabel}
            balance={balances.get(skill.id) ?? 0}
            /* 链上调用次数需要事件索引，尚未接入 —— 传 undefined 让卡面显示「暂无记录」，
               而不是编一个好看的数字。 */
            onchainCalls={undefined}
            creatorEarned={undefined}
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
