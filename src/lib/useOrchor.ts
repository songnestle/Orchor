"use client";

import { useCallback, useMemo } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useReadContracts,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { keccak256, parseEther, toHex } from "viem";
import { ORCHOR_ABI, ORCHOR_CORE_ADDRESS, activeChain } from "./chain";

const orchor = {
  abi: ORCHOR_ABI,
  address: ORCHOR_CORE_ADDRESS,
  chainId: activeChain.id,
} as const;

/** Returns the live set of all skillIds onchain: [0, nextSkillId). */
function useAllSkillIds(): number[] {
  const { data } = useReadContract({
    ...orchor,
    functionName: "nextSkillId",
  });
  return useMemo(() => {
    const n = data ? Number(data) : 0;
    return Array.from({ length: n }, (_, i) => i);
  }, [data]);
}

/** Live Energy balance for the connected user. */
export function useEnergy() {
  const { address } = useAccount();
  const { data, refetch, isLoading } = useReadContract({
    ...orchor,
    functionName: "energyOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });
  return {
    energy: data ? Number(data) : 0,
    refetch,
    isLoading,
  };
}

/** Returns set of skillIds owned by the connected user (via batched reads). */
export function useOwnedSet() {
  const { address } = useAccount();
  const ids = useAllSkillIds();
  const { data, refetch, isLoading } = useReadContracts({
    contracts: address
      ? ids.map((id) => ({
          ...orchor,
          functionName: "owned" as const,
          args: [address, BigInt(id)] as const,
        }))
      : [],
    query: { enabled: Boolean(address) && ids.length > 0 },
  });

  const owned = new Set<number>();
  data?.forEach((res, i) => {
    if (res.status === "success" && res.result === true) owned.add(ids[i]);
  });
  return { owned, refetch, isLoading };
}

/** Returns set of skillIds the user has an active subscription to. */
export function useSubscribedSet() {
  const { address } = useAccount();
  const ids = useAllSkillIds();
  const { data, refetch, isLoading } = useReadContracts({
    contracts: address
      ? ids.map((id) => ({
          ...orchor,
          functionName: "subscriptionExpiry" as const,
          args: [address, BigInt(id)] as const,
        }))
      : [],
    query: { enabled: Boolean(address) && ids.length > 0 },
  });

  const now = BigInt(Math.floor(Date.now() / 1000));
  const subscribed = new Set<number>();
  data?.forEach((res, i) => {
    if (res.status === "success" && (res.result as bigint) >= now) {
      subscribed.add(ids[i]);
    }
  });
  return { subscribed, refetch, isLoading };
}

/** Mythic mint progress. Returns { current, cap } per skillId.
 *  Reads getSkill for every onchain skill and filters for cap > 0. */
export function useMintProgress() {
  const ids = useAllSkillIds();
  const { data } = useReadContracts({
    contracts: ids.map((id) => ({
      ...orchor,
      functionName: "getSkill" as const,
      args: [BigInt(id)] as const,
    })),
    query: { enabled: ids.length > 0 },
  });

  const out: Record<number, { current: number; cap: number }> = {};
  data?.forEach((res, i) => {
    if (res.status === "success") {
      const s = res.result as {
        mintCap: number | bigint;
        minted: number | bigint;
      };
      const cap = Number(s.mintCap);
      if (cap > 0) {
        out[ids[i]] = { current: Number(s.minted), cap };
      }
    }
  });
  return out;
}

/** Write-side helpers. Returns sendable functions and the latest tx state. */
export function useOrchorWrites() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  /** Ensure the wallet is on the active chain (Injective Testnet) before any write. */
  const ensureChain = useCallback(async () => {
    if (chainId === activeChain.id) return;
    try {
      await switchChainAsync({ chainId: activeChain.id });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(
        msg.toLowerCase().includes("user rejected")
          ? `Please switch to ${activeChain.name} to continue`
          : `Wallet is not on ${activeChain.name} — switch network and try again`
      );
    }
  }, [chainId, switchChainAsync]);

  const topUp = useCallback(
    async (mon: number) => {
      await ensureChain();
      return writeContractAsync({
        ...orchor,
        functionName: "topUpEnergy",
        value: parseEther(mon.toString()),
      });
    },
    [writeContractAsync, ensureChain]
  );

  const unlock = useCallback(
    async (skillId: number, unlockMON: number) => {
      await ensureChain();
      return writeContractAsync({
        ...orchor,
        functionName: "unlockSkill",
        args: [BigInt(skillId)],
        value: parseEther(unlockMON.toString()),
      });
    },
    [writeContractAsync, ensureChain]
  );

  const subscribe = useCallback(
    async (skillId: number, subMON: number) => {
      await ensureChain();
      return writeContractAsync({
        ...orchor,
        functionName: "subscribeSkill",
        args: [BigInt(skillId)],
        value: parseEther(subMON.toString()),
      });
    },
    [writeContractAsync, ensureChain]
  );

  const invoke = useCallback(
    async (skillId: number, input: string) => {
      await ensureChain();
      const hash = keccak256(toHex(input || `orchor:${skillId}:${Date.now()}`));
      return writeContractAsync({
        ...orchor,
        functionName: "invokeSkill",
        args: [BigInt(skillId), hash],
      });
    },
    [writeContractAsync, ensureChain]
  );

  const publishSkill = useCallback(
    async (params: {
      name: string;
      rarity: number; // 0..4 (Common..Mythic)
      energyCost: number;
      unlockPriceMON: number;
      subscriptionPriceMON: number;
      mintCap: number; // 0 for non-Mythic
    }) => {
      await ensureChain();
      return writeContractAsync({
        ...orchor,
        functionName: "registerSkill",
        args: [
          params.name,
          params.rarity,
          BigInt(params.energyCost),
          parseEther(params.unlockPriceMON.toString()),
          parseEther(params.subscriptionPriceMON.toString()),
          params.mintCap,
        ],
      });
    },
    [writeContractAsync, ensureChain]
  );

  return {
    topUp,
    unlock,
    subscribe,
    invoke,
    publishSkill,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

/** Live next skillId — used by the publish flow to know what id a new skill will get. */
export function useNextSkillId() {
  const { data, refetch } = useReadContract({
    ...orchor,
    functionName: "nextSkillId",
  });
  return {
    nextSkillId: data ? Number(data) : 0,
    refetch,
  };
}
