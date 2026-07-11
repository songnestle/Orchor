"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useAccount } from "wagmi";
import { paymentManager } from "@/lib/payment/payment-manager";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = "select-chain" | "enter-amount" | "show-address" | "waiting" | "success";
type Chain = "tron" | "evm-monad" | "evm-base" | "evm-ethereum";

export function TopUpCreditsModal({ open, onClose }: Props) {
  const { address } = useAccount();
  const [step, setStep] = useState<Step>("select-chain");
  const [selectedChain, setSelectedChain] = useState<Chain>("tron");
  const [selectedAsset, setSelectedAsset] = useState("USDT");
  const [amount, setAmount] = useState("10");
  const [depositAddress, setDepositAddress] = useState<string>("");
  const [memo, setMemo] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const chains = [
    {
      id: "tron" as Chain,
      name: "TRON",
      icon: "🟢",
      fee: "$1-3",
      time: "1-2 min",
      recommended: true,
      description: "Lowest fees, fastest confirmation",
    },
    {
      id: "evm-monad" as Chain,
      name: "Monad",
      icon: "🟣",
      fee: "$0.10",
      time: "2-5 min",
      recommended: false,
      description: "Native chain, very low fees",
    },
    {
      id: "evm-base" as Chain,
      name: "Base",
      icon: "🔵",
      fee: "$0.50",
      time: "3-5 min",
      recommended: false,
      description: "L2, moderate fees",
    },
    {
      id: "evm-ethereum" as Chain,
      name: "Ethereum",
      icon: "⬛",
      fee: "$5-20",
      time: "5-15 min",
      recommended: false,
      description: "Mainnet, high fees",
    },
  ];

  async function handleGenerateAddress() {
    if (!address) return;

    try {
      const response = await fetch("/api/credits/deposit/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: address,
          chain: selectedChain,
          asset: selectedAsset,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDepositAddress(data.depositAddress);
        setMemo(data.memo);
        setQrCode(data.qrCode);
        setStep("show-address");
      }
    } catch (error) {
      console.error("Error generating deposit address:", error);
    }
  }

  // Demo / instant top-up: credits the account directly (no on-chain transfer).
  async function handleDemoTopUp() {
    if (!address || isDemoLoading) return;
    setIsDemoLoading(true);
    try {
      const response = await fetch("/api/credits/deposit/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: address,
          usd: parseFloat(amount),
          chain: selectedChain,
          asset: selectedAsset,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setStep("success");
        // Notify the app so balances refresh.
        window.dispatchEvent(new Event("orchor:credits-updated"));
      } else {
        alert(data.error || "Top-up failed");
      }
    } catch (error) {
      console.error("Demo top-up error:", error);
      alert("Top-up failed");
    } finally {
      setIsDemoLoading(false);
    }
  }

  function reset() {
    setStep("select-chain");
    setDepositAddress("");
    setMemo("");
    setQrCode("");
  }

  const expectedCredits = Math.floor(parseFloat(amount || "0") * 100);

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
            className="relative w-[min(600px,96vw)] max-h-[90vh] overflow-y-auto rounded-3xl glass-strong scrollbar-thin"
          >
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-44 w-[70%] blur-3xl opacity-60 pointer-events-none bg-gradient-to-r from-cyan-500 to-violet-500" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full glass flex items-center justify-center"
            >
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path d="M6 6 L18 18 M18 6 L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <div className="p-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-mutedHi">
                  Top Up Credits
                </div>
                <h2 className="mt-1 font-display text-2xl font-bold">
                  Add <span className="text-gradient">Orchor Credits</span>
                </h2>
                <p className="mt-1 text-[12px] text-mutedHi">
                  Deposit stablecoins from multiple chains. 1 USD = 100 credits.
                </p>
              </div>

              <div className="mt-6">
                {step === "select-chain" && (
                  <div className="space-y-4">
                    <div className="text-[11px] uppercase tracking-wider text-mutedHi">
                      Select Network
                    </div>
                    <div className="space-y-2">
                      {chains.map((chain) => (
                        <button
                          key={chain.id}
                          onClick={() => {
                            setSelectedChain(chain.id);
                            setStep("enter-amount");
                          }}
                          className={`w-full text-left rounded-xl border p-4 transition ${
                            selectedChain === chain.id
                              ? "border-accent bg-accent/5"
                              : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{chain.icon}</span>
                              <div>
                                <div className="font-semibold text-white flex items-center gap-2">
                                  {chain.name}
                                  {chain.recommended && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                                      Recommended
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-mutedHi mt-0.5">
                                  {chain.description}
                                </div>
                              </div>
                            </div>
                            <div className="text-right text-[11px]">
                              <div className="text-muted">Fee: {chain.fee}</div>
                              <div className="text-muted">Time: {chain.time}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === "enter-amount" && (
                  <div className="space-y-4">
                    <button
                      onClick={() => setStep("select-chain")}
                      className="text-[11px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1"
                    >
                      ← Back to chain selection
                    </button>

                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-mutedHi mb-2">
                        Amount (USDT)
                      </div>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="10"
                        className="input w-full text-2xl font-mono"
                      />
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-muted">You will receive</span>
                        <span className="font-mono text-amber-200 text-[14px]">
                          ~{expectedCredits.toLocaleString()} credits
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                      <div className="text-[10px] uppercase tracking-wider text-mutedHi mb-2">
                        Quick Amounts
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {["10", "25", "50", "100"].map((a) => (
                          <button
                            key={a}
                            onClick={() => setAmount(a)}
                            className="btn-ghost h-9 rounded-lg text-[12px] font-mono"
                          >
                            ${a}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateAddress}
                      disabled={!address || parseFloat(amount) <= 0}
                      className="w-full btn-neon h-11 rounded-xl text-[13px] font-semibold"
                    >
                      Generate Deposit Address
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-[10px] uppercase tracking-wider text-muted">or</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    <button
                      onClick={handleDemoTopUp}
                      disabled={!address || parseFloat(amount) <= 0 || isDemoLoading}
                      className="w-full h-11 rounded-xl text-[13px] font-semibold border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition disabled:opacity-50"
                    >
                      {isDemoLoading ? "Processing…" : `⚡ Instant Top-Up (Demo) · ${expectedCredits.toLocaleString()} credits`}
                    </button>
                    <p className="text-[10px] text-muted text-center">
                      Demo mode credits your account instantly without an on-chain transfer.
                    </p>
                  </div>
                )}

                {step === "show-address" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4">
                      <div className="text-[11px] font-semibold text-emerald-300 mb-2">
                        ✓ Deposit Address Generated
                      </div>
                      <div className="text-[10px] text-mutedHi">
                        Send exactly {amount} {selectedAsset} to the address below
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-mutedHi mb-2">
                        Deposit Address
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-[11px] break-all text-white">
                        {depositAddress}
                      </div>
                    </div>

                    {memo && (
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-mutedHi mb-2">
                          Memo / Tag (Required)
                        </div>
                        <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-3 font-mono text-[11px] text-amber-200">
                          {memo}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          reset();
                          onClose();
                        }}
                        className="flex-1 btn-ghost h-10 rounded-xl text-[12px]"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => setStep("waiting")}
                        className="flex-1 btn-neon h-10 rounded-xl text-[12px] font-semibold"
                      >
                        I've Sent the Payment
                      </button>
                    </div>

                    <div className="text-[10px] text-muted text-center">
                      Credits will be added automatically after confirmation
                    </div>
                  </div>
                )}

                {step === "waiting" && (
                  <div className="space-y-4 text-center py-8">
                    <div className="text-4xl">⏳</div>
                    <div className="font-semibold text-white">
                      Waiting for confirmation...
                    </div>
                    <div className="text-[12px] text-mutedHi">
                      This usually takes 1-5 minutes depending on the network
                    </div>
                    <button
                      onClick={() => {
                        reset();
                        onClose();
                      }}
                      className="btn-ghost h-10 px-4 rounded-xl text-[12px]"
                    >
                      Close (Check Back Later)
                    </button>
                  </div>
                )}

                {step === "success" && (
                  <div className="space-y-4 text-center py-8">
                    <div className="text-5xl">✅</div>
                    <div className="font-semibold text-white text-lg">
                      Credited {expectedCredits.toLocaleString()} credits
                    </div>
                    <div className="text-[12px] text-mutedHi">
                      Your balance has been updated. You can now run skills.
                    </div>
                    <button
                      onClick={() => {
                        reset();
                        onClose();
                      }}
                      className="btn-neon h-10 px-6 rounded-xl text-[13px] font-semibold"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
