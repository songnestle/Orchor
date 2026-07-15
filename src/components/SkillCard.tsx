"use client";

import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import type { SkillModule } from "@/lib/skills";
import { RARITY } from "@/lib/rarity";
import { useOrchorState } from "@/lib/useOrchorState";
import { EnergyBolt } from "./TopNav";

type Variant = "main" | "side" | "mini";

interface Props {
  skill: SkillModule;
  variant?: Variant;
  onClick?: () => void;
  onInvoke?: () => void;
}

export function SkillCard({ skill, variant = "main", onClick, onInvoke }: Props) {
  const theme = RARITY[skill.rarity];
  const { owned: ownedSet, subscribed: subSet, mintProgress } = useOrchorState();
  const owned = ownedSet.has(skill.id);
  const subscribed = subSet.has(skill.id);
  const isMythic = skill.rarity === "Mythic";
  const liveMint = mintProgress[skill.id];

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent) {
    if (variant !== "main") return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -py * 8, y: px * 8 });
  }

  function onLeave() {
    setTilt({ x: 0, y: 0 });
  }

  const dims =
    variant === "main"
      ? "w-[420px] h-[640px]"
      : variant === "side"
      ? "w-[300px] h-[480px]"
      : "w-[220px] h-[320px]";

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      className={`relative shrink-0 ${dims} cursor-pointer select-none`}
      style={{ perspective: 1000 }}
      whileHover={variant === "main" ? { y: -6 } : { y: -2 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
    >
      {(skill.rarity === "Legendary" || isMythic) && variant === "main" && (
        <div className="legendary-aura" />
      )}
      {isMythic && variant === "main" && <MythicParticles />}

      <motion.div
        className="relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          rotateX: tilt.x,
          rotateY: tilt.y,
        }}
      >
        <div
          className={`absolute inset-0 rounded-3xl p-[1.5px] ${
            isMythic ? "animate-gradientShift bg-[length:300%_300%]" : ""
          }`}
          style={{
            background: theme.border,
            backgroundSize: isMythic ? "300% 300%" : "200% 200%",
            boxShadow: theme.shadow,
          }}
        >
          <div
            className="relative h-full w-full rounded-[22px] overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(14,14,32,0.95) 0%, rgba(8,8,22,0.96) 100%)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: theme.sheen }}
            />
            <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute -inset-y-10 -left-1/2 w-1/3 opacity-40 animate-holoSheen"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
                  mixBlendMode: "screen",
                }}
              />
            </div>

            <div className="relative h-full w-full flex flex-col p-5">
              <CardHeader skill={skill} variant={variant} liveMint={liveMint} />
              <CardTitle skill={skill} variant={variant} />

              {variant !== "mini" && <CardPreview skill={skill} variant={variant} />}

              <div className="mt-auto">
                <CardStats skill={skill} variant={variant} />

                {variant === "main" && (
                  <CardActions
                    skill={skill}
                    owned={owned}
                    subscribed={subscribed}
                    onInvoke={onInvoke}
                  />
                )}

                {variant === "side" && (
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-[#f0d493]">
                      {skill.energyCost} ⚡
                    </span>
                    <span className="text-mutedHi uppercase tracking-wider">
                      Tap to view
                    </span>
                  </div>
                )}
              </div>

              <div
                className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl opacity-60 pointer-events-none"
                style={{ background: theme.glow }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MythicParticles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => {
        const r = ((i + 1) * 9301 + 49297) % 233280;
        const r2 = ((i + 7) * 9301 + 49297) % 233280;
        return {
          x: (r / 233280) * 100,
          y: (r2 / 233280) * 100,
          delay: (r2 / 233280) * 3,
          duration: 3 + (r / 233280) * 3,
          color: i % 3 === 0 ? "#d98a7d" : i % 3 === 1 ? "#b6c98f" : "#f0d493",
        };
      }),
    []
  );
  return (
    <div className="absolute inset-2 pointer-events-none">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: 3,
            height: 3,
            background: d.color,
            boxShadow: `0 0 8px ${d.color}`,
          }}
          animate={{ opacity: [0, 1, 0], y: [-2, -10, -2] }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function CardHeader({
  skill,
  variant,
  liveMint,
}: {
  skill: SkillModule;
  variant: Variant;
  liveMint?: { current: number; cap: number };
}) {
  const theme = RARITY[skill.rarity];
  const isMythic = skill.rarity === "Mythic";
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-display font-bold shrink-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(214,164,76,0.7), rgba(122,148,80,0.7))",
          }}
        >
          {skill.creatorAvatar}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-white truncate">
            {skill.creator}
          </div>
          <div className="text-[10px] text-muted truncate">
            via {skill.origin}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div
          className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase whitespace-nowrap"
          style={{
            background: theme.tagBg,
            color: theme.tagText,
            textShadow: isMythic
              ? "0 0 14px rgba(191,91,75,0.8)"
              : skill.rarity === "Legendary"
              ? "0 0 12px rgba(214,164,76,0.7)"
              : "none",
          }}
        >
          {isMythic
            ? "✦ Mythic"
            : skill.rarity === "Legendary" && variant === "main"
            ? "★ Legendary"
            : skill.rarity}
        </div>
        {isMythic && (liveMint || skill.mintedOf) && variant === "main" && (
          <div className="px-1.5 py-0.5 rounded text-[9px] font-mono text-[#d98a7d] bg-[#bf5b4b]/10 border border-[#bf5b4b]/20">
            {(liveMint?.current ?? skill.mintedOf!.current)}/{(liveMint?.cap ?? skill.mintedOf!.cap)} minted
          </div>
        )}
      </div>
    </div>
  );
}

function CardTitle({ skill, variant }: { skill: SkillModule; variant: Variant }) {
  const titleSize =
    variant === "main"
      ? "text-[28px] leading-tight"
      : variant === "side"
      ? "text-[20px] leading-tight"
      : "text-[15px] leading-tight";

  return (
    <div className={`mt-4 ${variant === "mini" ? "mt-3" : ""}`}>
      <div className="text-[10px] uppercase tracking-[0.2em] text-mutedHi flex items-center gap-2">
        <span>{skill.category}</span>
        {variant === "main" && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-[#7a9450]/10 border border-[#7a9450]/20 text-[#7a9450] normal-case tracking-normal">
            <span className="h-1 w-1 rounded-full bg-[#7a9450] animate-pulseDot" />
            Hosted Runtime
          </span>
        )}
      </div>
      <div className={`mt-1.5 font-display font-bold ${titleSize} text-white`}>
        {skill.title}
      </div>
      {variant === "main" && (
        <div className="mt-2 text-[12px] text-mutedHi leading-relaxed line-clamp-2">
          {skill.shortDescription}
        </div>
      )}
    </div>
  );
}

function CardPreview({ skill, variant }: { skill: SkillModule; variant: Variant }) {
  const theme = RARITY[skill.rarity];
  const isMain = variant === "main";

  return (
    <div
      className={`mt-4 relative rounded-xl border border-white/5 overflow-hidden ${
        isMain ? "h-[200px]" : "h-[120px]"
      }`}
      style={{
        background:
          "linear-gradient(180deg, rgba(8,8,22,0.7) 0%, rgba(12,12,32,0.7) 100%)",
      }}
    >
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative h-full w-full p-3 flex flex-col">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-muted">
          <span>{isMain ? `Pipeline · ${skill.runtime.model}` : "Pipeline"}</span>
          <span className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-[#7a9450] animate-pulseDot" />
            ready
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          {skill.pipeline.map((node, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className="px-2 py-1 rounded-md text-[10px] font-medium border border-white/10"
                style={{
                  background: `linear-gradient(135deg, ${theme.glow}30, ${theme.glow}10)`,
                  color: theme.tagText,
                  boxShadow: `0 0 12px ${theme.glow}30`,
                }}
              >
                {node}
              </div>
              {i < skill.pipeline.length - 1 && (
                <span className="text-mutedHi text-xs">→</span>
              )}
            </div>
          ))}
        </div>

        {isMain && <Sparkline values={skill.sparkline} color={theme.glow} />}

        {isMain && (
          <div className="mt-auto">
            <div className="text-[9px] uppercase tracking-wider text-muted mb-1">
              Sample Output
            </div>
            <pre className="text-[10.5px] leading-snug text-white/80 font-mono whitespace-pre-wrap line-clamp-4">
              {skill.outputPreview}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const path = useMemo(() => {
    if (values.length === 0) return "";
    const w = 360;
    const h = 36;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const step = w / (values.length - 1);
    return values
      .map((v, i) => {
        const x = i * step;
        const y = h - ((v - min) / range) * h;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [values]);

  return (
    <div className="my-3">
      <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-muted mb-1">
        <span>30d Invocations</span>
        <span style={{ color }}>
          +{Math.round(((values[values.length - 1] - values[0]) / values[0]) * 100)}%
        </span>
      </div>
      <svg viewBox="0 0 360 40" className="w-full h-8">
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${path} L 360,40 L 0,40 Z`}
          fill={`url(#grad-${color})`}
          opacity="0.7"
        />
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
    </div>
  );
}

function CardStats({ skill, variant }: { skill: SkillModule; variant: Variant }) {
  if (variant === "mini") {
    return (
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-mono text-[#f0d493]">{skill.energyCost} ⚡</span>
        <span className="text-muted">★ {skill.rating}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 mt-3">
      <Pill
        icon={<EnergyBolt size={11} />}
        label="Invoke"
        value={`${skill.energyCost}`}
        valueClass="text-[#f0d493]"
      />
      <Pill label="Rating" value={`★ ${skill.rating}`} />
      <Pill
        label="Used"
        value={
          skill.usageCount > 1000
            ? `${(skill.usageCount / 1000).toFixed(1)}k`
            : `${skill.usageCount}`
        }
      />
    </div>
  );
}

function Pill({
  label,
  value,
  icon,
  valueClass,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex-1 flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-lg border border-white/5 bg-white/[0.02]">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[9px] uppercase tracking-wider text-muted">
          {label}
        </span>
      </div>
      <span className={`font-mono text-[11px] tabular ${valueClass || "text-white"}`}>
        {value}
      </span>
    </div>
  );
}

function CardActions({
  skill,
  owned,
  subscribed,
  onInvoke,
}: {
  skill: SkillModule;
  owned: boolean;
  subscribed: boolean;
  onInvoke?: () => void;
}) {
  const cta =
    owned || subscribed
      ? `Invoke · ${skill.energyCost} ⚡`
      : skill.pricingType === "Subscription"
      ? "Subscribe Skill"
      : skill.pricingType === "Collection"
      ? "Unlock Collection"
      : "Unlock Skill";

  return (
    <div className="mt-3 flex items-center gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onInvoke?.();
        }}
        className="flex-1 btn-neon h-11 rounded-xl text-[13px] font-semibold tracking-wide"
      >
        {cta}
      </button>
      <button
        onClick={(e) => e.stopPropagation()}
        title="Add to Deck"
        className="h-11 w-11 rounded-xl btn-ghost flex items-center justify-center"
      >
        <BookmarkIcon filled={owned} />
      </button>
    </div>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 3 H18 V21 L12 17 L6 21 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}
