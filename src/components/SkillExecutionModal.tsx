"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useCreditBalance } from "@/lib/hooks/useCreditBalance";

interface Props {
  open: boolean;
  skillId: number;
  skillTitle: string;
  creditsPerRun: number;
  onClose: () => void;
  onSuccess?: (output: string) => void;
}

export function SkillExecutionModal({
  open,
  skillId,
  skillTitle,
  creditsPerRun,
  onClose,
  onSuccess,
}: Props) {
  const { address } = useAccount();
  const { credits, refetch } = useCreditBalance();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [step, setStep] = useState<"input" | "executing" | "result">("input");

  async function handleExecute() {
    if (!address || !input.trim()) return;

    const userCredits = Number(credits);
    if (userCredits < creditsPerRun) {
      alert(`Insufficient credits. Need ${creditsPerRun}, have ${userCredits}`);
      return;
    }

    setIsExecuting(true);
    setStep("executing");

    try {
      const response = await fetch("/api/skills/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: address?.toLowerCase(),
          skillId,
          input,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOutput(data.output);
        setStep("result");
        refetch(); // Refresh credit balance
        onSuccess?.(data.output);
      } else {
        alert(`Error: ${data.error}`);
        setStep("input");
      }
    } catch (error) {
      alert(`Error: ${error}`);
      setStep("input");
    } finally {
      setIsExecuting(false);
    }
  }

  function handleClose() {
    setInput("");
    setOutput("");
    setStep("input");
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-[min(700px,96vw)] max-h-[90vh] overflow-y-auto rounded-3xl glass-strong">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full glass flex items-center justify-center"
        >
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path d="M6 6 L18 18 M18 6 L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="p-6">
          {step === "input" && (
            <>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-mutedHi">
                  Execute Skill
                </div>
                <h2 className="mt-1 font-display text-2xl font-bold">
                  {skillTitle}
                </h2>
                <div className="mt-2 flex items-center gap-3">
                  <div className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30">
                    <span className="text-[11px] text-cyan-300 font-mono">
                      {creditsPerRun} credits
                    </span>
                  </div>
                  <div className="text-[11px] text-mutedHi">
                    ≈ ${(creditsPerRun * 0.01).toFixed(2)} USD
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-[11px] uppercase tracking-wider text-mutedHi mb-2">
                  Your Input
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter your request here..."
                  className="input w-full min-h-[120px] resize-y"
                />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 btn-ghost h-11 rounded-xl text-[13px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecute}
                  disabled={!input.trim() || isExecuting}
                  className="flex-1 btn-neon h-11 rounded-xl text-[13px] font-semibold disabled:opacity-50"
                >
                  Execute ({creditsPerRun} credits)
                </button>
              </div>
            </>
          )}

          {step === "executing" && (
            <div className="py-12 text-center space-y-4">
              <div className="text-4xl animate-bounce">⚡</div>
              <div className="font-semibold text-white">Executing skill...</div>
              <div className="text-[12px] text-mutedHi">
                Processing your request with AI
              </div>
            </div>
          )}

          {step === "result" && (
            <>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-mutedHi">
                  Execution Result
                </div>
                <h2 className="mt-1 font-display text-2xl font-bold">
                  {skillTitle}
                </h2>
              </div>

              <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4">
                <div className="text-[11px] font-semibold text-emerald-300 mb-2">
                  ✓ Execution Successful
                </div>
                <div className="text-[10px] text-mutedHi">
                  {creditsPerRun} credits deducted from your balance
                </div>
              </div>

              <div className="mt-4">
                <div className="text-[11px] uppercase tracking-wider text-mutedHi mb-2">
                  Output
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 max-h-[400px] overflow-y-auto">
                  <pre className="text-[12px] text-white whitespace-pre-wrap font-sans">
                    {output}
                  </pre>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => {
                    setInput("");
                    setOutput("");
                    setStep("input");
                  }}
                  className="flex-1 btn-ghost h-11 rounded-xl text-[13px]"
                >
                  Run Again
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 btn-neon h-11 rounded-xl text-[13px] font-semibold"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
