"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";

interface CreatorStats {
  address: string;
  summary: {
    totalSkills: number;
    totalRuns: number;
    grossRevenue: string;
    grossRevenueFormatted: string;
    platformFee: string;
    platformFeeFormatted: string;
    netRevenue: string;
    netRevenueFormatted: string;
    withdrawableBalance: string;
    withdrawableBalanceFormatted: string;
    usdValue: string;
  };
  revenueBySkill: Array<{
    skillId: number;
    runs: number;
    revenue: string;
    revenueFormatted: string;
    withdrawable: string;
  }>;
  recentTransactions: Array<{
    id: string;
    skillId: number;
    credits: string;
    creatorEarned: string;
    completedAt: Date | null;
  }>;
  settlementChains: Array<{
    chain: string;
    name: string;
    available: boolean;
    minWithdrawal: number;
    estimatedFee: number;
    recommendedFor: string;
  }>;
}

export function CreatorDashboard() {
  const { address, isConnected } = useAccount();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      fetchStats();
    }
  }, [isConnected, address]);

  async function fetchStats() {
    if (!address) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/creator/stats?address=${address}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching creator stats:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <div className="text-[14px] text-mutedHi">Connect your wallet to view creator dashboard</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="text-[14px] text-mutedHi">Loading creator stats...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <div className="text-[14px] text-mutedHi">No creator data found</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold">Creator Dashboard</h1>
        <p className="text-[13px] text-mutedHi mt-1">
          Track your skill performance and earnings
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Skills"
          value={stats.summary.totalSkills.toString()}
          icon="📦"
        />
        <StatCard
          label="Total Runs"
          value={stats.summary.totalRuns.toLocaleString()}
          icon="⚡"
        />
        <StatCard
          label="Gross Revenue"
          value={`${stats.summary.grossRevenueFormatted} credits`}
          subtitle={`≈ $${(Number(stats.summary.grossRevenue) * 0.01).toFixed(2)}`}
          icon="💰"
        />
        <StatCard
          label="Withdrawable"
          value={`${stats.summary.withdrawableBalanceFormatted} credits`}
          subtitle={`≈ $${stats.summary.usdValue}`}
          icon="💳"
          highlight
        />
      </div>

      {/* Revenue Breakdown */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-[11px] uppercase tracking-wider text-mutedHi mb-4">
          Revenue Breakdown
        </h2>
        <div className="space-y-3">
          <RevenueRow
            label="Gross Revenue"
            value={stats.summary.grossRevenueFormatted}
            percentage={100}
          />
          <RevenueRow
            label="Creator Share (70%)"
            value={stats.summary.netRevenueFormatted}
            percentage={70}
            highlight
          />
          <RevenueRow
            label="Platform Fee (20%)"
            value={stats.summary.platformFeeFormatted}
            percentage={20}
          />
          <RevenueRow
            label="Runtime Cost (10%)"
            value={(Number(stats.summary.grossRevenue) * 0.1).toLocaleString()}
            percentage={10}
          />
        </div>
      </div>

      {/* Withdraw Section */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[11px] uppercase tracking-wider text-mutedHi">
              Withdrawable Balance
            </h2>
            <div className="mt-2 font-display text-3xl font-bold text-gradient">
              {stats.summary.withdrawableBalanceFormatted} credits
            </div>
            <div className="text-[12px] text-mutedHi">
              ≈ ${stats.summary.usdValue} USD
            </div>
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={Number(stats.summary.withdrawableBalance) < 100}
            className="btn-neon h-11 px-6 rounded-xl text-[13px] font-semibold disabled:opacity-50"
          >
            Withdraw
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {stats.settlementChains.map((chain) => (
            <div
              key={chain.chain}
              className="rounded-lg border border-white/10 bg-white/[0.02] p-3"
            >
              <div className="font-semibold text-white text-[13px]">{chain.name}</div>
              <div className="text-[11px] text-mutedHi mt-1">
                {chain.recommendedFor}
              </div>
              <div className="mt-2 text-[10px] text-muted">
                Fee: ~{chain.estimatedFee} credits
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Skill */}
      {stats.revenueBySkill.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-[11px] uppercase tracking-wider text-mutedHi mb-4">
            Revenue by Skill
          </h2>
          <div className="space-y-2">
            {stats.revenueBySkill.map((skill) => (
              <div
                key={skill.skillId}
                className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.01]"
              >
                <div>
                  <div className="font-mono text-[13px] text-white">
                    Skill #{skill.skillId}
                  </div>
                  <div className="text-[11px] text-mutedHi">
                    {skill.runs} runs
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[13px] text-amber-200">
                    {skill.revenueFormatted} credits
                  </div>
                  <div className="text-[11px] text-muted">
                    ≈ ${(Number(skill.revenue) * 0.01).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {stats.recentTransactions.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-[11px] uppercase tracking-wider text-mutedHi mb-4">
            Recent Transactions
          </h2>
          <div className="space-y-2">
            {stats.recentTransactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.01]"
              >
                <div className="flex items-center gap-3">
                  <div className="text-[11px] font-mono text-mutedHi">
                    Skill #{tx.skillId}
                  </div>
                  <div className="text-[11px] text-muted">
                    {tx.completedAt
                      ? new Date(tx.completedAt).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
                <div className="text-[12px] font-mono text-emerald-300">
                  +{Number(tx.creatorEarned).toLocaleString()} credits
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal
          stats={stats}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={fetchStats}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-accent/30 bg-accent/5"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wider text-mutedHi">
          {label}
        </div>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="font-display text-2xl font-bold text-white">{value}</div>
      {subtitle && (
        <div className="text-[11px] text-mutedHi mt-1">{subtitle}</div>
      )}
    </motion.div>
  );
}

function RevenueRow({
  label,
  value,
  percentage,
  highlight,
}: {
  label: string;
  value: string;
  percentage: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <div className="text-[12px] text-mutedHi w-32">{label}</div>
        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full ${
              highlight ? "bg-gradient-to-r from-accent to-accent2" : "bg-white/20"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className={`font-mono text-[13px] ${highlight ? "text-amber-200" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

function WithdrawModal({
  stats,
  onClose,
  onSuccess,
}: {
  stats: CreatorStats;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedChain, setSelectedChain] = useState("tron");
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleWithdraw() {
    if (!amount || !destination) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/creator/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorAddress: stats.address,
          chain: selectedChain,
          asset: "USDT",
          credits: amount,
          destinationAddress: destination,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Withdrawal successful!");
        onSuccess();
        onClose();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-[min(500px,96vw)] rounded-3xl glass-strong p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full glass flex items-center justify-center"
        >
          ×
        </button>

        <h2 className="font-display text-xl font-bold mb-4">Withdraw Earnings</h2>

        <div className="space-y-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-mutedHi mb-2">
              Select Chain
            </div>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="input w-full"
            >
              {stats.settlementChains.map((chain) => (
                <option key={chain.chain} value={chain.chain}>
                  {chain.name} - {chain.recommendedFor}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-mutedHi mb-2">
              Amount (Credits)
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              className="input w-full font-mono"
            />
            <div className="text-[10px] text-muted mt-1">
              Available: {stats.summary.withdrawableBalanceFormatted} credits
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-mutedHi mb-2">
              Destination Address
            </div>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="TYour...Address or 0x..."
              className="input w-full font-mono text-[11px]"
            />
          </div>

          <button
            onClick={handleWithdraw}
            disabled={!amount || !destination || isProcessing}
            className="w-full btn-neon h-11 rounded-xl text-[13px] font-semibold disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Withdraw"}
          </button>
        </div>
      </div>
    </div>
  );
}
