"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAccount } from "wagmi";
import type { SkillModule } from "@/lib/skills";
import { RarityBadge } from "./RarityBadge";
import { AttributeBar } from "./AttributeBar";
import { useOrchorState } from "@/lib/useOrchorState";
import { useOrchorWrites } from "@/lib/useOrchor";
import { useCreditBalance } from "@/lib/hooks/useCreditBalance";

type Step = "idle" | "confirm" | "submitting" | "done" | "error";
type Mode = "invoke" | "subscribe" | "unlock";
type PaymentMode = "energy" | "credits";

interface CardDetailModalProps {
  skill: SkillModule | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTopUp?: () => void;
  onOpenTopUpCredits?: () => void;
}

export function CardDetailModal({
  skill,
  isOpen,
  onClose,
  onOpenTopUp,
  onOpenTopUpCredits,
}: CardDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "stats" | "history">("details");
  const [step, setStep] = useState<Step>("idle");
  const [mode, setMode] = useState<Mode>("invoke");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("credits");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [output, setOutput] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const { isConnected } = useAccount();
  const { energy } = useOrchorState();
  const { credits } = useCreditBalance();
  const { invoke, subscribe, unlock } = useOrchorWrites();

  if (!skill) return null;

  const monPrice = mode === "subscribe" ? skill.subscriptionMON ?? skill.priceMON : skill.priceMON;
  const energyPrice = skill.energyCost;
  const creditsPrice = skill.energyCost * 10; // 1 Energy = 10 Credits
  const insufficientEnergy = paymentMode === "energy" && mode === "invoke" && energy < energyPrice;
  const insufficientCredits = paymentMode === "credits" && credits < creditsPrice;

  async function runPaymentFlow() {
    if (!skill || !isConnected) return;

    if (paymentMode === "energy" && insufficientEnergy) {
      onOpenTopUp?.();
      return;
    }

    if (paymentMode === "credits" && insufficientCredits) {
      onOpenTopUpCredits?.();
      return;
    }

    setErr(null);
    setStep("confirm");

    try {
      let h: `0x${string}`;

      if (paymentMode === "credits") {
        // Credits flow: Call backend API
        const res = await fetch("/api/skills/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skillId: skill.id,
            input: skill.inputExample,
          }),
        });

        if (!res.ok) throw new Error("Execution failed");
        const data = await res.json();
        setOutput(data.output || "Execution completed");
        setTxHash("0x0" as `0x${string}`); // Placeholder for Credits flow
      } else {
        // Energy flow: Onchain transaction
        if (mode === "subscribe") {
          h = await subscribe(skill.id, monPrice);
        } else if (mode === "unlock") {
          h = await unlock(skill.id, monPrice);
        } else {
          h = await invoke(skill.id, skill.inputExample);
        }
        setTxHash(h);
      }

      setStep("submitting");

      // Simulate completion
      setTimeout(() => {
        setStep("done");
      }, 2000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      setErr(msg.split("\n")[0]);
      setStep("error");
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div
              className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl glass-strong"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-all"
              >
                ✕
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                {/* Left: Large Card */}
                <div className="flex flex-col items-center justify-center">
                  <motion.div
                    className="relative w-full max-w-[400px]"
                    initial={{ rotateY: 0 }}
                    whileHover={{ rotateY: 5, rotateX: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Large animated card */}
                    <div className="relative aspect-[7/10] rounded-3xl overflow-hidden holo-border">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#13141A] to-[#0A0B0F] p-6">
                        {/* Rarity badge */}
                        <div className="absolute top-4 right-4">
                          <RarityBadge rarity={skill.rarity} size="lg" />
                        </div>

                        {/* Artwork */}
                        <div className="w-full h-48 bg-gradient-to-br from-violet-600/20 via-purple-600/20 to-fuchsia-600/20 rounded-2xl mb-4" />

                        {/* Info */}
                        <h2 className="text-2xl font-bold text-white mb-2 font-display">
                          {skill.title}
                        </h2>

                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500" />
                          <span className="text-sm text-gray-300">@{skill.creatorHandle}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm mb-6">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400">⭐</span>
                            <span className="text-white font-bold">{skill.rating}</span>
                          </div>
                          <div className="text-gray-400">
                            {skill.usageCount.toLocaleString()} runs
                          </div>
                        </div>

                        {/* Attributes */}
                        <div className="space-y-2">
                          <AttributeBar label="Speed" value={8} />
                          <AttributeBar label="Power" value={9} />
                          <AttributeBar label="Cost" value={6} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right: Details */}
                <div className="flex flex-col h-full overflow-y-auto">
                  {/* Header */}
                  <div className="mb-6">
                    <h1 className="text-4xl font-bold text-white mb-2 font-display">
                      {skill.title}
                    </h1>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm text-gray-400">by</span>
                      <span className="text-sm text-violet-400 font-semibold">@{skill.creatorHandle}</span>
                      <span className="px-2 py-1 rounded-md bg-violet-500/10 text-violet-400 text-xs font-bold">
                        {skill.category}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={() => {
                        setMode("invoke");
                        runPaymentFlow();
                      }}
                      disabled={step === "submitting"}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {step === "submitting" ? "Running..." : "Run Now"}
                    </button>
                    <button
                      onClick={() => {
                        setMode("unlock");
                        runPaymentFlow();
                      }}
                      disabled={step === "submitting"}
                      className="flex-1 px-6 py-3 rounded-xl glass text-white font-bold border border-white/20 hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Collect · {skill.priceMON} ETH
                    </button>
                  </div>

                  {/* Payment mode toggle */}
                  <div className="flex gap-2 mb-4 p-1 rounded-lg glass">
                    <button
                      onClick={() => setPaymentMode("credits")}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-all ${
                        paymentMode === "credits"
                          ? "bg-violet-600 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Credits ({creditsPrice})
                    </button>
                    <button
                      onClick={() => setPaymentMode("energy")}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-all ${
                        paymentMode === "energy"
                          ? "bg-violet-600 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Energy ({energyPrice})
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-2 mb-6 border-b border-white/10">
                    {["details", "stats", "history"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 font-semibold text-sm capitalize transition-all ${
                          activeTab === tab
                            ? "text-violet-400 border-b-2 border-violet-400"
                            : "text-gray-400 hover:text-gray-300"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Status Messages */}
                  {step === "confirm" && (
                    <div className="mb-4 p-4 rounded-xl glass border border-violet-500/30">
                      <p className="text-sm text-white">Confirm transaction in your wallet...</p>
                    </div>
                  )}

                  {step === "submitting" && (
                    <div className="mb-4 p-4 rounded-xl glass border border-blue-500/30">
                      <div className="flex items-center gap-3">
                        <div className="loading-spinner" />
                        <div>
                          <p className="text-sm text-white font-semibold">Processing...</p>
                          {txHash && paymentMode === "energy" && (
                            <a
                              href={`https://explorer.monad.xyz/tx/${txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:underline"
                            >
                              View transaction
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === "done" && (
                    <div className="mb-4 p-4 rounded-xl glass border border-green-500/30">
                      <p className="text-sm text-green-400 font-semibold mb-2">✓ Success!</p>
                      {output && (
                        <pre className="text-xs text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {output}
                        </pre>
                      )}
                      <button
                        onClick={() => {
                          setStep("idle");
                          onClose();
                        }}
                        className="mt-3 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all"
                      >
                        Close
                      </button>
                    </div>
                  )}

                  {step === "error" && err && (
                    <div className="mb-4 p-4 rounded-xl glass border border-red-500/30">
                      <p className="text-sm text-red-400 font-semibold mb-2">✕ Error</p>
                      <p className="text-xs text-gray-300">{err}</p>
                      <button
                        onClick={() => setStep("idle")}
                        className="mt-3 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Tab content */}
                  <div className="flex-1 overflow-y-auto">
                    {activeTab === "details" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-bold text-gray-400 mb-2">Description</h3>
                          <p className="text-gray-300 leading-relaxed">
                            {skill.shortDescription}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-gray-400 mb-2">Example Input</h3>
                          <div className="p-4 rounded-lg bg-black/40 border border-white/10">
                            <code className="text-sm text-gray-300 font-mono">
                              {skill.inputExample}
                            </code>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-gray-400 mb-2">Example Output</h3>
                          <div className="p-4 rounded-lg bg-black/40 border border-white/10">
                            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                              {skill.outputPreview}
                            </pre>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-gray-400 mb-2">Privacy Verification</h3>
                          <div className="flex items-center gap-2 p-4 rounded-lg glass border border-green-500/20">
                            <span className="text-green-400 text-xl">✓</span>
                            <span className="text-sm text-green-400 font-semibold">
                              Privacy Compiler Verified
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "stats" && (
                      <div className="space-y-4">
                        <div className="glass p-4 rounded-xl">
                          <div className="text-sm text-gray-400 mb-1">Total Runs</div>
                          <div className="text-2xl font-bold text-white">
                            {skill.usageCount.toLocaleString()}
                          </div>
                        </div>

                        <div className="glass p-4 rounded-xl">
                          <div className="text-sm text-gray-400 mb-1">Average Rating</div>
                          <div className="text-2xl font-bold text-white">
                            {skill.rating} ⭐
                          </div>
                        </div>

                        <div className="glass p-4 rounded-xl">
                          <div className="text-sm text-gray-400 mb-1">Energy Cost</div>
                          <div className="text-2xl font-bold text-white">
                            {skill.energyCost} ⚡
                          </div>
                        </div>

                        <div className="glass p-4 rounded-xl">
                          <div className="text-sm text-gray-400 mb-1">Runtime Model</div>
                          <div className="text-lg font-bold text-white">
                            {skill.runtime.model}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "history" && (
                      <div className="space-y-4">
                        <div className="text-sm text-gray-400">
                          Trade history and price chart coming soon...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
