"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SkillGrid } from "@/components/SkillGrid";
import { SmartPicks } from "@/components/SmartPicks";
import { CardDetailModal } from "@/components/premium/CardDetailModal";
import { useAllSkills } from "@/lib/useAllSkills";
import { useOnchainSkills, useNextSkillId } from "@/lib/useOrchor";
import { useSkillStats } from "@/lib/hooks/useSkillStats";
import { ORCHOR_CORE_ADDRESS, activeChain } from "@/lib/chain";
import { useI18n } from "@/lib/i18n";
import type { SkillModule } from "@/lib/skills";

/**
 * 首页 = 介绍页。完整市场在 /marketplace 与 /explore ——
 * 改版初稿曾把 `/` 直接做成市场,三个入口互相重复,叙事也没了落点。
 *
 * 保持的原则:
 * · 统计与精选全部来自合约读数/事件索引,读不到显示破折号,不编造。
 * · 金色仍是稀缺资源;动效只有颜色过渡。
 */

export default function Home() {
  const allSkills = useAllSkills();
  const { skills: onchain } = useOnchainSkills();
  const { nextSkillId } = useNextSkillId();
  const { stats } = useSkillStats();
  const { t } = useI18n();
  const [selected, setSelected] = useState<SkillModule | null>(null);

  const explorer = activeChain.blockExplorers?.default.url;
  const explorerUrl = explorer ? `${explorer}/address/${ORCHOR_CORE_ADDRESS}` : undefined;

  const totalMinted = useMemo(() => {
    if (!onchain.size) return null;
    let n = 0;
    onchain.forEach((s) => (n += s.minted));
    return n;
  }, [onchain]);

  /**
   * 精选:按真实调用量排序取 6 张;统计没到位时按目录序(只是预览子集,不涉造假)。
   * 黑金卡至多 1 张 —— 每张 Mythic 自带金边/金名/金按钮 3 处金色,
   * 两张同屏就冲破"金色整屏≤3处"的预算。这是编辑性选取,不改数据。
   */
  const featured = useMemo(() => {
    const pool = [...allSkills];
    if (stats) pool.sort((a, b) => (stats[b.id]?.calls ?? 0) - (stats[a.id]?.calls ?? 0));
    const out: SkillModule[] = [];
    let mythics = 0;
    for (const s of pool) {
      if (out.length === 6) break;
      if (s.rarity === "Mythic" && mythics >= 1) continue;
      if (s.rarity === "Mythic") mythics++;
      out.push(s);
    }
    return out;
  }, [allSkills, stats]);

  return (
    <main className="mx-auto max-w-[1440px] px-6 lg:px-10">
      {/* ── Hero ── */}
      <header className="pt-20 pb-12 max-w-[720px]">
        <p className="m-0 flex items-center gap-2 text-[11px] tracking-[2.5px]" style={{ color: "var(--o-ink-3)" }}>
          <span className="inline-block h-[5px] w-[5px] rounded-full" style={{ background: "var(--o-up)" }} />
          {t("hero.eyebrow")}
        </p>
        <h1
          className="mt-6 mb-0 text-[40px] sm:text-[52px] leading-[1.12]"
          style={{ fontFamily: "var(--o-serif)", color: "var(--o-ink)", letterSpacing: ".5px" }}
        >
          {t("hero.title")}
        </h1>
        <p className="mt-5 mb-0 text-[14px] leading-[1.85] max-w-[560px]" style={{ color: "var(--o-ink-3)" }}>
          {t("hero.lede")}
        </p>
        <div className="mt-8 flex items-center gap-5">
          <Link
            href="/marketplace"
            className="no-underline text-[13px] tracking-[3px] px-7 py-3 rounded-[var(--o-r-btn)] transition-[filter] duration-150 hover:brightness-95"
            style={{ background: "#ede7d8", color: "#141209" }}
          >
            {t("hero.ctaMarket")}
          </Link>
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="no-underline text-[12px] transition-colors duration-150"
              style={{ color: "var(--o-ink-3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#cfc4ac")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--o-ink-3)")}
            >
              {t("hero.ctaVerify")} ↗
            </a>
          )}
        </div>
      </header>

      {/* ── 真实链上读数 ── */}
      <dl
        className="flex flex-wrap gap-x-10 gap-y-5 pt-6 pb-2"
        style={{ borderTop: "0.5px solid var(--o-line)" }}
      >
        <Stat label={t("market.registered")} value={nextSkillId ? String(nextSkillId) : "—"} />
        <Stat label={t("market.mintedTotal")} value={totalMinted === null ? "—" : String(totalMinted)} />
        <Stat label={t("market.network")} value={activeChain.name} small />
        <Stat
          label={t("market.contract")}
          value={`${t("market.verified")} ↗`}
          accent="var(--o-up)"
          href={explorerUrl}
          small
        />
      </dl>

      {/* ── 怎么玩:三步 ── */}
      <section className="mt-12">
        <h2 className="m-0 text-[11px] tracking-[2px]" style={{ color: "var(--o-ink-3)" }}>
          {t("hero.how")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-5">
          {([1, 2, 3] as const).map((n) => (
            <div key={n} className="pt-4" style={{ borderTop: "0.5px solid var(--o-line)" }}>
              <span className="text-[11px] tracking-[2.5px]" style={{ fontFamily: "var(--o-serif)", color: "#5f5949" }}>
                {String(n).padStart(2, "0")}
              </span>
              <h3 className="mt-2 mb-0 text-[17px]" style={{ fontFamily: "var(--o-serif)", color: "var(--o-ink)" }}>
                {t(`hero.step${n}t` as never)}
              </h3>
              <p className="mt-2 mb-0 text-[12px] leading-[1.75]" style={{ color: "var(--o-ink-3)" }}>
                {t(`hero.step${n}d` as never)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 智能推荐(真实链上指标) ── */}
      <div className="mt-12">
        <SmartPicks skills={allSkills} onSelect={setSelected} />
      </div>

      {/* ── 精选卡片 ── */}
      <section className="mt-2 pb-16">
        <div className="flex items-baseline justify-between mb-5 pt-5" style={{ borderTop: "0.5px solid var(--o-line)" }}>
          <h2 className="m-0 text-[11px] tracking-[2px]" style={{ color: "var(--o-ink-3)" }}>
            {t("hero.featured")}
          </h2>
          <Link
            href="/marketplace"
            className="no-underline text-[12px] transition-colors duration-150"
            style={{ color: "var(--o-ink-3)" }}
          >
            {t("hero.viewAll", { n: allSkills.length })} →
          </Link>
        </div>
        <SkillGrid skills={featured} onSelect={setSelected} />
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
