"use client";

import { useMemo, useState } from "react";
import { useAllSkills } from "@/lib/useAllSkills";
import { useI18n } from "@/lib/i18n";
import { SkillGrid } from "@/components/SkillGrid";
import { CardDetailModal } from "@/components/premium/CardDetailModal";
import { FilterPills } from "@/components/FilterPills";
import { useSkillStats } from "@/lib/hooks/useSkillStats";
import type { SkillModule, SkillCategory } from "@/lib/skills";

type SortKey = "calls" | "priceAsc" | "priceDesc" | "newest";

const CATEGORIES: Array<"all" | SkillCategory> = [
  "all", "Web3 Dev", "Research", "Automation", "Product", "Marketing", "Data",
];

/**
 * 市场页 —— 全部卡片的主浏览入口。
 *
 * 这里曾经用 Math.random() 现编挂单价与拍卖倒计时:每次刷新价格都变,
 * 且 SSR/CSR 不一致直接触发 hydration 报错。二级市场数据必须来自链上;
 * 索引接好之前只展示一级市场的真实价格。
 */
export default function MarketplacePage() {
  const allSkills = useAllSkills();
  const { t } = useI18n();
  const { stats } = useSkillStats();
  const [category, setCategory] = useState<"all" | SkillCategory>("all");
  const [sort, setSort] = useState<SortKey>("calls");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SkillModule | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    let pool = category === "all" ? [...allSkills] : allSkills.filter((s) => s.category === category);
    if (q) {
      // 中英双搜:中文用户搜"扫描",英文用户搜 "scanner",都要命中
      pool = pool.filter((s) =>
        [s.title, s.shortDescription, s.creatorHandle, s.category, s.zh?.title, s.zh?.shortDescription]
          .filter(Boolean)
          .some((f) => String(f).toLowerCase().includes(q))
      );
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
    <main className="mx-auto max-w-[1440px] px-6 lg:px-10">
      <header className="pt-12 pb-7">
        <h1
          className="m-0 text-[28px] leading-[1.2]"
          style={{ fontFamily: "var(--o-serif)", color: "var(--o-ink)" }}
        >
          {t("market.title")}
        </h1>
        <p className="mt-2.5 mb-0 text-[14px]" style={{ color: "var(--o-ink-dim)" }}>
          {t("market.lede")}
        </p>
      </header>

      {/* 搜索。32 张卡已经超出"扫一眼找到"的规模,而站里一直没有搜索框。 */}
      <div className="pb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("market.searchPlaceholder")}
          className="w-full text-[14px] px-4 py-3 outline-none transition-colors duration-150"
          style={{
            borderRadius: "var(--o-r-btn)",
            background: "var(--o-raise)",
            border: "1px solid transparent",
            color: "var(--o-ink)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--o-hair-hi)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "transparent")}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 pb-5">
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

      <section className="py-6 pb-16">
        <SkillGrid
          skills={shown}
          onSelect={setSelected}
          emptyText={query.trim() ? t("market.noMatch") : t("market.emptyCategory")}
        />
      </section>

      <CardDetailModal skill={selected} isOpen={!!selected} onClose={() => setSelected(null)} />
    </main>
  );
}
