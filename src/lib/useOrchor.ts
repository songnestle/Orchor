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

/**
 * useOrchor1155 — 替换 src/lib/useOrchor.ts
 *
 * 与旧版的根本差异：持有状态不再读 owned mapping，而是读 ERC-1155 余额。
 * 这不是等价改写 —— 旧的 owned mapping 已在合约里删除，
 * 因为权限只能有一个真相来源，否则会出现「卖了卡还能调用」。
 *
 * 附带好处：balanceOf 是标准接口，钱包和第三方市场天然能读，
 * 不需要我们提供任何 API。
 */

const orchor = {
  abi: ORCHOR_ABI,
  address: ORCHOR_CORE_ADDRESS,
  chainId: activeChain.id,
} as const;

/** 链上全部 skillId：[0, nextSkillId) */
function useAllSkillIds(): number[] {
  const { data } = useReadContract({ ...orchor, functionName: "nextSkillId" });
  return useMemo(() => {
    const n = data ? Number(data) : 0;
    return Array.from({ length: n }, (_, i) => i);
  }, [data]);
}

/** Energy 余额。仍是合约内账本，不是代币。 */
export function useEnergy() {
  const { address } = useAccount();
  const { data, refetch, isLoading } = useReadContract({
    ...orchor,
    functionName: "energyOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });
  return { energy: data ? Number(data) : 0, refetch, isLoading };
}

/**
 * 持卡量。一次 balanceOfBatch 拿全部，比逐个 balanceOf 省一个数量级的 RPC。
 * 返回 Map<skillId, 份数> —— 份数而不是 bool，因为可以持有多份用于做市。
 */
export function useBalances() {
  const { address } = useAccount();
  const ids = useAllSkillIds();

  const { data, refetch, isLoading } = useReadContract({
    ...orchor,
    functionName: "balanceOfBatch",
    args:
      address && ids.length
        ? [ids.map(() => address), ids.map((i) => BigInt(i))]
        : undefined,
    query: { enabled: Boolean(address) && ids.length > 0 },
  });

  const balances = useMemo(() => {
    const m = new Map<number, number>();
    (data as bigint[] | undefined)?.forEach((b, i) => {
      if (b > 0n) m.set(ids[i], Number(b));
    });
    return m;
  }, [data, ids]);

  return { balances, refetch, isLoading };
}

/** 兼容旧代码的形态。新代码建议直接用 useBalances 拿份数。 */
export function useOwnedSet() {
  const { balances, refetch, isLoading } = useBalances();
  return { owned: new Set(balances.keys()), refetch, isLoading };
}

/** 有效订阅集合。订阅是租约，不可转让，仍走 mapping。 */
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

  const subscribed = new Set<number>();
  const now = BigInt(Math.floor(Date.now() / 1000));
  data?.forEach((res, i) => {
    if (res.status === "success" && (res.result as bigint) >= now) {
      subscribed.add(ids[i]);
    }
  });
  return { subscribed, refetch, isLoading };
}

/**
 * 全部技能的链上元数据：铸造进度、价格、稀有度、是否停用。
 * 卡片上显示的每一个数字都应该来自这里，不要用 skills.ts 里的静态值。
 */
export interface OnchainSkill {
  name: string;
  creator: `0x${string}`;
  rarity: number;
  energyCost: number;
  unlockPriceWei: bigint;
  subscriptionPriceWei: bigint;
  mintCap: number;
  minted: number;
  active: boolean;
}

export function useOnchainSkills() {
  const ids = useAllSkillIds();
  const { data, refetch, isLoading } = useReadContracts({
    contracts: ids.map((id) => ({
      ...orchor,
      functionName: "getSkill" as const,
      args: [BigInt(id)] as const,
    })),
    query: { enabled: ids.length > 0 },
  });

  const map = useMemo(() => {
    const out = new Map<number, OnchainSkill>();
    data?.forEach((res, i) => {
      if (res.status !== "success") return;
      const s = res.result as any;
      out.set(ids[i], {
        name: s.name,
        creator: s.creator,
        rarity: Number(s.rarity),
        energyCost: Number(s.energyCost),
        unlockPriceWei: BigInt(s.unlockPriceWei),
        subscriptionPriceWei: BigInt(s.subscriptionPriceWei),
        mintCap: Number(s.mintCap),
        minted: Number(s.minted),
        active: Boolean(s.active),
      });
    });
    return out;
  }, [data, ids]);

  return { skills: map, refetch, isLoading };
}

/** 铸造进度。只对限量卡（Mythic）返回值。 */
export function useMintProgress() {
  const { skills } = useOnchainSkills();
  return useMemo(() => {
    const out: Record<number, { current: number; cap: number }> = {};
    skills.forEach((s, id) => {
      if (s.mintCap > 0) out[id] = { current: s.minted, cap: s.mintCap };
    });
    return out;
  }, [skills]);
}

/**
 * 链上累计调用次数，来自 SkillInvoked 事件。
 *
 * 刻意不返回默认值 0 —— 读取失败和「真的是 0」必须能被区分开，
 * 否则卡面会把「还没读到」渲染成「无人使用」。undefined 时卡上显示 —。
 */
export function useInvocationCounts() {
  // 链上累计调用来自 SkillInvoked 事件。前端直扫全链历史在 20 张卡时勉强可跑，
  // 再多就不行 —— 正确做法是后端索引或 subgraph。
  // 这里刻意返回 undefined 而不是 0：读不到和真的是 0 必须能被区分开，
  // 否则卡面会把「还没读到」渲染成「无人使用」。
  return { counts: undefined as Record<number, number> | undefined, isLoading: false };
}

/** 写操作。 */
export function useOrchorWrites() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });
  const chainId = useChainId();
  const { address } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const ensureChain = useCallback(async () => {
    if (chainId === activeChain.id) return;
    try {
      await switchChainAsync({ chainId: activeChain.id });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(
        msg.toLowerCase().includes("user rejected")
          ? "WRONG_NETWORK"
          : "WRONG_NETWORK"
      );
    }
  }, [chainId, switchChainAsync]);

  const topUp = useCallback(
    async (inj: number) => {
      await ensureChain();
      return writeContractAsync({
        ...orchor,
        functionName: "topUpEnergy",
        value: parseEther(inj.toString()),
      });
    },
    [writeContractAsync, ensureChain]
  );

  /**
   * 买断。amount 是份数 —— 允许一次买多份，这是二级市场做市的前提。
   * 价格用链上的 unlockPriceWei，不要用 skills.ts 里的静态价格乘 parseEther：
   * 前端静态值一旦和链上不同步，交易会因 BAD_PRICE 直接 revert。
   */
  const unlock = useCallback(
    async (skillId: number, unlockPriceWei: bigint, amount = 1) => {
      await ensureChain();
      return writeContractAsync({
        ...orchor,
        functionName: "unlockSkill",
        args: [BigInt(skillId), BigInt(amount)],
        value: unlockPriceWei * BigInt(amount),
      });
    },
    [writeContractAsync, ensureChain]
  );

  const subscribe = useCallback(
    async (skillId: number, subPriceWei: bigint) => {
      await ensureChain();
      return writeContractAsync({
        ...orchor,
        functionName: "subscribeSkill",
        args: [BigInt(skillId)],
        value: subPriceWei,
      });
    },
    [writeContractAsync, ensureChain]
  );

  const invoke = useCallback(
    async (skillId: number, input: string) => {
      await ensureChain();
      const h = keccak256(toHex(input || `orchor:${skillId}:${Date.now()}`));
      return writeContractAsync({
        ...orchor,
        functionName: "invokeSkill",
        args: [BigInt(skillId), h],
      });
    },
    [writeContractAsync, ensureChain]
  );

  /** 转让技能卡。这是 1155 改造带来的新能力，旧版没有。 */
  const transfer = useCallback(
    async (to: `0x${string}`, skillId: number, amount = 1) => {
      if (!address) throw new Error("WALLET_REQUIRED");
      await ensureChain();
      return writeContractAsync({
        ...orchor,
        functionName: "safeTransferFrom",
        args: [address, to, BigInt(skillId), BigInt(amount), "0x"],
      });
    },
    [writeContractAsync, ensureChain, address]
  );

  const publishSkill = useCallback(
    async (params: {
      name: string;
      rarity: number; // 0..4
      energyCost: number;
      unlockPriceINJ: number;
      subscriptionPriceINJ: number;
      mintCap: number; // 非 Mythic 必须为 0
    }) => {
      await ensureChain();
      // 合约会拒绝含 " \ < > 和控制字符的名字，长度上限 48。
      // 在这里先校验，避免用户付了 gas 才失败。
      if (params.name.length === 0 || params.name.length > 48) {
        throw new Error("NAME_LENGTH");
      }
      if (/["\\<>]/.test(params.name) || /[\x00-\x1f]/.test(params.name)) {
        throw new Error("NAME_CHARS");
      }
      return writeContractAsync({
        ...orchor,
        functionName: "registerSkill",
        args: [
          params.name,
          params.rarity,
          BigInt(params.energyCost),
          parseEther(params.unlockPriceINJ.toString()),
          parseEther(params.subscriptionPriceINJ.toString()),
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
    transfer,
    publishSkill,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useNextSkillId() {
  const { data, refetch } = useReadContract({ ...orchor, functionName: "nextSkillId" });
  return { nextSkillId: data ? Number(data) : 0, refetch };
}

/** 待领取的分账（创作者地址是合约、推送失败时会进这里）。 */
export function usePending() {
  const { address } = useAccount();
  const { data, refetch } = useReadContract({
    ...orchor,
    functionName: "pending",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });
  return { pendingWei: (data as bigint | undefined) ?? 0n, refetch };
}
