"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import type { SkillModule } from "@/lib/skills";
import { RARITY } from "@/lib/rarity";
import { useDeck } from "@/lib/deckStore";
import { useOrchorState } from "@/lib/useOrchorState";
import { useOrchorWrites } from "@/lib/useOrchor";
import { useCreditBalance } from "@/lib/hooks/useCreditBalance";
import { buildOrPackage } from "@/lib/orPackage";
import { explorerTxUrl } from "@/lib/chain";
import { EnergyBolt, MonadIcon, CreditIcon } from "./TopNav";

type Step = "idle" | "confirm" | "submitting" | "done" | "error";
type Mode = "invoke" | "subscribe" | "unlock";
type PaymentMode = "energy" | "credits"; // NEW
type Tab = "overview" | "package" | "runtime";

interface Props {
  skill: SkillModule | null;
  onClose: () => void;
  onOpenTopUp: () => void;
  onOpenTopUpCredits?: () => void; // NEW
}

export function SkillDetailModal({ skill, onClose, onOpenTopUp, onOpenTopUpCredits }: Props) {
  const { isConnected } = useAccount();
  const { address } = useAccount();
  const { owned: ownedSet, subscribed: subSet, energy } = useOrchorState();
  const { credits, refetch: refetchCredits } = useCreditBalance(); // NEW
  const {
    topUp,
    unlock,
    subscribe,
    invoke,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
  } = useOrchorWrites();
  const { noteInvoke, bumpRefetch } = useDeck();

  const [step, setStep] = useState<Step>("idle");
  const [mode, setMode] = useState<Mode>("invoke");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("credits"); // NEW: Default to credits
  const [tab, setTab] = useState<Tab>("overview");
  const [err, setErr] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [output, setOutput] = useState<string>(""); // NEW: For Credits execution

  useEffect(() => {
    if (isConfirmed && step === "submitting") {
      setStep("done");
      bumpRefetch();
    }
  }, [isConfirmed, step, bumpRefetch]);

  useEffect(() => {
    if (!skill) {
      setStep("idle");
      setMode("invoke");
      setTab("overview");
      setErr(null);
      setTxHash(null);
      setOutput("");
    }
  }, [skill]);

  if (!skill) return null;

  const theme = RARITY[skill.rarity];
  const owned = ownedSet.has(skill.id);
  const subscribed = subSet.has(skill.id);

  const showUnlock = !owned && skill.rarity === "Mythic";
  const showSubscribe = !subscribed && skill.subscriptionMON;

  const monPrice = mode === "subscribe" && skill.subscriptionMON ? skill.subscriptionMON : skill.priceMON;
  const energyPrice = skill.energyCost;
  const creditsPrice = skill.energyCost * 10; // NEW: 1 energy ≈ 10 credits

  const insufficientEnergy = paymentMode === "energy" && mode === "invoke" && energy < energyPrice;
  const insufficientCredits = paymentMode === "credits" && Number(credits) < creditsPrice; // NEW

  // NEW: Credits execution flow
  async function executeWithCredits() {
    if (!address || !skill) return;

    setStep("submitting");
    try {
      const response = await fetch("/api/skills/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: address,
          skillId: skill.id,
          input: skill.inputExample || "Execute this skill",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOutput(data.output);
        setStep("done");
        refetchCredits();
        noteInvoke(skill.id);
      } else {
        setErr(data.error || "Execution failed");
        setStep("error");
      }
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Failed to execute skill");
      setStep("error");
    }
  }

  // Original Energy payment flow
  async function runPaymentFlow() {
    if (!skill) return;
    if (!isConnected) return;

    // NEW: Route to Credits flow
    if (paymentMode === "credits") {
      if (mode === "invoke") {
        if (insufficientCredits) {
          onOpenTopUpCredits?.();
          return;
        }
        await executeWithCredits();
        return;
      }
      // Subscribe and Unlock still use Energy for now
      setPaymentMode("energy");
    }

    // Original Energy flow
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
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={step === "idle" ? onClose : undefined}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            className="relative w-[min(900px,96vw)] max-h-[90vh] overflow-y-auto rounded-3xl glass-strong scrollbar-thin"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              disabled={step !== "idle"}
              className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full glass flex items-center justify-center disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path d="M6 6 L18 18 M18 6 L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div
                  className="shrink-0 h-20 w-20 rounded-xl flex items-center justify-center text-4xl"
                  style={{ background: theme.gradient }}
                >
                  {skill.category[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded"
                      style={{ color: theme.text, background: theme.bg }}
                    >
                      {skill.rarity}
                    </span>
                    <span className="text-[10px] text-muted">·</span>
                    <span className="text-[10px] text-mutedHi">{skill.category}</span>
                  </div>
                  <h2 className="mt-1 font-display text-2xl font-bold">{skill.title}</h2>
                  <p className="mt-1 text-[12px] text-mutedHi">{skill.shortDescription}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-6 flex items-center gap-2 border-b border-white/10">
                {(["overview", "package", "runtime"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`relative px-3 py-2 text-[11px] font-medium uppercase tracking-wider transition ${
                      tab === t ? "text-white" : "text-mutedHi hover:text-white"
                    }`}
                  >
                    {tab === t && (
                      <motion.div
                        layoutId="tab-active"
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-accent"
                        transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                      />
                    )}
                    {t}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="mt-4">
                {tab === "overview" && (
                  <OverviewTab
                    skill={skill}
                    mode={mode}
                    paymentMode={paymentMode}
                    onModeChange={setMode}
                    onPaymentModeChange={setPaymentMode}
                    showUnlock={showUnlock}
                    showSubscribe={showSubscribe}
                    owned={owned}
                    subscribed={subscribed}
                    creditsPrice={creditsPrice}
                    energyPrice={energyPrice}
                    monPrice={monPrice}
                  />
                )}
                {tab === "package" && <PackageTab skill={skill} />}
                {tab === "runtime" && <RuntimeTab skill={skill} />}
              </div>

              {/* Action Section */}
              {step === "idle" && (
                <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <ActionSection
                    skill={skill}
                    mode={mode}
                    paymentMode={paymentMode}
                    step={step}
                    insufficientEnergy={insufficientEnergy}
                    insufficientCredits={insufficientCredits}
                    owned={owned}
                    subscribed={subscribed}
                    onExecute={runPaymentFlow}
                    onOpenTopUp={paymentMode === "credits" ? onOpenTopUpCredits : onOpenTopUp}
                  />
                </div>
              )}

              {/* Status Messages */}
              {step === "confirm" && <ConfirmStep />}
              {step === "submitting" && (
                <SubmittingStep paymentMode={paymentMode} txHash={txHash} />
              )}
              {step === "done" && (
                <DoneStep
                  paymentMode={paymentMode}
                  txHash={txHash}
                  output={output}
                  onClose={onClose}
                />
              )}
              {step === "error" && <ErrorStep error={err} onRetry={() => setStep("idle")} />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ... Continue in next message due to length
