"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { SkillModule } from "@/lib/skills";
import { SkillCard } from "./SkillCard";

interface Props {
  skills: SkillModule[];
  onCardClick: (s: SkillModule) => void;
  onInvoke: (s: SkillModule) => void;
  filter: string;
  onFilter: (c: string) => void;
  query: string;
  onQuery: (q: string) => void;
}

const CATEGORIES = ["All", "Research", "Web3 Dev", "Product", "Marketing", "Automation", "Data"];

export function SkillCarousel({
  skills,
  onCardClick,
  onInvoke,
  filter,
  onFilter,
  query,
  onQuery,
}: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= skills.length) setIndex(0);
  }, [skills.length, index]);

  if (skills.length === 0) {
    return (
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-20">
        <ToolBar
          filter={filter}
          onFilter={onFilter}
          query={query}
          onQuery={onQuery}
          count={0}
          onPrev={() => {}}
          onNext={() => {}}
        />
        <div className="mt-16 text-center text-mutedHi">
          No skills match your filters. Try broadening the search.
        </div>
      </div>
    );
  }

  const len = skills.length;
  const main = skills[index % len];
  const prev = skills[(index - 1 + len) % len];
  const next = skills[(index + 1) % len];
  const prev2 = skills[(index - 2 + len) % len];
  const next2 = skills[(index + 2) % len];

  const goPrev = () => setIndex((i) => (i - 1 + len) % len);
  const goNext = () => setIndex((i) => (i + 1) % len);

  return (
    <section className="relative">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 pt-2">
        <ToolBar
          filter={filter}
          onFilter={onFilter}
          query={query}
          onQuery={onQuery}
          count={len}
          onPrev={goPrev}
          onNext={goNext}
        />
      </div>

      <div className="relative mt-6 select-none" style={{ height: 720 }}>
        {/* far-left ghost */}
        <CardSlot key={`p2-${prev2.id}`} pos="far-left" depth={3}>
          <SkillCard skill={prev2} variant="side" onClick={() => setIndex((i) => (i - 2 + len) % len)} />
        </CardSlot>

        {/* left side */}
        <CardSlot key={`p-${prev.id}`} pos="left" depth={2}>
          <SkillCard skill={prev} variant="side" onClick={goPrev} />
        </CardSlot>

        {/* main */}
        <AnimatePresence mode="popLayout">
          <CardSlot key={`m-${main.id}`} pos="center" depth={1}>
            <SkillCard
              skill={main}
              variant="main"
              onClick={() => onCardClick(main)}
              onInvoke={() => onInvoke(main)}
            />
          </CardSlot>
        </AnimatePresence>

        {/* right side */}
        <CardSlot key={`n-${next.id}`} pos="right" depth={2}>
          <SkillCard skill={next} variant="side" onClick={goNext} />
        </CardSlot>

        {/* far-right ghost */}
        <CardSlot key={`n2-${next2.id}`} pos="far-right" depth={3}>
          <SkillCard skill={next2} variant="side" onClick={() => setIndex((i) => (i + 2) % len)} />
        </CardSlot>

        {/* nav buttons */}
        <NavBtn dir="left" onClick={goPrev} />
        <NavBtn dir="right" onClick={goNext} />

        {/* index dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {skills.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-7 bg-white" : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to ${s.title}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Card position wrapper ─── */
function CardSlot({
  children,
  pos,
  depth,
}: {
  children: React.ReactNode;
  pos: "far-left" | "left" | "center" | "right" | "far-right";
  depth: 1 | 2 | 3;
}) {
  const cfg = {
    "far-left":  { x: "-46%", scale: 0.62, opacity: 0.18, blur: 5, z: 1 },
    "left":      { x: "-32%", scale: 0.78, opacity: 0.55, blur: 2, z: 5 },
    "center":    { x: "-50%", scale: 1.0,  opacity: 1.0,  blur: 0, z: 20, base: "50%" },
    "right":     { x: "32%",  scale: 0.78, opacity: 0.55, blur: 2, z: 5 },
    "far-right": { x: "46%",  scale: 0.62, opacity: 0.18, blur: 5, z: 1 },
  } as const;

  const c = cfg[pos];
  const left = pos === "center" ? "50%" : "50%";

  return (
    <motion.div
      className="absolute top-4"
      style={{
        left,
        zIndex: c.z,
        filter: `blur(${c.blur}px)`,
      }}
      initial={false}
      animate={{
        x: c.x,
        scale: c.scale,
        opacity: c.opacity,
      }}
      transition={{ type: "spring", stiffness: 180, damping: 26 }}
    >
      <div
        style={{
          // shift origin so non-center cards align nicely with center card
          transform:
            pos === "center"
              ? "translateX(0)"
              : pos.includes("left")
              ? "translateX(-50%)"
              : "translateX(-50%)",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

/* ─── nav button ─── */
function NavBtn({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full glass-strong flex items-center justify-center hover:scale-110 transition ${
        dir === "left" ? "left-6 lg:left-12" : "right-6 lg:right-12"
      }`}
      aria-label={dir === "left" ? "Previous skill" : "Next skill"}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        {dir === "left" ? (
          <path d="M15 6 L9 12 L15 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 6 L15 12 L9 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

/* ─── toolbar ─── */
function ToolBar({
  filter,
  onFilter,
  query,
  onQuery,
  count,
  onPrev,
  onNext,
}: {
  filter: string;
  onFilter: (c: string) => void;
  query: string;
  onQuery: (q: string) => void;
  count: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 flex-wrap">
        {CATEGORIES.map((c) => {
          const active = c === filter;
          return (
            <button
              key={c}
              onClick={() => onFilter(c)}
              className={`px-3 py-1.5 rounded-full text-[12px] transition ${
                active
                  ? "bg-gradient-to-r from-accent/25 to-accent2/25 border border-white/15 text-white"
                  : "border border-white/5 text-mutedHi hover:text-white hover:border-white/10"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass">
          <SearchIcon />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search skills, creators…"
            className="bg-transparent outline-none text-[13px] w-40 placeholder:text-muted"
          />
        </div>
        <span className="text-[11px] text-muted whitespace-nowrap">
          {count} skill{count === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 16 L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
