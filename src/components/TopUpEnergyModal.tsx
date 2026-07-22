"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { MON_TO_ENERGY } from "@/lib/deckStore";
import { useOrchorState } from "@/lib/useOrchorState";
import { useOrchorWrites } from "@/lib/useOrchor";
import { useDeck } from "@/lib/deckStore";
import { explorerTxUrl } from "@/lib/chain";
import { EnergyBolt, InjectiveIcon } from "./TopNav";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = "idle" | "confirm" | "submitting" | "done" | "error";

const PRESETS = [
  { mon: 1, label: "Starter" },
  { mon: 5, label: "Builder" },
  { mon: 20, label: "Power" },
  { mon: 100, label: "Whale" },
];

export function TopUpEnergyModal({ open, onClose }: Props) {
  const { isConnected } = useAccount();
  const { walletBalanceMON: balance, energy } = useOrchorState();
  const { topUp, isConfirming, isConfirmed, hash } = useOrchorWrites();
  const bumpRefetch = useDeck((s) => s.bumpRefetch);

  const [selected, setSelected] = useState(5);
  const [step, setStep] = useState<Step>("idle");
  const [err, setErr] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  useEffect(() => {
    if (open) {
      setStep("idle");
      setSelected(5);
      setErr(null);
      setTxHash(null);
    }
  }, [open]);

  useEffect(() => {
    if (isConfirmed && step === "submitting") {
      setStep("done");
      bumpRefetch();
    }
  }, [isConfirmed, step, bumpRefetch]);

  async function run() {
    if (selected > balance) return;
    setErr(null);
    setStep("confirm");
    try {
      const h = await topUp(selected);
      setTxHash(h);
      setStep("submitting");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      setErr(msg.split("\n")[0]);
      setStep("error");
    }
  }

  const energyAdded = selected * MON_TO_ENERGY;
  const insufficient = selected > balance;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
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
            className="relative w-[min(520px,96vw)] rounded-3xl glass-strong overflow-hidden"
          >
            <div
              className="absolute -top-24 left-1/2 -translate-x-1/2 h-44 w-[80%] blur-3xl opacity-60 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, rgba(214,164,76,0.5), rgba(122,148,80,0.5))",
              }}
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

            <div className="relative p-6">
              <div className="flex items-center gap-2">
                <EnergyBolt size={18} />
                <h2 className="font-display text-2xl font-bold">Top up Energy</h2>
              </div>
              <p className="mt-1 text-[12px] text-mutedHi">
                Convert INJ into ⚡ Energy. 1 INJ = {MON_TO_ENERGY} ⚡. Used to
                invoke any hosted skill on Orchor.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl p-3 border border-white/5 bg-white/[0.02]">
                  <div className="text-[10px] uppercase tracking-wider text-muted">
                    Wallet
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <InjectiveIcon size={14} />
                    <span className="font-mono text-lg tabular text-white">
                      {balance.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-mutedHi">INJ</span>
                  </div>
                </div>
                <div className="rounded-xl p-3 border border-white/5 bg-white/[0.02]">
                  <div className="text-[10px] uppercase tracking-wider text-muted">
                    Energy
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <EnergyBolt size={14} />
                    <span className="font-mono text-lg tabular text-amber-200">
                      {energy}
                    </span>
                    <span className="text-[10px] text-mutedHi">⚡</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-[10px] uppercase tracking-wider text-mutedHi mb-2">
                  Choose amount
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {PRESETS.map((p) => {
                    const active = selected === p.mon;
                    return (
                      <button
                        key={p.mon}
                        onClick={() => setSelected(p.mon)}
                        className={`relative rounded-xl px-2 py-3 transition border ${
                          active
                            ? "border-white/20 bg-gradient-to-b from-accent/15 to-accent2/10"
                            : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="text-[9px] uppercase tracking-wider text-mutedHi">
                          {p.label}
                        </div>
                        <div className="mt-1 font-display text-base font-bold text-white">
                          {p.mon} INJ
                        </div>
                        <div className="text-[10px] font-mono text-amber-200">
                          {p.mon * MON_TO_ENERGY} ⚡
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 rounded-xl p-3 border border-white/10 bg-white/[0.03]">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-mutedHi">You pay</span>
                  <span className="font-mono text-white tabular">
                    {selected.toFixed(2)} INJ
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px] mt-1">
                  <span className="text-mutedHi">You receive</span>
                  <span className="font-mono text-amber-200 tabular">
                    +{energyAdded} ⚡
                  </span>
                </div>
                <div className="my-2 h-px bg-white/5" />
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-white">New Energy balance</span>
                  <span className="font-mono text-amber-200 tabular">
                    {energy + (step === "done" ? 0 : energyAdded)} ⚡
                  </span>
                </div>
              </div>

              {step !== "idle" && step !== "error" && (
                <div className="mt-4 space-y-1.5">
                  {[
                    { key: "confirm", label: "Wallet confirmation" },
                    { key: "submitting", label: isConfirming ? "Confirming on Injective…" : "Submit to Injective" },
                    { key: "done", label: "Energy credited" },
                  ].map((it, i, arr) => {
                    const idx = arr.findIndex((x) => x.key === step);
                    const done = idx > i || step === "done";
                    const active = idx === i;
                    return (
                      <div key={it.key} className="flex items-center gap-2 text-[11px]">
                        <span
                          className={`h-3 w-3 rounded-full flex items-center justify-center text-[9px] ${
                            done
                              ? "bg-emerald-400 text-black"
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
                          <span className="text-emerald-400 ml-auto font-mono">ok</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {step === "done" && txHash && (
                <div className="mt-3 rounded-lg p-2 bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300">
                  ✓ {energyAdded} ⚡ credited ·{" "}
                  <a
                    href={explorerTxUrl(txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-emerald-200"
                  >
                    view tx
                  </a>
                </div>
              )}

              {step === "error" && err && (
                <div className="mt-3 rounded-lg p-2 bg-red-500/10 border border-red-500/30 text-[11px] text-red-300">
                  ✗ {err}
                </div>
              )}

              <div className="mt-5 flex items-center gap-2">
                {step === "done" ? (
                  <button
                    onClick={onClose}
                    className="flex-1 btn-neon h-11 rounded-xl text-[13px] font-semibold"
                  >
                    Done · keep collecting
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onClose}
                      className="btn-ghost h-11 px-4 rounded-xl text-[12px]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={run}
                      disabled={
                        !isConnected ||
                        step === "confirm" ||
                        step === "submitting" ||
                        insufficient
                      }
                      className="flex-1 btn-neon h-11 rounded-xl text-[13px] font-semibold"
                    >
                      {!isConnected
                        ? "Connect wallet"
                        : insufficient
                        ? "Not enough INJ"
                        : step === "idle" || step === "error"
                        ? `Top up ${selected} INJ → ${energyAdded} ⚡`
                        : step === "confirm"
                        ? "Awaiting wallet…"
                        : "Submitting…"}
                    </button>
                  </>
                )}
              </div>

              <div className="mt-3 text-[10px] text-muted text-center">
                Conversion settled on Injective Testnet · INJ sent to platform treasury,
                used to cover model token cost + creator settlement
              </div>
              <div className="mt-1.5 text-[10px] text-center">
                <a
                  href="https://testnet.faucet.injective.network/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#b6c98f] underline hover:text-white transition"
                >
                  Need testnet INJ? Get some from the faucet →
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
