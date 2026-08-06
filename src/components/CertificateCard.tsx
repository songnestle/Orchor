"use client";

import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { localizeSkill, type SkillModule } from "@/lib/skills";
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
  /**
   * 全站单日调用峰值,由 SkillGrid 统一算好传入 —— 曲线共用这把尺子,
   * 卡与卡之间的高度差才等于调用量差。各卡自归一化的话,调用 2 次和
   * 调用 40 次画出来一模一样,那才是真正的"看起来都一样"。
   */
  seriesPeak?: number;
  /** 链上卡面 SVG 的 data URI(来自 /api/skills/art)。缺省则回退纯文字版式。 */
  artUri?: string;
  onUnlock?: () => void;
  onVerify?: () => void;
  onClick?: () => void;
}

/** 涨跌状态:无记录 / 首期(无同比基线) / 有基线的变化率 */
type Trend = null | { kind: "new" } | { kind: "pct"; v: number };

export function CertificateCard({
  skill,
  unlockPriceWei,
  supplyLabel,
  onchainCalls,
  creatorEarned,
  balance = 0,
  series,
  seriesPeak,
  artUri,
  onUnlock,
  onVerify,
  onClick,
}: Props) {
  const { t, lang } = useI18n();
  const text = localizeSkill(skill, lang);
  const isMythic = skill.rarity === "Mythic";
  const owned = balance > 0;

  const line = series ?? [];
  const trend: Trend = useMemo(() => {
    if (line.length < 2) return null;
    const mid = Math.floor(line.length / 2);
    const head = line.slice(0, mid).reduce((a, b) => a + b, 0);
    const tail = line.slice(mid).reduce((a, b) => a + b, 0);
    if (head === 0 && tail === 0) return null;   // 全零:显示「暂无记录」而不是 +0%
    // 前半段没有基线时,任何变化率都是除零的产物 —— 早期所有卡都会显示
    // "+100%",看着像同一张卡。诚实的说法是:这是首期数据。
    if (head === 0) return { kind: "new" };
    return { kind: "pct", v: Math.round(((tail - head) / head) * 100) };
  }, [line]);
  const down = trend?.kind === "pct" && trend.v < 0;

  const price =
    unlockPriceWei !== undefined
      ? formatEther3(unlockPriceWei)
      : String(skill.priceMON);

  return (
    <article
      onClick={onClick}
      className="group flex flex-col overflow-hidden cursor-pointer transition-colors duration-200"
      style={{
        borderRadius: "var(--o-r-card)",
        // 层次靠亮度差,不靠描边也不靠阴影。整排卡各带一圈线,画面就是
        // 一张网格纸;去掉线之后间距自己会说话(pools.trade 的列表项
        // 干脆连背景都没有)。黑金卡保留金边 —— 那是它唯一的特权。
        background: "var(--o-raise)",
        // 卡面 SVG 自带金框金纹,一屏 15 张就是 15 圈金边 —— 黑金卡原来
        // 靠"唯一有金边"辨识,在有图之后彻底失效。改用一圈外发光:
        // 它在金边泛滥的画面里仍然只属于黑金卡,且不增加第 16 圈线。
        border: "1px solid transparent",
        boxShadow: isMythic ? "0 0 0 1px rgba(198,169,108,.5), 0 0 24px -6px rgba(198,169,108,.45)" : "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--o-raise-hi)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--o-raise)";
      }}
    >
      {/*
        链上卡面。合约现算的证书 SVG,MetaMask 一直在显示它,而我们自己的
        网站以前只放文字 —— 卡片因此张张雷同。SVG 是 340×480 的整张证书,
        这里取上部方形(角标 / 稀有度徽章 / 按 id 生成的纹样 / 英文规范名)。
        读不到就退回纯文字版式,不塞占位图。
      */}
      {artUri ? (
        <div className="relative aspect-square overflow-hidden" style={{ background: "#0d0c09" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artUri}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            // 合约把纹样画得很淡(为了在 MetaMask 的白底/黑底下都不刺眼),
            // 在网站的深色卡里几乎看不见 —— 提一档亮度和对比,不改颜色。
            style={{ filter: "brightness(1.22) contrast(1.06)" }}
          />
          {owned && (
            <span
              className="absolute right-2 top-2 px-2.5 py-1 text-[11px] rounded-[var(--o-r-pill)]"
              style={{ background: "rgba(13,12,9,.82)", color: "var(--o-ink)" }}
            >
              {balance > 1 ? t("cert.ownedN", { n: balance }) : t("cert.owned")}
            </span>
          )}
          {/*
            快捷解锁。悬停浮出,不占常驻空间。
            pointer-events-none 是必须的:opacity-0 的元素照样接收点击,
            触屏没有 hover,这个看不见的按钮会盖住卡面底部约四分之一 ——
            用户以为在点卡片看详情,实际直接拉起了付款交易。
            链上价没读到时不渲染它:那时价格只能来自 skills.ts 的静态值,
            拿静态价去发交易既是编造也点不动(SkillGrid 会静默 return)。
          */}
          {!owned && unlockPriceWei !== undefined && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnlock?.();
              }}
              className="absolute inset-x-2 bottom-2 py-2 text-[14px] opacity-0 translate-y-1 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto focus-visible:opacity-100 focus-visible:translate-y-0 focus-visible:pointer-events-auto"
              style={{
                borderRadius: "var(--o-r-btn)",
                background: isMythic ? "linear-gradient(160deg,#d9bc7e,#b8955a)" : "#ede7d8",
                color: "#141209",
              }}
            >
              {t("cert.unlock")} · {price} INJ
            </button>
          )}
        </div>
      ) : (
        // 无图回退:卡面拿不到时,这块要独自撑起证书感,并补齐图上本该有的
        // 价格与稀有度 —— 否则这张卡比有图的少了一半信息。
        <div className="aspect-square flex flex-col justify-between p-4" style={{ background: "#0d0c09" }}>
          <div className="flex items-baseline justify-between">
            {/* Nº 与稀有度是刻意的"证书刻印",字距保留;正文一律不加字距 */}
            <span
              className="text-[11px] tracking-[2.5px]"
              style={{ fontFamily: "var(--o-serif)", color: "var(--o-ink-faint)" }}
            >
              Nº{String(skill.id).padStart(2, "0")}
            </span>
            <span className="text-[11px] tracking-[2.5px]" style={{ color: METAL_COLOR[skill.rarity] }}>
              {t(`metal.${skill.rarity}` as never)}
            </span>
          </div>
          <div>
            {/* 链上价没读到就显示破折号 —— skills.ts 的静态价不是链上事实 */}
            <span className="num text-[20px]" style={{ color: "var(--o-ink)" }}>
              {unlockPriceWei !== undefined ? price : "—"}
            </span>
            {unlockPriceWei !== undefined && (
              <span className="text-[12px] ml-1" style={{ color: "var(--o-ink-faint)" }}>
                INJ
              </span>
            )}
          </div>
        </div>
      )}

      {/*
        文字区只有一行。
        卡面已经印着英文规范名、稀有度、解锁价、铸造量、能耗 —— 重复它们
        只会让扫读时的噪音翻倍。这里补两样卡面给不了的:中文名(卡面恒为
        英文)和链上调用量。说明文字、分类、来源全部退到详情弹窗。
      */}
      <div className="flex items-baseline justify-between gap-2 px-3.5 py-3">
        <h3
          className="m-0 text-[14px] leading-tight truncate"
          style={
            isMythic
              ? {
                  fontFamily: "var(--o-serif)",
                  background: "linear-gradient(100deg,#a9884d,#f3e3b0 48%,#a9884d)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }
              : { fontFamily: "var(--o-serif)", color: "var(--o-ink)" }
          }
        >
          {text.title}
        </h3>
        <span className="flex items-center gap-1.5 shrink-0">
          {/* 迷你曲线:全站共用一把纵轴尺子,所以高度差就是调用量差 */}
          <span className="w-[40px] block">
            <Sparkline series={line} down={down} peak={seriesPeak} compact />
          </span>
          <span
            className="num text-[12px] whitespace-nowrap"
            style={{ color: trend === null ? "var(--o-ink-faint)" : down ? "var(--o-down)" : "var(--o-up)" }}
          >
            {onchainCalls === undefined ? "—" : `${onchainCalls.toLocaleString()}×`}
          </span>
        </span>
      </div>
    </article>
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
function Sparkline({
  series, down, peak, compact = false,
}: { series: number[]; down: boolean; peak?: number; compact?: boolean }) {
  const W = 300;
  const H = compact ? 26 : 64;
  const P = 2;

  const { d, area, lx, ly } = useMemo(() => {
    if (series.length < 2) return { d: "", area: "", lx: 0, ly: 0 };
    // 纵轴从 0 起、以全站峰值封顶(拿不到峰值才退回本卡最大值)。
    // 原来按本卡 min/max 归一化,导致调用 2 次和 40 次画出同样高的曲线。
    const top = Math.max(peak ?? 0, ...series) || 1;
    const step = (W - P * 2) / (series.length - 1);
    const padB = compact ? 3 : 8;
    const usable = compact ? H - 8 : H - 22;
    const pts = series.map((v, i) => [P + i * step, H - padB - (v / top) * usable] as const);
    const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    const [ex, ey] = pts[pts.length - 1];
    return { d: path, area: `${path} L${ex.toFixed(1)} ${H} L${P} ${H} Z`, lx: ex, ly: ey };
  }, [series, peak, compact, H]);

  // 与相邻涨跌幅徽章同语义:上行绿、下行赭。金色是稀缺资源,留给黑金卡,
  // 否则精选区 6 张上行卡就是 6 条金线,预算(整屏≤3处)瞬间爆掉。
  const color = down ? "#a8705f" : "#8fae7a";
  const ticks = useMemo(() => Array.from({ length: 30 }, (_, i) => P + (i * (W - P * 2)) / 29), []);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={compact ? "block w-full h-[26px]" : "block w-full h-[64px]"}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {d ? (
        <>
          <path d={area} fill={color} fillOpacity="0.05" />
          <path d={d} fill="none" stroke={color} strokeWidth={compact ? "1" : "1.1"} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <path d={`M${lx} ${ly} l0 0`} stroke={color} strokeWidth={compact ? "2.5" : "4"} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </>
      ) : compact ? (
        <line x1={P} y1={H - 3} x2={W - P} y2={H - 3} stroke="#3d382a" strokeWidth="1" vectorEffect="non-scaling-stroke" />
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


/** wei → 最多三位小数。 */
function formatEther3(wei: bigint): string {
  const whole = wei / 10n ** 18n;
  const milli = (wei % 10n ** 18n) / 10n ** 15n;
  if (milli === 0n) return whole.toString();
  return `${whole}.${milli.toString().padStart(3, "0").replace(/0+$/, "")}`;
}
