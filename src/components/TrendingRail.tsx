"use client";

import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { localizeSkill, type SkillModule } from "@/lib/skills";
import { useSkillStats } from "@/lib/hooks/useSkillStats";
import { useSkillArt } from "@/lib/hooks/useSkillArt";
import { useOnchainSkills } from "@/lib/useOrchor";

/**
 * 热门横滑区。
 *
 * 取代原来的 SmartPicks 文字条:同样是"按真实链上指标选出来的几张卡",
 * 但用横向卡呈现(图在左、数据在右),扫一眼就知道现在什么在被调用。
 *
 * 排序只用一个指标 —— 近 30 日真实调用量。没有调用数据时整条隐藏,
 * 不摆没有依据的"热门"。
 */
export function TrendingRail({
  skills,
  onSelect,
}: {
  skills: SkillModule[];
  onSelect?: (s: SkillModule) => void;
}) {
  const { t, lang } = useI18n();
  const { stats } = useSkillStats();
  const art = useSkillArt();
  const { skills: onchain } = useOnchainSkills();

  const top = useMemo(() => {
    if (!stats) return [];
    const scored = skills
      .map((s) => ({ s, calls: stats[s.id]?.calls ?? 0 }))
      .filter((x) => x.calls > 0)
      .sort((a, b) => b.calls - a.calls);
    return scored.slice(0, 4);
  }, [skills, stats]);

  if (!top.length) return null;

  return (
    <section aria-label={t("trending.label")} className="pb-7">
      <h2 className="m-0 mb-3 text-[12px]" style={{ color: "var(--o-ink-faint)" }}>
        {t("trending.label")}
      </h2>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {top.map(({ s, calls }) => {
          const text = localizeSkill(s, lang);
          const chain = onchain.get(s.id);
          const price =
            chain?.unlockPriceWei !== undefined
              ? formatEther3(chain.unlockPriceWei)
              : String(s.priceMON);
          return (
            <button
              key={s.id}
              onClick={() => onSelect?.(s)}
              className="flex items-stretch gap-3 p-2 text-left transition-colors duration-150"
              style={{
                borderRadius: "var(--o-r-card)",
                background: "var(--o-raise)",
                border: "1px solid transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--o-raise-hi)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--o-raise)")}
            >
              <span
                className="shrink-0 w-[72px] h-[72px] overflow-hidden"
                style={{ borderRadius: "var(--o-r-media)", background: "#0d0c09" }}
              >
                {art?.[s.id] && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={art[s.id]}
                    alt=""
                    className="w-full h-full object-cover object-top"
                    style={{ filter: "brightness(1.22) contrast(1.06)" }}
                  />
                )}
              </span>
              <span className="flex flex-col justify-center min-w-0 pr-1">
                <span
                  className="text-[14px] truncate"
                  style={{ fontFamily: "var(--o-serif)", color: "var(--o-ink)" }}
                >
                  {text.title}
                </span>
                <span className="num text-[12px] mt-1" style={{ color: "var(--o-ink-dim)" }}>
                  {price} INJ
                </span>
                <span className="num text-[12px] mt-0.5" style={{ color: "var(--o-up)" }}>
                  {t("picks.calls", { n: calls })}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** wei → 最多三位小数 */
function formatEther3(wei: bigint): string {
  const whole = wei / 10n ** 18n;
  const milli = (wei % 10n ** 18n) / 10n ** 15n;
  if (milli === 0n) return whole.toString();
  return `${whole}.${milli.toString().padStart(3, "0").replace(/0+$/, "")}`;
}
