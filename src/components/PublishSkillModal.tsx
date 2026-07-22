"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { decodeEventLog } from "viem";
import { usePublicClient } from "wagmi";
import type {
  SkillCategory,
  OrigPlatform,
  RuntimeModel,
} from "@/lib/skills";
import type { Rarity } from "@/lib/rarity";
import { RARITY } from "@/lib/rarity";
import { useOrchorWrites, useNextSkillId } from "@/lib/useOrchor";
import { ORCHOR_ABI, explorerTxUrl } from "@/lib/chain";
import { buildSkillFromForm, usePublished } from "@/lib/publishedStore";
import { useDeck } from "@/lib/deckStore";
import { SkillCard } from "./SkillCard";
import { EnergyBolt, InjectiveIcon } from "./TopNav";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = "form" | "manifest" | "preset";
type Step = "idle" | "confirm" | "submitting" | "indexing" | "done" | "error";

const RARITY_OPTIONS: Rarity[] = ["Common", "Rare", "Epic", "Legendary", "Mythic"];
const CATEGORY_OPTIONS: SkillCategory[] = [
  "Research",
  "Product",
  "Marketing",
  "Automation",
  "Web3 Dev",
  "Data",
];
const ORIGIN_OPTIONS: OrigPlatform[] = [
  "OpenClaw",
  "Claude Code",
  "Lobehub",
  "Dify",
  "LangGraph",
  "Custom Agent",
];
const MODEL_OPTIONS: RuntimeModel[] = [
  "gpt-4o",
  "gpt-4.1",
  "claude-sonnet-4.6",
  "claude-opus-4.7",
  "gemini-2.5-pro",
  "orchor-router",
];

const RARITY_INDEX: Record<Rarity, number> = {
  Common: 0,
  Rare: 1,
  Epic: 2,
  Legendary: 3,
  Mythic: 4,
};

interface FormState {
  title: string;
  shortDescription: string;
  category: SkillCategory;
  rarity: Rarity;
  energyCost: number;
  priceMON: number;
  subscriptionMON: number;
  mintCap: number;
  creator: string;
  creatorHandle: string;
  origin: OrigPlatform;
  model: RuntimeModel;
  memory: "none" | "ephemeral" | "persistent";
  tools: string; // comma-separated in UI
  pipeline: string; // comma-separated in UI
  inputExample: string;
  outputPreview: string;
}

const EMPTY: FormState = {
  title: "",
  shortDescription: "",
  category: "Research",
  rarity: "Epic",
  energyCost: 20,
  priceMON: 0.06,
  subscriptionMON: 2.0,
  mintCap: 0,
  creator: "",
  creatorHandle: "",
  origin: "Custom Agent",
  model: "gpt-4o",
  memory: "ephemeral",
  tools: "web.search, chart.render",
  pipeline: "Frame, Score, Render",
  inputExample: "Analyze the on-chain activity of Injective Labs treasury",
  outputPreview:
    "▸ 14 outflows / 22 inflows (30d)\n▸ Net change: +1.2k INJ\n▸ Active counterparties: 8\n▸ Notable: 1 CEX deposit (Binance)",
};

const PRESETS: { id: string; label: string; origin: OrigPlatform; data: Partial<FormState> }[] = [
  {
    id: "claude-code-pr-reviewer",
    label: "Claude Code · PR Reviewer",
    origin: "Claude Code",
    data: {
      title: "PR Reviewer Agent",
      shortDescription:
        "Reads a GitHub PR diff and produces senior-engineer level review with severity tags.",
      category: "Web3 Dev",
      rarity: "Epic",
      energyCost: 36,
      priceMON: 0.09,
      subscriptionMON: 2.6,
      origin: "Claude Code",
      model: "claude-opus-4.7",
      memory: "ephemeral",
      tools: "github.pr.fetch, code.parse, ast.diff",
      pipeline: "Fetch, Parse, Critique, Score",
      inputExample: "Review https://github.com/foo/bar/pull/124",
      outputPreview:
        "✗ HIGH  unchecked re-entry in withdrawAll:88\n✓ PASS  test coverage delta +12%\n⚠ MED   missing access control on setOwner\n▸ verdict: request changes",
    },
  },
  {
    id: "langgraph-research-loop",
    label: "LangGraph · Research Loop",
    origin: "LangGraph",
    data: {
      title: "Iterative Research Agent",
      shortDescription:
        "Loops research → critique → refine until source quality threshold is met.",
      category: "Research",
      rarity: "Legendary",
      energyCost: 64,
      priceMON: 0.14,
      subscriptionMON: 4.2,
      origin: "LangGraph",
      model: "orchor-router",
      memory: "persistent",
      tools: "web.search, web.fetch, summarize, critique",
      pipeline: "Plan, Search, Critique, Refine",
      inputExample: "Survey the latest parallel-EVM rollup designs",
      outputPreview:
        "▸ 14 sources (8 academic / 6 industry)\n▸ Critique iterations: 3\n▸ Source quality: 0.92\n▸ Synthesis ready",
    },
  },
  {
    id: "openclaw-tweet-stylist",
    label: "OpenClaw · Tweet Stylist",
    origin: "OpenClaw",
    data: {
      title: "Crypto Tweet Stylist",
      shortDescription:
        "Rewrites copy in CT-degen tone with era-calibrated meme references.",
      category: "Marketing",
      rarity: "Rare",
      energyCost: 8,
      priceMON: 0.03,
      subscriptionMON: 1.0,
      origin: "OpenClaw",
      model: "gpt-4o",
      memory: "none",
      tools: "tone.adjust, meme.lookup",
      pipeline: "Tone, Refs, Compress",
      inputExample: "Rewrite this announcement in degen tone, max 240 chars",
      outputPreview:
        "▸ Tone: high-conviction\n▸ Refs: parallel EVM, points szn\n▸ Length: 218 chars",
    },
  },
  {
    id: "dify-onchain-pulse",
    label: "Dify · Onchain Pulse",
    origin: "Dify",
    data: {
      title: "Onchain Pulse Reporter",
      shortDescription:
        "Streams onchain analytics: wallet cohorts, flow graphs, anomaly alerts.",
      category: "Data",
      rarity: "Epic",
      energyCost: 28,
      priceMON: 0.08,
      subscriptionMON: 2.5,
      origin: "Dify",
      model: "claude-sonnet-4.6",
      memory: "persistent",
      tools: "chain.index, cohort.build, anomaly.zscore",
      pipeline: "Index, Cohort, Detect, Report",
      inputExample: "Find anomalous INJ transfer patterns in the last 24h",
      outputPreview:
        "▸ 3 anomalous wallets\n▸ Net outflow +124k INJ\n▸ Z-score: 3.6",
    },
  },
];

export function PublishSkillModal({ open, onClose }: Props) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { publishSkill, isConfirming, isConfirmed } = useOrchorWrites();
  const { nextSkillId, refetch: refetchNextId } = useNextSkillId();
  const add = usePublished((s) => s.add);
  const bumpRefetch = useDeck((s) => s.bumpRefetch);

  const [tab, setTab] = useState<Tab>("form");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [step, setStep] = useState<Step>("idle");
  const [err, setErr] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [newSkillId, setNewSkillId] = useState<number | null>(null);
  const [manifestText, setManifestText] = useState("");

  useEffect(() => {
    if (open) {
      setTab("form");
      setForm(EMPTY);
      setStep("idle");
      setErr(null);
      setTxHash(null);
      setNewSkillId(null);
      setManifestText("");
      refetchNextId();
    }
  }, [open, refetchNextId]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const previewSkill = useMemo(() => {
    return buildSkillFromForm({
      skillId: nextSkillId || 100,
      title: form.title || "Your Skill Title",
      shortDescription: form.shortDescription || "Short description of what this skill does.",
      category: form.category,
      rarity: form.rarity,
      energyCost: form.energyCost,
      priceMON: form.priceMON,
      subscriptionMON: form.subscriptionMON,
      mintCap: form.rarity === "Mythic" ? form.mintCap || 100 : undefined,
      creator: form.creator || "You",
      creatorHandle: form.creatorHandle || "@you",
      creatorAvatar: (form.creator || "YOU").slice(0, 2).toUpperCase(),
      origin: form.origin,
      model: form.model,
      tools: form.tools
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      memory: form.memory,
      pipeline: form.pipeline
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      inputExample: form.inputExample,
      outputPreview: form.outputPreview,
    });
  }, [form, nextSkillId]);

  function applyPreset(p: (typeof PRESETS)[number]) {
    setForm((f) => ({ ...f, ...p.data, creator: f.creator, creatorHandle: f.creatorHandle }));
    setTab("form");
  }

  function tryImportManifest() {
    try {
      const parsed = JSON.parse(manifestText);
      const m = parsed.manifest ?? parsed;
      const rt = parsed.runtime ?? {};
      const econ = parsed.economics ?? {};
      const next: Partial<FormState> = {
        title: m.name ?? "",
        shortDescription: m.description ?? "",
        category: (m.category as SkillCategory) ?? "Research",
        rarity:
          (m.rarity as Rarity) ?? (parsed.rarity as Rarity) ?? "Epic",
        energyCost: Number(econ.invoke_cost_energy ?? 20),
        priceMON: Number(parsed.priceMON ?? 0.05),
        subscriptionMON: Number(parsed.subscriptionMON ?? 1.5),
        creator: m.creator ?? "",
        creatorHandle: m.creator_handle ?? "",
        origin: (parsed.origin as OrigPlatform) ?? "Custom Agent",
        model: (rt.model as RuntimeModel) ?? "gpt-4o",
        memory: (rt.memory as FormState["memory"]) ?? "ephemeral",
        tools: Array.isArray(rt.tools) ? rt.tools.join(", ") : form.tools,
        pipeline: Array.isArray(parsed.pipeline)
          ? parsed.pipeline.map((p: { name?: string }) => p.name ?? "").filter(Boolean).join(", ")
          : form.pipeline,
        inputExample:
          (Array.isArray(parsed.inputs) && parsed.inputs[0]?.example) ||
          form.inputExample,
      };
      setForm((f) => ({ ...f, ...next }));
      setTab("form");
      setErr(null);
    } catch (e) {
      setErr(
        e instanceof Error
          ? `Could not parse manifest: ${e.message}`
          : "Could not parse manifest"
      );
    }
  }

  function validate(): string | null {
    if (!form.title.trim()) return "Title required";
    if (!form.shortDescription.trim()) return "Description required";
    if (!form.creator.trim()) return "Creator name required";
    if (form.energyCost <= 0) return "Energy cost must be > 0";
    if (form.priceMON < 0 || form.subscriptionMON < 0) return "Prices must be ≥ 0";
    if (form.rarity === "Mythic" && form.mintCap <= 0)
      return "Mythic skills need a mintCap > 0";
    if (form.rarity !== "Mythic" && form.mintCap !== 0)
      return "mintCap must be 0 for non-Mythic skills";
    return null;
  }

  async function submit() {
    if (!address) return;
    const v = validate();
    if (v) {
      setErr(v);
      setStep("error");
      return;
    }
    setErr(null);
    setStep("confirm");
    try {
      const h = await publishSkill({
        name: form.title,
        rarity: RARITY_INDEX[form.rarity],
        energyCost: form.energyCost,
        unlockPriceMON: form.priceMON,
        subscriptionPriceMON: form.subscriptionMON,
        mintCap: form.rarity === "Mythic" ? form.mintCap : 0,
      });
      setTxHash(h);
      setStep("submitting");

      // wait for receipt + parse SkillRegistered event for the new skillId
      if (!publicClient) throw new Error("No public client");
      const receipt = await publicClient.waitForTransactionReceipt({ hash: h });
      setStep("indexing");

      let parsedId: number | null = null;
      for (const log of receipt.logs) {
        try {
          const ev = decodeEventLog({
            abi: ORCHOR_ABI,
            data: log.data,
            topics: log.topics,
          });
          if (ev.eventName === "SkillRegistered") {
            const args = ev.args as unknown as { skillId: bigint };
            parsedId = Number(args.skillId);
            break;
          }
        } catch {
          // not our event, skip
        }
      }
      if (parsedId == null) throw new Error("Could not find SkillRegistered event in receipt");

      const skill = buildSkillFromForm({
        skillId: parsedId,
        title: form.title,
        shortDescription: form.shortDescription,
        category: form.category,
        rarity: form.rarity,
        energyCost: form.energyCost,
        priceMON: form.priceMON,
        subscriptionMON: form.subscriptionMON,
        mintCap: form.rarity === "Mythic" ? form.mintCap : undefined,
        creator: form.creator,
        creatorHandle: form.creatorHandle || `@${form.creator.toLowerCase().replace(/\s+/g, "")}`,
        creatorAvatar: form.creator.slice(0, 2).toUpperCase(),
        origin: form.origin,
        model: form.model,
        tools: form.tools.split(",").map((t) => t.trim()).filter(Boolean),
        memory: form.memory,
        pipeline: form.pipeline.split(",").map((t) => t.trim()).filter(Boolean),
        inputExample: form.inputExample,
        outputPreview: form.outputPreview,
      });

      add({
        skillId: parsedId,
        publishedAt: new Date().toISOString(),
        publisher: address,
        txHash: h,
        skill,
      });
      setNewSkillId(parsedId);
      bumpRefetch();
      setStep("done");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      setErr(msg.split("\n")[0]);
      setStep("error");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[55] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="relative w-[min(1120px,96vw)] max-h-[92vh] overflow-y-auto rounded-3xl glass-strong scrollbar-thin"
          >
            <div
              className="absolute -top-24 left-1/2 -translate-x-1/2 h-44 w-[70%] blur-3xl opacity-60 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, rgba(214,164,76,0.55), rgba(122,148,80,0.55))",
              }}
            />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full glass flex items-center justify-center"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path d="M6 6 L18 18 M18 6 L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <div className="relative p-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-mutedHi">
                  Creator · Publish to Orchor
                </div>
                <h2 className="mt-1 font-display text-2xl font-bold">
                  Publish a new <span className="text-gradient">Skill Card</span>
                </h2>
                <p className="mt-1 text-[12px] text-mutedHi">
                  Mints a new skill onchain via{" "}
                  <span className="font-mono text-[#b6c98f]">registerSkill</span>.
                  Onchain stores name + rarity + economics. The rest of the
                  manifest lives off-chain (IPFS in production; localStorage
                  for this demo).
                </p>
              </div>

              {/* mode tabs */}
              <div className="mt-5 flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] w-fit">
                {(
                  [
                    ["form", "Form"],
                    ["manifest", "Import .or"],
                    ["preset", "From Agent Platform"],
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

              {/* body: left = input, right = live preview */}
              <div className="mt-5 grid lg:grid-cols-[1fr_360px] gap-6">
                <div className="space-y-4">
                  {tab === "form" && (
                    <FormPanel form={form} update={update} />
                  )}
                  {tab === "manifest" && (
                    <ManifestPanel
                      text={manifestText}
                      setText={setManifestText}
                      onImport={tryImportManifest}
                    />
                  )}
                  {tab === "preset" && (
                    <PresetPanel onPick={applyPreset} />
                  )}
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] uppercase tracking-wider text-mutedHi mb-1">
                    Live Preview
                  </div>
                  <div className="flex items-start justify-center">
                    <div className="scale-[0.78] origin-top">
                      <SkillCard
                        skill={previewSkill}
                        variant="main"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-[11px] text-mutedHi space-y-1">
                    <Row k="Onchain skillId" v={`#${nextSkillId} (next)`} mono />
                    <Row k="Rarity index" v={`${RARITY_INDEX[form.rarity]}`} mono />
                    <Row
                      k="Unlock price"
                      v={`${form.priceMON} INJ`}
                      mono
                    />
                    <Row
                      k="Subscription"
                      v={`${form.subscriptionMON} INJ / 30d`}
                      mono
                    />
                    <Row
                      k="Invoke cost"
                      v={`${form.energyCost} ⚡`}
                      mono
                    />
                    {form.rarity === "Mythic" && (
                      <Row
                        k="Mint cap"
                        v={`${form.mintCap} (Mythic only)`}
                        mono
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* status / actions */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                {step !== "idle" && step !== "error" && (
                  <PublishTimeline
                    step={step}
                    isConfirming={isConfirming}
                    txHash={txHash}
                  />
                )}
                {step === "done" && newSkillId != null && (
                  <div className="mt-2 rounded-lg p-2 bg-[#7a9450]/10 border border-[#7a9450]/30 text-[11.5px] text-[#7a9450]">
                    ✓ Skill <span className="font-mono text-white">#{newSkillId}</span> minted onchain. It now appears
                    in the Grid + carousel and can be unlocked / invoked by
                    anyone on Injective Testnet.
                    {txHash && (
                      <>
                        {" "}·{" "}
                        <a
                          href={explorerTxUrl(txHash)}
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-[#7a9450]"
                        >
                          view tx
                        </a>
                      </>
                    )}
                  </div>
                )}
                {step === "error" && err && (
                  <div className="rounded-lg p-2 bg-red-500/10 border border-red-500/30 text-[11.5px] text-red-300">
                    ✗ {err}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="btn-ghost h-11 px-4 rounded-xl text-[12px]"
                  >
                    {step === "done" ? "Close" : "Cancel"}
                  </button>
                  {step === "done" ? (
                    <button
                      onClick={() => {
                        setStep("idle");
                        setForm(EMPTY);
                        setTxHash(null);
                        setNewSkillId(null);
                        refetchNextId();
                      }}
                      className="flex-1 btn-neon h-11 rounded-xl text-[13px] font-semibold"
                    >
                      Publish another skill
                    </button>
                  ) : (
                    <button
                      onClick={submit}
                      disabled={
                        !isConnected || step === "confirm" || step === "submitting" || step === "indexing"
                      }
                      className="flex-1 btn-neon h-11 rounded-xl text-[13px] font-semibold"
                    >
                      {!isConnected
                        ? "Connect wallet to publish"
                        : step === "idle" || step === "error"
                        ? `Publish Skill · register on Injective`
                        : step === "confirm"
                        ? "Awaiting wallet…"
                        : isConfirming
                        ? "Confirming on Injective…"
                        : step === "indexing"
                        ? "Indexing off-chain metadata…"
                        : "Submitting…"}
                    </button>
                  )}
                </div>

                <div className="mt-3 text-[10px] text-muted text-center">
                  Calls{" "}
                  <span className="font-mono text-[#b6c98f]">
                    OrchorCore.registerSkill
                  </span>{" "}
                  · payable gas in INJ · creator becomes msg.sender · earns 70%
                  of every unlock + subscription forever
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ────────── tabs ────────── */

function FormPanel({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <Section title="Identity">
        <Field label="Title">
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Onchain Anomaly Detector"
            className="input"
          />
        </Field>
        <Field label="Short description">
          <textarea
            value={form.shortDescription}
            onChange={(e) => update("shortDescription", e.target.value)}
            placeholder="What does this skill do, in one sentence?"
            rows={2}
            className="input"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Creator name">
            <input
              value={form.creator}
              onChange={(e) => update("creator", e.target.value)}
              placeholder="Your studio / handle"
              className="input"
            />
          </Field>
          <Field label="Handle">
            <input
              value={form.creatorHandle}
              onChange={(e) => update("creatorHandle", e.target.value)}
              placeholder="@yourhandle"
              className="input"
            />
          </Field>
        </div>
      </Section>

      <Section title="Classification">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <Select
              value={form.category}
              onChange={(v) => update("category", v as SkillCategory)}
              options={CATEGORY_OPTIONS}
            />
          </Field>
          <Field label="Rarity">
            <Select
              value={form.rarity}
              onChange={(v) => {
                update("rarity", v as Rarity);
                if (v !== "Mythic") update("mintCap", 0);
                else if (form.mintCap === 0) update("mintCap", 100);
              }}
              options={RARITY_OPTIONS}
              renderOption={(r) => {
                const theme = RARITY[r as Rarity];
                return (
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: theme.glow }}
                    />
                    {r}
                  </span>
                );
              }}
            />
          </Field>
        </div>
        {form.rarity === "Mythic" && (
          <Field label="Mint cap (Mythic only · enforced onchain)">
            <input
              type="number"
              min={1}
              value={form.mintCap}
              onChange={(e) => update("mintCap", Number(e.target.value))}
              className="input font-mono"
            />
          </Field>
        )}
      </Section>

      <Section title="Economics">
        <div className="grid grid-cols-3 gap-3">
          <Field label={<><EnergyBolt size={10} /> Energy / invoke</>}>
            <input
              type="number"
              min={1}
              value={form.energyCost}
              onChange={(e) => update("energyCost", Number(e.target.value))}
              className="input font-mono text-[#f0d493]"
            />
          </Field>
          <Field label={<><InjectiveIcon size={10} /> Unlock INJ</>}>
            <input
              type="number"
              step={0.01}
              min={0}
              value={form.priceMON}
              onChange={(e) => update("priceMON", Number(e.target.value))}
              className="input font-mono"
            />
          </Field>
          <Field label={<><InjectiveIcon size={10} /> Sub INJ / 30d</>}>
            <input
              type="number"
              step={0.01}
              min={0}
              value={form.subscriptionMON}
              onChange={(e) => update("subscriptionMON", Number(e.target.value))}
              className="input font-mono"
            />
          </Field>
        </div>
      </Section>

      <Section title="Runtime">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Origin platform">
            <Select
              value={form.origin}
              onChange={(v) => update("origin", v as OrigPlatform)}
              options={ORIGIN_OPTIONS}
            />
          </Field>
          <Field label="Model">
            <Select
              value={form.model}
              onChange={(v) => update("model", v as RuntimeModel)}
              options={MODEL_OPTIONS}
            />
          </Field>
          <Field label="Memory">
            <Select
              value={form.memory}
              onChange={(v) => update("memory", v as FormState["memory"])}
              options={["none", "ephemeral", "persistent"]}
            />
          </Field>
        </div>
        <Field label="Tools (comma-separated)">
          <input
            value={form.tools}
            onChange={(e) => update("tools", e.target.value)}
            placeholder="web.search, chain.fetch, …"
            className="input font-mono"
          />
        </Field>
        <Field label="Pipeline (comma-separated)">
          <input
            value={form.pipeline}
            onChange={(e) => update("pipeline", e.target.value)}
            placeholder="Plan, Search, Synthesize"
            className="input font-mono"
          />
        </Field>
      </Section>

      <Section title="Sample I/O">
        <Field label="Sample input">
          <textarea
            value={form.inputExample}
            onChange={(e) => update("inputExample", e.target.value)}
            rows={2}
            className="input font-mono text-[11px]"
          />
        </Field>
        <Field label="Sample output">
          <textarea
            value={form.outputPreview}
            onChange={(e) => update("outputPreview", e.target.value)}
            rows={4}
            className="input font-mono text-[11px]"
          />
        </Field>
      </Section>
    </div>
  );
}

function ManifestPanel({
  text,
  setText,
  onImport,
}: {
  text: string;
  setText: (s: string) => void;
  onImport: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="text-[12px] text-mutedHi leading-relaxed">
        Paste a <span className="font-mono text-[#b6c98f]">.or</span> manifest
        (or any compatible JSON exported from{" "}
        <span className="text-white">OpenClaw</span>,{" "}
        <span className="text-white">Claude Code</span>,{" "}
        <span className="text-white">LangGraph</span>, etc.) and Orchor will
        normalize it into form fields. You can review and edit before signing
        the onchain registerSkill tx.
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='{ "manifest": { "name": "…", "rarity": "Epic", "creator": "…" }, "runtime": { … }, "economics": { … } }'
        rows={14}
        className="input font-mono text-[11px] leading-relaxed scrollbar-thin"
      />
      <button
        onClick={onImport}
        disabled={!text.trim()}
        className="btn-neon h-10 px-4 rounded-lg text-[12px] font-semibold disabled:opacity-50"
      >
        Parse manifest →
      </button>
    </div>
  );
}

function PresetPanel({
  onPick,
}: {
  onPick: (p: (typeof PRESETS)[number]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="text-[12px] text-mutedHi leading-relaxed">
        Simulate{" "}
        <span className="text-white">&apos;Publish to Orchor&apos;</span> as if
        the skill was exported from one of the partner agent platforms below.
        Orchor parses the export and prefills the form — you only review +
        sign.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => onPick(p)}
            className="text-left rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-3 transition"
          >
            <div className="text-[10px] uppercase tracking-wider text-[#b6c98f]">
              {p.origin}
            </div>
            <div className="mt-1 font-display text-[14px] font-semibold text-white">
              {p.data.title}
            </div>
            <div className="mt-1 text-[10.5px] text-mutedHi line-clamp-2">
              {p.data.shortDescription}
            </div>
            <div className="mt-2 text-[10px] font-mono text-[#f0d493]">
              {p.data.energyCost} ⚡ · {p.data.priceMON} INJ
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function PublishTimeline({
  step,
  isConfirming,
  txHash,
}: {
  step: Step;
  isConfirming: boolean;
  txHash: `0x${string}` | null;
}) {
  const items: { key: Step; label: string }[] = [
    { key: "confirm", label: "Awaiting wallet signature" },
    {
      key: "submitting",
      label: isConfirming ? "Confirming registerSkill on Injective…" : "Submitted to Injective",
    },
    { key: "indexing", label: "Parsing SkillRegistered event + saving manifest" },
    { key: "done", label: "Skill live · listed in marketplace" },
  ];
  const idx = items.findIndex((i) => i.key === step);
  return (
    <div className="space-y-1.5">
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
      {txHash && (step === "submitting" || step === "indexing") && (
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
    </div>
  );
}

/* ────────── tiny ui primitives ────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-mutedHi mb-3">
        {title}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-wider text-mutedHi mb-1 flex items-center gap-1">
        {label}
      </div>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
  renderOption,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  renderOption?: (v: string) => React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input appearance-none pr-8 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-bg2 text-white">
            {o}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 12 12"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-mutedHi pointer-events-none"
      >
        <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
      {renderOption && (
        <div className="absolute inset-y-0 left-3 flex items-center text-[12px] text-white pointer-events-none bg-bg2 pr-2">
          {renderOption(value)}
        </div>
      )}
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[11px]">
      <span className="text-mutedHi">{k}</span>
      <span className={mono ? "font-mono text-white tabular" : "text-white"}>{v}</span>
    </div>
  );
}
