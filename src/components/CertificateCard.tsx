"use client";

import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import type { SkillModule } from "@/lib/skills";
import type { Rarity } from "@/lib/rarity";

/**
 * CertificateCard — Orchor 技能卡（最终版）
 *
 * 替换 src/components/premium/PremiumSkillCard.tsx。
 *
 * ── 设计约束（改的时候别破坏）─────────────────────────────
 *
 * 1. 金是稀缺资源。整屏出现不超过三次：黑金卡的边、黑金卡的名字、当前筛选项的下划线。
 *    普通卡一律用发丝线 #232017 和象牙白 #ede7d8。金色一旦铺开就变成赌场。
 *
 * 2. 稀有度是文字,不是色块。五个金属名靠字色区分,没有填充徽章 ——
 *    唯一例外是黑金,它靠"唯一有金边"胜出。
 *
 * 3. 卡面是数据,不是插画。竞品 skills.sh 有 9 万个技能、零张配图;
 *    Parallel / Sorare 的卡面是 AAA 美术预算的产物。单人团队在这条路上比不赢,
 *    但链上履历是它们拿不出的东西。
 *
 * 4. 读不到的数据显示"暂无记录",不显示 0,更不编造。
 *    首页那个 154,740 Total Runs 是这个项目最大的可信度漏洞。
 *
 * 5. 动效只有边框颜色过渡。不做 stagger、不做整页淡入 ——
 *    delay: index * 0.05 会让第 20 张卡在 1 秒后才出现。
 */

/** 稀有度色值。文案在 i18n 的 metal.* 里，这里只管颜色。 */
const METAL_COLOR: Record<Rarity, string> = {
  Common: "#a07d54",
  Rare: "#b9bfc5",
  Epic: "#d7b76e",
  Legendary: "#d9dde1",
  Mythic: "#e8d5a0",
};

interface Props {
  skill: SkillModule;
  /** 链上解锁价（wei）。来自 useOnchainSkills(),不要用 skills.ts 的静态值。 */
  unlockPriceWei?: bigint;
  /** 限量卡的铸造进度;不限量卡传流通量。 */
  supplyLabel?: string;
  /** 链上累计调用。undefined = 还没读到,显示破折号。 */
  onchainCalls?: number;
  /** 创作者累计收入（INJ）。 */
  creatorEarned?: number;
  /** 持有份数。> 0 时主按钮变为已持有。 */
  balance?: number;
  /**
   * 近 30 日调用曲线,来自链上事件索引。
   * undefined = 索引不可用(显示破折号语义);[] 或全零 = 真实的零。
   * 绝不回退到 skills.ts 里手写的 sparkline —— 那是编的。
   */
  series?: number[];
  onUnlock?: () => void;
  onVerify?: () => void;
  onClick?: () => void;
}

export function CertificateCard({
  skill,
  unlockPriceWei,
  supplyLabel,
  onchainCalls,
  creatorEarned,
  balance = 0,
  series,
  onUnlock,
  onVerify,
  onClick,
}: Props) {
  const { t } = useI18n();
  const isMythic = skill.rarity === "Mythic";
  const owned = balance > 0;

  const line = series ?? [];
  const pct = useMemo(() => {
    if (line.length < 2) return null;
    const head = line.slice(0, Math.floor(line.length / 2)).reduce((a, b) => a + b, 0);
    const tail = line.slice(Math.floor(line.length / 2)).reduce((a, b) => a + b, 0);
    if (head === 0 && tail === 0) return null;      // 全零:显示「暂无记录」而不是 +0%
    if (head === 0) return 100;
    return Math.round(((tail - head) / head) * 100);
  }, [line]);
  const down = pct !== null && pct < 0;

  const price =
    unlockPriceWei !== undefined
      ? formatEther3(unlockPriceWei)
      : String(skill.priceMON);

  return (
    <article
      onClick={onClick}
      className="flex flex-col rounded-[3px] px-5 pt-5 pb-[18px] cursor-pointer transition-colors duration-200"
      style={{
        background: "#111009",
        border: `0.5px solid ${isMythic ? "rgba(198,169,108,.55)" : "#232017"}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = isMythic ? "rgba(198,169,108,.85)" : "#39331f";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isMythic ? "rgba(198,169,108,.55)" : "#232017";
      }}
    >
      <header className="flex items-baseline justify-between mb-4">
        <span
          className="text-[11px] tracking-[2.5px]"
          style={{ fontFamily: "var(--o-serif)", color: "#5f5949" }}
        >
          Nº{String(skill.id).padStart(2, "0")}
        </span>
        <span className="text-[11px] tracking-[2.5px]" style={{ color: METAL_COLOR[skill.rarity] }}>
          {t(`metal.${skill.rarity}` as never)}
        </span>
      </header>

      <Sparkline series={line} down={down} />

      <div className="flex justify-between mt-1.5 mb-5">
        <span className="text-[11px]" style={{ color: "#5f5949" }}>
          {t("cert.calls30d")}
        </span>
        <span
          className="num text-[11px]"
          style={{ color: pct === null ? "#5f5949" : down ? "#a8705f" : "#8fae7a" }}
        >
          {pct === null ? t("cert.noRecord") : `${pct >= 0 ? "+" : ""}${pct}%`}
        </span>
      </div>

      <h3
        className="m-0 text-[19px] leading-tight tracking-[.3px]"
        style={
          isMythic
            ? {
                fontFamily: "var(--o-serif)",
                background: "linear-gradient(100deg,#a9884d,#f3e3b0 48%,#a9884d)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }
            : { fontFamily: "var(--o-serif)", color: "#ede7d8" }
        }
      >
        {skill.title}
      </h3>
      <p className="mt-1.5 mb-0 text-[12px]" style={{ color: "#6a6353" }}>
        {skill.creatorHandle.replace(/^@+/, "@")}
        {supplyLabel ? ` · ${supplyLabel}` : ""}
      </p>
      <p className="mt-2 mb-0 text-[12px] leading-[1.55] line-clamp-2" style={{ color: "#847c68" }}>
        {skill.shortDescription}
      </p>
      <p className="mt-2 mb-0 text-[11px] tracking-[.8px]" style={{ color: "#5f5949" }}>
        {skill.category} · ⚡{skill.energyCost} · {skill.origin}
      </p>

      <div className="h-px my-[18px] mb-3.5" style={{ background: "#1c1a14" }} />

      <dl className="flex justify-between mb-[18px]">
        <Stat label={t("cert.unlockPrice")} value={price} unit="INJ" />
        <Stat label={t("cert.totalCalls")} value={onchainCalls === undefined ? "—" : onchainCalls.toLocaleString()} />
        <Stat
          label={t("cert.creatorEarned")}
          value={creatorEarned === undefined ? "—" : formatInj(creatorEarned)}
          unit={creatorEarned === undefined ? undefined : "INJ"}
          align="right"
        />
      </dl>

      <div className="flex items-center gap-4">
        <button
          disabled={owned}
          onClick={(e) => {
            e.stopPropagation();
            onUnlock?.();
          }}
          className="flex-1 text-[13px] tracking-[3px] py-2.5 rounded-[2px] transition-[filter] duration-150"
          style={
            owned
              ? { background: "transparent", color: "#6a6353", border: "0.5px solid #232017" }
              : isMythic
                ? { background: "linear-gradient(160deg,#d9bc7e,#b8955a)", color: "#171410" }
                : { background: "#ede7d8", color: "#141209" }
          }
        >
          {owned ? (balance > 1 ? t("cert.ownedN", { n: balance }) : t("cert.owned")) : t("cert.unlock")}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onVerify?.();
          }}
          className="text-[12px] whitespace-nowrap transition-colors duration-150"
          style={{ color: "#6a6353" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#cfc4ac")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6a6353")}
        >
          {t("cert.verify")} ↗
        </button>
      </div>
    </article>
  );
}

function Stat({
  label,
  value,
  unit,
  align = "left",
}: {
  label: string;
  value: string;
  unit?: string;
  align?: "left" | "right";
}) {
  return (
    <div style={{ textAlign: align }}>
      <dt className="m-0 text-[11px] tracking-[1.2px]" style={{ color: "#5f5949" }}>
        {label}
      </dt>
      <dd className="num m-0 mt-1 text-[15px]" style={{ color: "#ede7d8" }}>
        {value}
        {unit ? <span className="text-[11px] ml-1" style={{ color: "#6a6353" }}>{unit}</span> : null}
      </dd>
    </div>
  );
}

/**
 * 单发丝线曲线。
 * 高度固定 64px —— viewBox 若跟随卡宽等比放大,单列布局下空图会撑出
 * 170px 的留白(上线首日的"卡片太空荡"就是这个)。preserveAspectRatio
 * 拉伸配合 non-scaling-stroke,线宽不随宽度变化。
 * 空数据画基线 + 30 格日刻度:是"还没有数据的图表",不是一块空白;
 * 依旧不编造任何数字。
 */
function Sparkline({ series, down }: { series: number[]; down: boolean }) {
  const W = 300;
  const H = 64;
  const P = 2;

  const { d, area, lx, ly } = useMemo(() => {
    if (series.length < 2) return { d: "", area: "", lx: 0, ly: 0 };
    const max = Math.max(...series);
    const min = Math.min(...series);
    const span = max - min || 1;
    const step = (W - P * 2) / (series.length - 1);
    const pts = series.map((v, i) => [P + i * step, H - 8 - ((v - min) / span) * (H - 22)] as const);
    const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    const [ex, ey] = pts[pts.length - 1];
    return { d: path, area: `${path} L${ex.toFixed(1)} ${H} L${P} ${H} Z`, lx: ex, ly: ey };
  }, [series]);

  // 与相邻涨跌幅徽章同语义:上行绿、下行赭。金色是稀缺资源,留给黑金卡,
  // 否则精选区 6 张上行卡就是 6 条金线,预算(整屏≤3处)瞬间爆掉。
  const color = down ? "#a8705f" : "#8fae7a";
  const ticks = useMemo(() => Array.from({ length: 30 }, (_, i) => P + (i * (W - P * 2)) / 29), []);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block w-full h-[64px]"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {d ? (
        <>
          <path d={area} fill={color} fillOpacity="0.05" />
          <path d={d} fill="none" stroke={color} strokeWidth="1.1" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <path d={`M${lx} ${ly} l0 0`} stroke={color} strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </>
      ) : (
        <>
          {ticks.map((x, i) => (
            <line
              key={i}
              x1={x} y1={i % 7 === 0 ? H - 14 : H - 10}
              x2={x} y2={H - 6}
              stroke="#2a2519" strokeWidth="1" vectorEffect="non-scaling-stroke"
            />
          ))}
          <line x1={P} y1={H - 6} x2={W - P} y2={H - 6} stroke="#3d382a" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </>
      )}
    </svg>
  );
}

/** INJ 金额:小额保留 3 位小数,否则 0.007 INJ 会被 toFixed(1) 抹成 "0.0"。 */
function formatInj(v: number): string {
  if (v === 0) return "0";
  if (v >= 100) return v.toFixed(0);
  if (v >= 1) return v.toFixed(1);
  return v.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

/** wei → 最多三位小数。 */
function formatEther3(wei: bigint): string {
  const whole = wei / 10n ** 18n;
  const milli = (wei % 10n ** 18n) / 10n ** 15n;
  if (milli === 0n) return whole.toString();
  return `${whole}.${milli.toString().padStart(3, "0").replace(/0+$/, "")}`;
}
