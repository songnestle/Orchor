"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SkillGrid } from "@/components/SkillGrid";
import { TrendingRail } from "@/components/TrendingRail";
import { FilterPills } from "@/components/FilterPills";
import { CardDetailModal } from "@/components/premium/CardDetailModal";
import { useAllSkills } from "@/lib/useAllSkills";
import { useNextSkillId } from "@/lib/useOrchor";
import { useSkillStats } from "@/lib/hooks/useSkillStats";
import { ORCHOR_CORE_ADDRESS, activeChain } from "@/lib/chain";
import { useI18n } from "@/lib/i18n";
import { matchSkill } from "@/lib/searchSkills";
import type { SkillModule, SkillCategory } from "@/lib/skills";

/**
 * 首页 = 市场。
 *
 * 这一页此前是"介绍页":44px 大标题 + 一段 lede + 四块统计 + 三步玩法 +
 * 推荐 + 六张精选,滚两屏才看得到货;而 /explore 和 /marketplace 又各自
 * 把同一批卡再铺一遍 —— 三个入口、一样的内容。
 *
 * 现在按 pools.trade 的信息架构:一行定位 + 热门横滑 + 筛选 + 全部卡片。
 * 叙事(怎么玩、为什么在 Injective)留在 README 与详情弹窗里,不占主页面。
 */

const CATEGORIES: Array<"all" | SkillCategory> = [
  "all", "Web3 Dev", "Research", "Automation", "Product", "Marketing", "Data",
];

type SortKey = "calls" | "priceAsc" | "priceDesc" | "newest";

function MarketHome() {
  const allSkills = useAllSkills();
  const { nextSkillId } = useNextSkillId();
  const { stats } = useSkillStats();
  const { t } = useI18n();
  const params = useSearchParams();
  const query = params.get("q") ?? "";

  const [category, setCategory] = useState<"all" | SkillCategory>("all");
  const [sort, setSort] = useState<SortKey>("calls");
  const [selected, setSelected] = useState<SkillModule | null>(null);

  const explorer = activeChain.blockExplorers?.default.url;
  const explorerUrl = explorer ? `${explorer}/address/${ORCHOR_CORE_ADDRESS}` : undefined;

  const shown = useMemo(() => {
    const q = query.trim();
    let pool = category === "all" ? [...allSkills] : allSkills.filter((s) => s.category === category);
    if (q) {
      pool = pool.filter((s) => matchSkill(s, q));
    }
    const callsOf = (s: SkillModule) => stats?.[s.id]?.calls ?? -1;
    switch (sort) {
      case "calls": return pool.sort((a, b) => callsOf(b) - callsOf(a));
      case "priceAsc": return pool.sort((a, b) => a.priceMON - b.priceMON);
      case "priceDesc": return pool.sort((a, b) => b.priceMON - a.priceMON);
      case "newest": return pool.sort((a, b) => b.id - a.id);
    }
  }, [allSkills, category, sort, stats, query]);

  return (
    <main className="mx-auto max-w-[1440px] px-6 lg:px-10 pb-20">
      {/* 一行定位。此前是 44px 大标题 + 段落 + 四块统计,占掉整个首屏。 */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-8 pb-7">
        <p className="m-0 text-[16px]" style={{ color: "var(--o-ink)" }}>
          {t("home.tagline")}
        </p>
        <p className="m-0 text-[16px]" style={{ color: "var(--o-ink-dim)" }}>
          {t("home.taglineSub", { n: nextSkillId ?? allSkills.length })}
        </p>
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[14px] no-underline transition-colors duration-150"
            style={{ color: "var(--o-up)" }}
          >
            {t("hero.ctaVerify")} ↗
          </a>
        )}
      </div>

      {!query && <TrendingRail skills={allSkills} onSelect={setSelected} />}

      <div className="flex flex-wrap items-center gap-3 pb-5 pt-2">
        <FilterPills
          options={CATEGORIES.map((c) => ({ key: c, label: t(`cat.${c}` as never) }))}
          value={category}
          onChange={(k) => setCategory(k as "all" | SkillCategory)}
        />
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[12px]" style={{ color: "var(--o-ink-faint)" }}>
            {t("market.countCards", { n: shown.length })}
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label={t("sort.label")}
            className="text-[12px] px-3 py-2 outline-none cursor-pointer"
            style={{
              borderRadius: "var(--o-r-pill)",
              background: "var(--o-raise)",
              border: "1px solid transparent",
              color: "var(--o-ink-dim)",
            }}
          >
            <option value="calls">{t("sort.calls")}</option>
            <option value="priceAsc">{t("sort.priceAsc")}</option>
            <option value="priceDesc">{t("sort.priceDesc")}</option>
            <option value="newest">{t("sort.newest")}</option>
          </select>
        </div>
      </div>

      <SkillGrid
        skills={shown}
        onSelect={setSelected}
        emptyText={query.trim() ? t("market.noMatch") : t("market.emptyCategory")}
      />

      <CardDetailModal skill={selected} isOpen={!!selected} onClose={() => setSelected(null)} />
    </main>
  );
}

export default function Home() {
  // useSearchParams 需要 Suspense 边界,否则整页在构建时退化为客户端渲染
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1440px] px-6 lg:px-10 pt-8" />}>
      <MarketHome />
    </Suspense>
  );
}
