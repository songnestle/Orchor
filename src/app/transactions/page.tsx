"use client";

import { TransactionHistory } from "@/components/TransactionHistory";

export default function TransactionsPage() {
  return (
    <div className="relative min-h-screen bg-bg text-white">
      <TransactionHistory />
    </div>
  );
}
