"use client";

import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { computePicks } from "@/lib/recommend";
import { useBalances, useOnchainSkills } from "@/lib/useOrchor";
import { useSkillStats } from "@/lib/hooks/useSkillStats";
import type { SkillModule } from "@/lib/skills";

/**
 * SmartPicks — 首页推荐条。
 *
 * 设计约束(同 CertificateCard):金是稀缺资源,这里一根金线都不用;
 * 发丝线分隔,文字层级靠字号与墨色。统计没加载或全零时整条隐藏 ——
 * 没有依据就不摆推荐位。
 */

interface Props {
  skills: SkillModule[];
  onSelect?: (skill: SkillModule) => void;
}

export function SmartPicks({ skills, onSelect }: Props) {
  const { t } = useI18n();
  const { stats } = useSkillStats();
  const { balances } = useBalances();
  const { skills: onchain } = useOnchainSkills();

  const prices = useMemo(() => {
    const m = new Map<number, bigint>();
    onchain.forEach((s, id) => m.set(id, s.unlockPriceWei));
    return m;
  }, [onchain]);

  const picks = useMemo(
    () => computePicks(skills, stats, balances, prices),
    [skills, stats, balances, prices]
  );

  if (!picks.length) return null;

  return (
    <section
      aria-label={t("picks.label")}
      className="flex flex-wrap items-stretch gap-x-10 gap-y-4 py-5 mt-6"
      style={{ borderTop: "0.5px solid var(--o-line)" }}
    >
      <div className="flex flex-col justify-center min-w-[92px]">
        <span className="text-[11px] tracking-[2px]" style={{ color: "var(--o-ink-3)" }}>
          {t("picks.label")}
        </span>
      </div>
      {picks.map((p) => (
        <button
          key={p.skill.id}
          onClick={() => onSelect?.(p.skill)}
          className="text-left group"
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <span className="block text-[11px] tracking-[1.2px]" style={{ color: "var(--o-ink-3)" }}>
            {t(p.reasonKey as never)}
          </span>
          <span
            className="block mt-1 text-[15px] transition-colors duration-150 group-hover:opacity-80"
            style={{ fontFamily: "var(--o-serif)", color: "var(--o-ink)" }}
          >
            {p.skill.title}
          </span>
          <span className="num block mt-0.5 text-[11px]" style={{ color: "var(--o-ink-3)" }}>
            {t("picks.calls", { n: p.calls })}
          </span>
        </button>
      ))}
    </section>
  );
}
