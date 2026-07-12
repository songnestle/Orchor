"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export function useCreditBalance() {
  const { address, isConnected } = useAccount();
  const [credits, setCredits] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchBalance() {
    if (!address) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/credits/balance?address=${address.toLowerCase()}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setCredits(0n);
      } else if (data.credits) {
        setCredits(BigInt(data.credits));
      }
    } catch (error) {
      console.error("Error fetching credit balance:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch balance");
      setCredits(0n);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      fetchBalance();
    } else {
      setCredits(0n);
      setError(null);
    }
  }, [isConnected, address]);

  // Refresh balance when any part of the app signals a credit change
  // (e.g. after a demo top-up or a skill run).
  useEffect(() => {
    const handler = () => {
      if (isConnected && address) fetchBalance();
    };
    window.addEventListener("orchor:credits-updated", handler);
    return () => window.removeEventListener("orchor:credits-updated", handler);
  }, [isConnected, address]);

  return {
    credits,
    creditsFormatted: Number(credits).toLocaleString(),
    usdValue: (Number(credits) * 0.01).toFixed(2),
    isLoading,
    error,
    refetch: fetchBalance,
  };
}
