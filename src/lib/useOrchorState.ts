"use client";

import { useAccount, useBalance } from "wagmi";
import { monadTestnet } from "./chain";
import { useEnergy, useOwnedSet, useSubscribedSet, useMintProgress } from "./useOrchor";
import { useDeck } from "./deckStore";
import { useEffect } from "react";

/**
 * Single hook that aggregates everything UI components need from the chain
 * plus the small UI-local store. When the wallet is disconnected, returns
 * empty sets and zero balances — components keep rendering without crashing.
 */
export function useOrchorState() {
  const { address, isConnected } = useAccount();
  const { data: balData, refetch: refetchBal } = useBalance({
    address,
    chainId: monadTestnet.id,
    query: { enabled: Boolean(address) },
  });

  const { energy, refetch: refetchEnergy } = useEnergy();
  const { owned, refetch: refetchOwned } = useOwnedSet();
  const { subscribed, refetch: refetchSubscribed } = useSubscribedSet();
  const mintProgress = useMintProgress();

  const tick = useDeck((s) => s.refetchTick);
  useEffect(() => {
    if (!isConnected) return;
    refetchBal();
    refetchEnergy();
    refetchOwned();
    refetchSubscribed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, isConnected]);

  const walletBalanceMON = balData ? Number(balData.formatted) : 0;

  return {
    isConnected,
    address,
    walletBalanceMON,
    energy,
    owned,
    subscribed,
    mintProgress,
  };
}
