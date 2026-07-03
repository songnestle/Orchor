"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export function useCreditBalance() {
  const { address, isConnected } = useAccount();
  const [credits, setCredits] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchBalance() {
    if (!address) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/credits/balance?address=${address}`);
      const data = await response.json();

      if (data.credits) {
        setCredits(BigInt(data.credits));
      }
    } catch (error) {
      console.error("Error fetching credit balance:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      fetchBalance();
    } else {
      setCredits(0n);
    }
  }, [isConnected, address]);

  return {
    credits,
    creditsFormatted: Number(credits).toLocaleString(),
    usdValue: (Number(credits) * 0.01).toFixed(2),
    isLoading,
    refetch: fetchBalance,
  };
}
