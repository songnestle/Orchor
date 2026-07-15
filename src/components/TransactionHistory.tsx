"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

interface Transaction {
  id: string;
  type: 'deposit' | 'skill_run' | 'creator_revenue' | 'platform_fee' | 'runtime_cost' | 'withdrawal';
  amount: string;
  amountFormatted: string;
  balanceAfter: string;
  balanceAfterFormatted: string;
  metadata: any;
  timestamp: string;
  isCredit: boolean;
}

export function TransactionHistory() {
  const { address, isConnected } = useAccount();
  const { t } = useI18n();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'deposits' | 'runs' | 'withdrawals'>('all');

  useEffect(() => {
    if (isConnected && address) {
      fetchTransactions();
    }
  }, [isConnected, address]);

  async function fetchTransactions() {
    if (!address) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/credits/transactions?address=${address.toLowerCase()}&limit=50`);
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <div className="text-[14px] text-mutedHi">{t("creator.connectWallet")}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="text-[14px] text-mutedHi">{t("tx.loading")}</div>
      </div>
    );
  }

  const filtered = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'deposits') return tx.type === 'deposit';
    if (filter === 'runs') return tx.type === 'skill_run';
    if (filter === 'withdrawals') return tx.type === 'withdrawal';
    return true;
  });

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">{t("tx.title")}</h1>
          <p className="text-[13px] text-mutedHi mt-1">
            {t("tx.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'deposits', 'runs', 'withdrawals'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition ${
                filter === f
                  ? 'bg-accent text-white'
                  : 'bg-white/[0.05] text-mutedHi hover:bg-white/[0.08]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-[13px] text-mutedHi">
            {t("tx.noTransactions")}
          </div>
        ) : (
          filtered.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))
        )}
      </div>
    </div>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const typeInfo = getTypeInfo(tx.type);

  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition"
    >
      <div className="flex items-center gap-4">
        <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${typeInfo.bgColor}`}>
          <span className="text-lg">{typeInfo.icon}</span>
        </div>

        <div>
          <div className="font-medium text-white text-[13px]">{typeInfo.label}</div>
          <div className="text-[11px] text-mutedHi">
            {new Date(tx.timestamp).toLocaleString()}
          </div>
          {tx.metadata?.skillId !== undefined && (
            <div className="text-[10px] text-muted mt-0.5">
              Skill #{tx.metadata.skillId}
            </div>
          )}
        </div>
      </div>

      <div className="text-right">
        <div
          className={`font-mono text-[14px] font-semibold ${
            tx.isCredit ? 'text-[#7a9450]' : 'text-[#d98a7d]'
          }`}
        >
          {tx.isCredit ? '+' : '-'}{Math.abs(Number(tx.amount)).toLocaleString()} credits
        </div>
        <div className="text-[11px] text-mutedHi mt-0.5">
          Balance: {tx.balanceAfterFormatted}
        </div>
      </div>
    </motion.div>
  );
}

function getTypeInfo(type: Transaction['type']) {
  switch (type) {
    case 'deposit':
      return { icon: '💳', label: 'Deposit', bgColor: 'bg-[#7a9450]/10' };
    case 'skill_run':
      return { icon: '⚡', label: 'Skill Execution', bgColor: 'bg-[#7a9450]/10' };
    case 'creator_revenue':
      return { icon: '💰', label: 'Creator Revenue', bgColor: 'bg-[#d6a44c]/10' };
    case 'platform_fee':
      return { icon: '🏦', label: 'Platform Fee', bgColor: 'bg-[#d6a44c]/10' };
    case 'runtime_cost':
      return { icon: '⚙️', label: 'Runtime Cost', bgColor: 'bg-[#5a869c]/10' };
    case 'withdrawal':
      return { icon: '📤', label: 'Withdrawal', bgColor: 'bg-[#bf5b4b]/10' };
    default:
      return { icon: '📝', label: 'Transaction', bgColor: 'bg-white/5' };
  }
}
