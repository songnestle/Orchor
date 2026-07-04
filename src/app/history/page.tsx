"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface HistoryEntry {
  id: string;
  timestamp: number;
  skillName: string;
  action: "run" | "unlock" | "subscribe";
  status: "success" | "failed";
  cost: number;
  output?: string;
  txHash?: string;
}

export default function HistoryPage() {
  // Mock history data
  const history: HistoryEntry[] = [
    {
      id: "1",
      timestamp: Date.now() - 3600000,
      skillName: "Web3 Contract Analyzer",
      action: "run",
      status: "success",
      cost: 5,
      output: "Contract verified: 0 vulnerabilities found",
      txHash: "0x1234...5678",
    },
    {
      id: "2",
      timestamp: Date.now() - 7200000,
      skillName: "Token Price Oracle",
      action: "run",
      status: "success",
      cost: 3,
      output: "ETH: $3,245.67 | BTC: $67,890.12",
    },
    {
      id: "3",
      timestamp: Date.now() - 86400000,
      skillName: "NFT Metadata Generator",
      action: "unlock",
      status: "success",
      cost: 0.05,
      txHash: "0xabcd...ef01",
    },
    {
      id: "4",
      timestamp: Date.now() - 172800000,
      skillName: "DeFi Yield Optimizer",
      action: "subscribe",
      status: "success",
      cost: 0.1,
      txHash: "0x9876...5432",
    },
    {
      id: "5",
      timestamp: Date.now() - 259200000,
      skillName: "Gas Fee Estimator",
      action: "run",
      status: "failed",
      cost: 2,
    },
  ];

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-bg/80 border-b border-white/5 py-4">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold gradient-text font-display">
            📜 History
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Your skill execution history
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {history.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-strong rounded-xl p-6 hover:bg-white/5 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  entry.status === "success" ? "bg-green-500/20" : "bg-red-500/20"
                }`}>
                  {entry.action === "run" ? "⚡" : entry.action === "unlock" ? "🔓" : "📅"}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-white">{entry.skillName}</h3>
                      <p className="text-sm text-gray-400 capitalize">
                        {entry.action} • {formatTime(entry.timestamp)}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      entry.status === "success"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {entry.status}
                    </div>
                  </div>

                  {entry.output && (
                    <div className="mb-3 p-3 rounded-lg bg-black/30">
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                        {entry.output}
                      </pre>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-violet-400 font-semibold">
                      {entry.action === "run" ? `${entry.cost} Energy` : `${entry.cost} ETH`}
                    </span>
                    {entry.txHash && (
                      <a
                        href={`https://explorer.monad.xyz/tx/${entry.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        View TX →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
