"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import type { SkillModule } from "@/lib/skills";
import { RARITY } from "@/lib/rarity";
import { useDeck } from "@/lib/deckStore";
import { useOrchorState } from "@/lib/useOrchorState";
import { useOrchorWrites } from "@/lib/useOrchor";
import { buildOrPackage } from "@/lib/orPackage";
import { explorerTxUrl } from "@/lib/chain";
import { EnergyBolt, MonadIcon } from "./TopNav";

type Step = "idle" | "confirm" | "submitting" | "done" | "error";
type Mode = "invoke" | "subscribe" | "unlock";
type Tab = "overview" | "package" | "runtime";

interface Props {
  skill: SkillModule | null;
  onClose: () => void;
  onOpenTopUp: () => void;
}

export function SkillDetailModal({ skill, onClose, onOpenTopUp }: Props) {
  const { isConnected } = useAccount();
  const { owned: ownedSet, subscribed: subSet, energy } = useOrchorState();
  const { unlock, subscribe, invoke, isConfirming, isConfirmed } = useOrchorWrites();
  const bumpRefetch = useDeck((s) => s.bumpRefetch);
  const noteInvoke = useDeck((s) => s.noteInvoke);

  const owned = skill ? ownedSet.has(skill.id) : false;
  const subscribed = skill ? subSet.has(skill.id) : false;

  const [mode, setMode] = useState<Mode>("invoke");
  const [step, setStep] = useState<Step>("idle");
  const [tab, setTab] = useState<Tab>("overview");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (skill) {
      setStep("idle");
      setTab("overview");
      setMode(owned || subscribed ? "invoke" : "unlock");
      setTxHash(null);
      setErr(null);
    }
  }, [skill, owned, subscribed]);

  useEffect(() => {
    if (isConfirmed && step === "submitting") {
      setStep("done");
      bumpRefetch();
      if (mode === "invoke" && skill) noteInvoke(skill.id);
    }
  }, [isConfirmed, step, mode, skill, bumpRefetch, noteInvoke]);

  const orPkg = useMemo(() => (skill ? buildOrPackage(skill) : null), [skill]);

  if (!skill || !orPkg) return null;
  const theme = RARITY[skill.rarity];
  const isMythic = skill.rarity === "Mythic";

  const monPrice =
    mode === "subscribe" ? skill.subscriptionMON ?? skill.priceMON : skill.priceMON;
  const energyPrice = skill.energyCost;
  const insufficientEnergy = mode === "invoke" && energy < energyPrice;

  async function runPaymentFlow() {
    if (!skill) return;
    if (!isConnected) return;
    if (mode === "invoke" && insufficientEnergy) {
      onOpenTopUp();
      return;
    }
    setErr(null);
    setStep("confirm");
    try {
      let h: `0x${string}`;
      if (mode === "subscribe") {
        h = await subscribe(skill.id, monPrice);
      } else if (mode === "unlock") {
        h = await unlock(skill.id, monPrice);
      } else {
        h = await invoke(skill.id, skill.inputExample);
      }
      setTxHash(h);
      setStep("submitting");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      setErr(msg.split("\n")[0]);
      setStep("error");
    }
  }

  return (
    <AnimatePresence>
      {skill && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="relative w-[min(1000px,96vw)] max-h-[88vh] overflow-y-auto rounded-3xl glass-strong scrollbar-thin"
            style={{ boxShadow: theme.shadow }}
          >
            <div
              className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-48 w-[70%] blur-3xl opacity-50"
              style={{ background: theme.glow }}
            />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full glass flex items-center justify-center"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path
                  d="M6 6 L18 18 M18 6 L6 18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <div className="p-6 grid lg:grid-cols-[1fr_380px] gap-6">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase"
                    style={{ background: theme.tagBg, color: theme.tagText }}
                  >
                    {isMythic
                      ? "✦ Mythic"
                      : skill.rarity === "Legendary"
                      ? "★ Legendary"
                      : skill.rarity}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-mutedHi">
                    {skill.category}
                  </div>
                  {skill.collectionName && (
                    <div className="text-[10px] uppercase tracking-wider text-[#b6c98f]">
                      · {skill.collectionName}
                    </div>
                  )}
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-[#7a9450]/10 border border-[#7a9450]/20 text-[#7a9450]">
                    <span className="h-1 w-1 rounded-full bg-[#7a9450] animate-pulseDot" />
                    Hosted on Orchor Runtime
                  </div>
                </div>

                <h2 className="mt-2 font-display text-3xl font-bold">{skill.title}</h2>
                {isMythic && skill.mintedOf && (
                  <div className="mt-1 text-[11px] font-mono text-[#d98a7d]">
                    ✦ {skill.mintedOf.current}/{skill.mintedOf.cap} minted onchain · Monad Testnet
                  </div>
                )}

                <div className="mt-2 flex items-center gap-2 text-[12px] text-mutedHi">
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-display font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(214,164,76,0.7), rgba(122,148,80,0.7))",
                    }}
                  >
                    {skill.creatorAvatar}
                  </div>
                  <span className="text-white">{skill.creator}</span>
                  <span className="text-muted">{skill.creatorHandle}</span>
                  <span className="text-muted">·</span>
                  <span>
                    exported from <span className="text-white">{skill.origin}</span>
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] w-fit">
                  {(
                    [
                      ["overview", "Overview"],
                      ["package", ".or Package"],
                      ["runtime", "Runtime"],
                    ] as const
                  ).map(([key, label]) => {
                    const active = tab === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                          active
                            ? "bg-gradient-to-r from-accent to-accent2 text-black"
                            : "text-mutedHi hover:text-white"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4">
                  {tab === "overview" && <OverviewTab skill={skill} owned={owned} />}
                  {tab === "package" && <PackageTab orPkg={orPkg} />}
                  {tab === "runtime" && <RuntimeTab skill={skill} />}
                </div>
              </div>

              <div className="lg:sticky lg:top-4 self-start">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-white/[0.04]">
                    {(
                      [
                        ["unlock", "Unlock"],
                        ["subscribe", "Subscribe"],
                        ["invoke", "Invoke"],
                      ] as const
                    ).map(([m, label]) => {
                      const active = mode === m;
                      const disabled =
                        m === "invoke" &&
                        !owned &&
                        !subscribed &&
                        step !== "done";
                      return (
                        <button
                          key={m}
                          disabled={disabled}
                          onClick={() => {
                            setMode(m);
                            setStep("idle");
                            setErr(null);
                          }}
                          className={`py-1.5 rounded-lg text-[11px] font-semibold transition ${
                            active
                              ? "bg-gradient-to-r from-accent to-accent2 text-black"
                              : "text-mutedHi hover:text-white"
                          } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <div className="text-[10px] uppercase tracking-wider text-muted">
                      {mode === "subscribe"
                        ? "Subscription"
                        : mode === "unlock"
                        ? "One-time Unlock"
                        : "Invoke Cost"}
                    </div>
                    {mode === "invoke" ? (
                      <div className="mt-1 font-display text-3xl font-bold flex items-center gap-2">
                        <EnergyBolt size={20} />
                        <span className="tabular text-[#f0d493]">{energyPrice}</span>
                        <span className="text-base text-mutedHi font-mono">⚡</span>
                      </div>
                    ) : (
                      <div className="mt-1 font-display text-3xl font-bold flex items-center gap-2">
                        <MonadIcon size={20} />
                        <span className="tabular">{monPrice}</span>
                        <span className="text-base text-mutedHi font-mono">MON</span>
                      </div>
                    )}
                    {mode === "subscribe" && (
                      <div className="text-[10px] text-muted">30-day access</div>
                    )}
                    {mode === "invoke" && (
                      <div className="mt-1 text-[10px] text-muted">
                        ≈ {(skill.runtime.tokenCostCents / 100).toFixed(3)} USD model cost · routed via{" "}
                        <span className="text-white">{skill.runtime.model}</span>
                      </div>
                    )}
                  </div>

                  <PaymentTimeline
                    step={step}
                    mode={mode}
                    isConfirming={isConfirming}
                  />

                  {txHash && (step === "submitting" || step === "done") && (
                    <div className="mt-2 text-[10px] text-mutedHi">
                      tx{" "}
                      <a
                        href={explorerTxUrl(txHash)}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-mono"
                      >
                        {txHash.slice(0, 10)}…{txHash.slice(-6)}
                      </a>
                    </div>
                  )}

                  {step === "error" && err && (
                    <div className="mt-2 rounded-lg p-2 bg-red-500/10 border border-red-500/30 text-[11px] text-red-300">
                      ✗ {err}
                    </div>
                  )}

                  <div className="mt-4">
                    {step === "done" ? (
                      <button
                        onClick={() => {
                          setStep("idle");
                          if (mode !== "invoke") setMode("invoke");
                        }}
                        className="w-full btn-neon h-11 rounded-xl text-[13px] font-semibold"
                      >
                        {mode === "invoke" ? "Invoke again" : "Now invoke this skill"}
                      </button>
                    ) : !isConnected ? (
                      <button
                        disabled
                        className="w-full btn-neon h-11 rounded-xl text-[13px] font-semibold"
                      >
                        Connect wallet to continue
                      </button>
                    ) : insufficientEnergy && step === "idle" ? (
                      <button
                        onClick={onOpenTopUp}
                        className="w-full btn-neon h-11 rounded-xl text-[13px] font-semibold"
                      >
                        Top up Energy · need {energyPrice - energy} ⚡
                      </button>
                    ) : (
                      <button
                        onClick={runPaymentFlow}
                        disabled={step === "confirm" || step === "submitting"}
                        className="w-full btn-neon h-11 rounded-xl text-[13px] font-semibold"
                      >
                        {step === "idle" || step === "error"
                          ? mode === "subscribe"
                            ? `Subscribe · ${monPrice} MON`
                            : mode === "unlock"
                            ? `Unlock · ${monPrice} MON`
                            : `Invoke · ${energyPrice} ⚡`
                          : step === "confirm"
                          ? "Awaiting wallet…"
                          : isConfirming
                          ? "Confirming on Monad…"
                          : "Submitting…"}
                      </button>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-2 py-1.5">
                      <div className="text-muted">Your Energy</div>
                      <div className="font-mono text-[#f0d493] tabular">{energy} ⚡</div>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-2 py-1.5">
                      <div className="text-muted">After invoke</div>
                      <div className="font-mono text-white tabular">
                        {Math.max(0, energy - (mode === "invoke" ? energyPrice : 0))} ⚡
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-[10px] text-muted text-center leading-relaxed">
                    {mode === "invoke"
                      ? "Hosted on Orchor Runtime · no API keys needed · invocation logged onchain"
                      : "Gas paid in MON · Monad Testnet · 70% creator / 25% platform / 5% onchain"}
                  </div>
                </div>

                <div className="mt-3 text-center text-[10px] text-muted">
                  Powered by <span className="text-gradient">Monad</span> · Orchor Skill Protocol v0.1
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ───────── Tabs ───────── */

function OverviewTab({ skill, owned }: { skill: SkillModule; owned: boolean }) {
  return (
    <>
      <p className="text-[13px] text-mutedHi leading-relaxed">
        {skill.shortDescription}
      </p>

      <section className="mt-5">
        <SectionLabel>Workflow Pipeline</SectionLabel>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {skill.pipeline.map((n, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-white/10 bg-white/[0.03]">
                {n}
              </div>
              {i < skill.pipeline.length - 1 && (
                <span className="text-mutedHi">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        <CodeBlock label="Sample Input" body={skill.inputExample} />
        <CodeBlock label="Sample Output" body={skill.outputPreview} />
      </section>

      <section className="mt-5 grid grid-cols-4 gap-2">
        <Stat label="Rating" value={`★ ${skill.rating}`} />
        <Stat
          label="Invocations"
          value={
            skill.usageCount > 1000
              ? `${(skill.usageCount / 1000).toFixed(1)}k`
              : `${skill.usageCount}`
          }
        />
        <Stat
          label="Latency"
          value={`${(skill.runtime.avgLatencyMs / 1000).toFixed(1)}s`}
        />
        <Stat label="In Deck" value={owned ? "Yes" : "—"} />
      </section>
    </>
  );
}

function PackageTab({ orPkg }: { orPkg: ReturnType<typeof buildOrPackage> }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <SectionLabel>orchor export — .or manifest</SectionLabel>
        <span className="text-[10px] font-mono text-mutedHi">{orPkg.id}</span>
      </div>
      <pre className="rounded-xl border border-white/5 bg-bg2/60 p-4 text-[11px] leading-relaxed text-white/85 font-mono whitespace-pre-wrap overflow-x-auto max-h-[420px] overflow-y-auto scrollbar-thin">
{JSON.stringify(orPkg, null, 2)}
      </pre>
      <div className="mt-3 text-[10.5px] text-mutedHi leading-relaxed">
        Any skill — whether authored in{" "}
        <span className="text-white">OpenClaw</span>,{" "}
        <span className="text-white">Claude Code</span>,{" "}
        <span className="text-white">Dify</span>,{" "}
        <span className="text-white">LangGraph</span> or a custom agent — is
        normalized to a <span className="font-mono text-[#b6c98f]">.or</span>{" "}
        package on upload. The same manifest powers the card, the runtime, the
        invoke endpoint and the onchain record.
      </div>
    </div>
  );
}

function RuntimeTab({ skill }: { skill: SkillModule }) {
  return (
    <div>
      <SectionLabel>Hosted Runtime · Token Gateway</SectionLabel>
      <div className="mt-2 rounded-xl border border-white/5 bg-bg2/40 p-4">
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <KV label="Model" value={skill.runtime.model} />
          <KV label="Memory" value={skill.runtime.memory} />
          <KV
            label="Avg Latency"
            value={`${(skill.runtime.avgLatencyMs / 1000).toFixed(2)}s`}
          />
          <KV
            label="Model Cost"
            value={`$${(skill.runtime.tokenCostCents / 100).toFixed(3)} / invoke`}
          />
        </div>
        <div className="mt-3">
          <div className="text-[10px] uppercase tracking-wider text-mutedHi mb-1">
            Tools attached
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skill.runtime.tools.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded text-[10px] font-mono text-[#b6c98f] bg-[#7a9450]/10 border border-[#7a9450]/20"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <SectionLabel>Execution Flow</SectionLabel>
        <div className="mt-2 rounded-xl border border-white/5 bg-bg2/40 p-4 text-[11.5px] leading-relaxed text-mutedHi font-mono">
          <div>
            <span className="text-[#f0d493]">user</span> ──▶{" "}
            <span className="text-white">Orchor Gateway</span>
          </div>
          <div className="ml-12">
            └─ deducts <span className="text-[#f0d493]">{skill.energyCost} ⚡</span> from balance
          </div>
          <div className="mt-1">
            <span className="text-white">Gateway</span> ──▶{" "}
            <span className="text-[#b6c98f]">Skill Runtime</span> (.or sandbox)
          </div>
          <div className="ml-12">
            └─ loads model: <span className="text-white">{skill.runtime.model}</span>
          </div>
          <div className="ml-12">└─ binds tools: {skill.runtime.tools.length}</div>
          <div className="mt-1">
            <span className="text-[#b6c98f]">Runtime</span> ──▶{" "}
            <span className="text-[#7a9450]">LLM + Tools</span>
          </div>
          <div className="ml-12">
            └─ token cost: <span className="text-white">${(skill.runtime.tokenCostCents / 100).toFixed(3)}</span> (paid by Orchor)
          </div>
          <div className="mt-1">
            <span className="text-[#7a9450]">Response</span> ──▶{" "}
            <span className="text-white">user</span>
          </div>
          <div className="mt-1">
            <span className="text-[#d98a7d]">Settlement</span> ──▶ Monad onchain log + creator split (70%)
          </div>
        </div>
      </div>

      <div className="mt-3 text-[10.5px] text-mutedHi leading-relaxed">
        Users never bring their own API keys. Orchor routes inference through
        managed model providers and charges{" "}
        <span className="text-[#f0d493]">Energy</span> — a unified credit that
        abstracts model cost, platform service fee and onchain settlement.
      </div>
    </div>
  );
}

function PaymentTimeline({
  step,
  mode,
  isConfirming,
}: {
  step: Step;
  mode: Mode;
  isConfirming: boolean;
}) {
  const items: { key: Step; label: string }[] =
    mode === "invoke"
      ? [
          { key: "confirm", label: "Awaiting wallet signature" },
          { key: "submitting", label: isConfirming ? "Confirming on Monad…" : "Submitted to Monad" },
          { key: "done", label: "Energy debited · invocation logged onchain" },
        ]
      : [
          { key: "confirm", label: "Awaiting wallet signature" },
          { key: "submitting", label: isConfirming ? "Confirming on Monad…" : "Submitted to Monad" },
          {
            key: "done",
            label:
              mode === "subscribe"
                ? "Subscription active · 30 days"
                : "Skill unlocked · revenue split 70/25/5",
          },
        ];
  const idx = items.findIndex((i) => i.key === step);
  if (step === "idle" || step === "error") return null;
  return (
    <div className="mt-4 space-y-1.5">
      {items.map((it, i) => {
        const done = idx > i || step === "done";
        const active = idx === i;
        return (
          <div key={it.key} className="flex items-center gap-2 text-[11px]">
            <span
              className={`h-3 w-3 rounded-full flex items-center justify-center text-[9px] ${
                done
                  ? "bg-[#7a9450] text-black"
                  : active
                  ? "bg-gradient-to-r from-accent to-accent2 animate-pulseDot"
                  : "bg-white/10"
              }`}
            >
              {done && "✓"}
            </span>
            <span className={done || active ? "text-white" : "text-muted"}>
              {it.label}
            </span>
            {done && it.key !== "done" && (
              <span className="text-[#7a9450] ml-auto font-mono">ok</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.18em] text-mutedHi">
      {children}
    </div>
  );
}

function CodeBlock({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-bg2/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-mutedHi mb-1">
        {label}
      </div>
      <pre className="text-[11px] leading-snug text-white/85 font-mono whitespace-pre-wrap">
        {body}
      </pre>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-2">
      <div className="text-[9px] uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-0.5 font-mono text-[12px] text-white">{value}</div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-mutedHi uppercase tracking-wider text-[10px]">{label}</span>
      <span className="font-mono text-white tabular">{value}</span>
    </div>
  );
}
