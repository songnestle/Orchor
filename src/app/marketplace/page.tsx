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
  const [selected, setSelected] = useState<SkillModule | null>(null);

  const shown = useMemo(() => {
    const pool = category === "all" ? [...allSkills] : allSkills.filter((s) => s.category === category);
    const callsOf = (s: SkillModule) => stats?.[s.id]?.calls ?? -1;
    switch (sort) {
      case "calls": return pool.sort((a, b) => callsOf(b) - callsOf(a));
      case "priceAsc": return pool.sort((a, b) => a.priceMON - b.priceMON);
      case "priceDesc": return pool.sort((a, b) => b.priceMON - a.priceMON);
      case "newest": return pool.sort((a, b) => b.id - a.id);
    }
  }, [allSkills, category, sort, stats]);

  return (
    <main className="mx-auto max-w-[1440px] px-6 lg:px-10">
      <header className="pt-12 pb-6">
        <h1
          className="m-0 text-[30px] leading-[1.2]"
          style={{ fontFamily: "var(--o-serif)", color: "var(--o-ink)", letterSpacing: ".5px" }}
        >
          {t("market.title")}
        </h1>
        <p className="mt-2.5 mb-0 text-[13px]" style={{ color: "var(--o-ink-3)" }}>
          {t("market.lede")}
        </p>
      </header>

      <div
        className="flex flex-wrap items-center gap-3 py-4"
        style={{ borderTop: "1px solid var(--o-hair)" }}
      >
        <FilterPills
          options={CATEGORIES.map((c) => ({ key: c, label: t(`cat.${c}` as never) }))}
          value={category}
          onChange={(k) => setCategory(k as "all" | SkillCategory)}
        />
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[12px]" style={{ color: "var(--o-ink-4)" }}>
            {t("market.countCards", { n: shown.length })}
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="text-[12px] px-3 py-2 outline-none cursor-pointer"
            style={{
              borderRadius: "var(--o-r-btn)",
              background: "var(--o-surface)",
              border: "1px solid var(--o-hair)",
              color: "var(--o-ink-2)",
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
        <SkillGrid skills={shown} onSelect={setSelected} emptyText={t("market.emptyCategory")} />
      </section>

      <CardDetailModal skill={selected} isOpen={!!selected} onClose={() => setSelected(null)} />
    </main>
  );
}
