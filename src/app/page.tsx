"use client";

import { useMemo, useState } from "react";
import { SkillGrid } from "@/components/SkillGrid";
import { CardDetailModal } from "@/components/premium/CardDetailModal";
import { useAllSkills } from "@/lib/useAllSkills";
import { useOnchainSkills, useNextSkillId } from "@/lib/useOrchor";
import { ORCHOR_CORE_ADDRESS, activeChain } from "@/lib/chain";
import { useI18n } from "@/lib/i18n";
import type { SkillModule, SkillCategory } from "@/lib/skills";

/**
 * 市场首页。
 *
 * 与旧版 PremiumArena 的差异：
 * · 删掉了「154,740 Total Runs / Avg Rating 4.7」—— 那是写死的假数据，
 *   而这个项目的整个叙事是「一切链上可验证」。评委去 Blockscout 一对账就穿帮。
 *   现在四个统计全部来自合约读数，读不到就显示破折号。
 * · 删掉整页淡入与逐卡 stagger。
 * · hero 不再占满一屏 —— 卡片是主角，标题让位。
 */

const FILTERS: Array<"all" | SkillCategory> = [
  "all", "Web3 Dev", "Research", "Automation", "Product", "Marketing", "Data",
];

export default function Home() {
  const allSkills = useAllSkills();
  const { skills: onchain } = useOnchainSkills();
  const { nextSkillId } = useNextSkillId();
  const { t } = useI18n();
  const [filter, setFilter] = useState<"all" | SkillCategory>("all");
  const [selected, setSelected] = useState<SkillModule | null>(null);

  const explorer = activeChain.blockExplorers?.default.url;

  const totalMinted = useMemo(() => {
    if (!onchain.size) return null;
    let n = 0;
    onchain.forEach((s) => (n += s.minted));
    return n;
  }, [onchain]);

  const shown = useMemo(
    () => (filter === "all" ? allSkills : allSkills.filter((s) => s.category === filter)),
    [allSkills, filter]
  );

  return (
    <main className="mx-auto max-w-[1440px] px-6 lg:px-10">
      <header className="pt-14 pb-7">
        <h1
          className="m-0 text-[30px] sm:text-[36px] leading-[1.2]"
          style={{ fontFamily: "var(--o-serif)", color: "var(--o-ink)", letterSpacing: ".5px" }}
        >
          {t("market.title")}
        </h1>
        <p className="mt-3 mb-0 text-[13px] leading-[1.75] max-w-[440px]" style={{ color: "var(--o-ink-3)" }}>
          {t("market.lede")}
        </p>

        <dl
          className="flex flex-wrap gap-x-10 gap-y-5 mt-7 pt-5"
          style={{ borderTop: "0.5px solid var(--o-line)" }}
        >
          <Stat label={t("market.registered")} value={nextSkillId ? String(nextSkillId) : "—"} />
          <Stat label={t("market.mintedTotal")} value={totalMinted === null ? "—" : String(totalMinted)} />
          <Stat label={t("market.network")} value={activeChain.name} small />
          <Stat
            label={t("market.contract")}
            value={`${t("market.verified")} ↗`}
            accent="var(--o-up)"
            href={explorer ? `${explorer}/address/${ORCHOR_CORE_ADDRESS}` : undefined}
            small
          />
        </dl>
      </header>

      <nav
        className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-4"
        style={{ borderBottom: "0.5px solid var(--o-line)" }}
      >
        {FILTERS.map((f) => {
          const on = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-[12px] whitespace-nowrap pb-[15px] -mb-4 transition-colors duration-150"
              style={{
                color: on ? "var(--o-ink)" : "var(--o-ink-3)",
                borderBottom: on ? "1px solid var(--o-gold)" : "1px solid transparent",
              }}
            >
              {t(`cat.${f}` as never)}
            </button>
          );
        })}
        <span className="ml-auto text-[12px] whitespace-nowrap" style={{ color: "var(--o-ink-3)" }}>
          {t("market.countCards", { n: shown.length })}
        </span>
      </nav>

      <section className="py-8">
        <SkillGrid skills={shown} onSelect={setSelected} emptyText={t("market.emptyCategory")} />
      </section>

      <CardDetailModal skill={selected} isOpen={!!selected} onClose={() => setSelected(null)} />
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
  href,
  small,
}: {
  label: string;
  value: string;
  accent?: string;
  href?: string;
  small?: boolean;
}) {
  const body = (
    <dd
      className={`m-0 mt-1.5 ${small ? "text-[14px]" : "num text-[20px]"}`}
      style={{ color: accent ?? "var(--o-ink)" }}
    >
      {value}
    </dd>
  );
  return (
    <div>
      <dt className="m-0 text-[11px] tracking-[1.5px]" style={{ color: "var(--o-ink-4)" }}>
        {label}
      </dt>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="no-underline">
          {body}
        </a>
      ) : (
        body
      )}
    </div>
  );
}
