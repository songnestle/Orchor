import { defineChain } from "viem";

/**
 * Monad Testnet chain definition. Kept for backwards-compat / rollback —
 * OrchorCore is no longer live here, see `activeChain` below.
 */
export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_MONAD_TESTNET_RPC || "https://testnet-rpc.monad.xyz",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
});

/**
 * Injective Testnet — native EVM (MultiVM) layer. Chain ID 1439 maps to the
 * Cosmos chain `injective-888`. This is the production chain for the
 * Injective Nova Program Final Demo Day build.
 */
export const injectiveTestnet = defineChain({
  id: 1439,
  name: "Injective Testnet",
  nativeCurrency: { name: "Injective", symbol: "INJ", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_INJECTIVE_TESTNET_RPC ||
          "https://k8s.testnet.json-rpc.injective.network/",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Injective Blockscout",
      url: "https://testnet.blockscout.injective.network",
    },
  },
  // Standard Multicall3 is deployed on Injective testnet — lets wagmi batch
  // the per-skill owned/subscriptionExpiry/getSkill reads into ~1 RPC call
  // instead of 3 × nextSkillId individual requests.
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
    },
  },
  testnet: true,
});

/** The chain OrchorCore is currently deployed to and the app defaults to.
 *  Swap this one line to roll back to `monadTestnet` if needed. */
export const activeChain = injectiveTestnet;

/** Native currency symbol of the active chain, used in UI price labels. */
export const NATIVE_SYMBOL = activeChain.nativeCurrency.symbol;

/* ─────────── Legacy SkillFlow.sol (kept for backwards compat) ─────────── */

export const SKILLFLOW_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_SKILLFLOW_CONTRACT_ADDRESS as `0x${string}` | undefined) ||
  ("0x0000000000000000000000000000000000000000" as `0x${string}`);

export const SKILLFLOW_ABI = [
  {
    type: "function",
    name: "executeWorkflow",
    stateMutability: "payable",
    inputs: [
      { name: "skillIds", type: "uint256[]" },
      { name: "promptHash", type: "string" },
    ],
    outputs: [],
  },
] as const;

/* ─────────── OrchorCore (current production contract) ─────────── */

export const ORCHOR_CORE_ADDRESS =
  (process.env.NEXT_PUBLIC_ORCHOR_CORE_ADDRESS as `0x${string}` | undefined) ||
  ("0x0000000000000000000000000000000000000000" as `0x${string}`);

export const ORCHOR_ABI = [
  /* ── ERC-1155 标准读 ── */
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOfBatch",
    stateMutability: "view",
    inputs: [
      { name: "accounts", type: "address[]" },
      { name: "ids", type: "uint256[]" },
    ],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "uri",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "safeTransferFrom",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "id", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "setApprovalForAll",
    stateMutability: "nonpayable",
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "royaltyInfo",
    stateMutability: "view",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "salePrice", type: "uint256" },
    ],
    outputs: [
      { name: "receiver", type: "address" },
      { name: "royaltyAmount", type: "uint256" },
    ],
  },

  /* ── Orchor 业务读 ── */
  {
    type: "function",
    name: "nextSkillId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getSkill",
    stateMutability: "view",
    inputs: [{ name: "skillId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "name", type: "string" },
          { name: "creator", type: "address" },
          { name: "rarity", type: "uint8" },
          { name: "energyCost", type: "uint64" },
          { name: "unlockPriceWei", type: "uint128" },
          { name: "subscriptionPriceWei", type: "uint128" },
          { name: "mintCap", type: "uint32" },
          { name: "minted", type: "uint32" },
          { name: "active", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "hasAccess",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "skillId", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "energyOf",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "subscriptionExpiry",
    stateMutability: "view",
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint64" }],
  },
  {
    type: "function",
    name: "pending",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  { type: "function", name: "CREATOR_BPS", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint16" }] },
  { type: "function", name: "PLATFORM_BPS", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint16" }] },
  { type: "function", name: "ONCHAIN_BPS", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint16" }] },

  /* ── 写 ── */
  {
    type: "function",
    name: "topUpEnergy",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    // 注意：多了 amount 参数。旧版是 unlockSkill(uint256)。
    type: "function",
    name: "unlockSkill",
    stateMutability: "payable",
    inputs: [
      { name: "skillId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "subscribeSkill",
    stateMutability: "payable",
    inputs: [{ name: "skillId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "invokeSkill",
    stateMutability: "nonpayable",
    inputs: [
      { name: "skillId", type: "uint256" },
      { name: "inputHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "registerSkill",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "rarity", type: "uint8" },
      { name: "energyCost", type: "uint64" },
      { name: "unlockPriceWei", type: "uint128" },
      { name: "subscriptionPriceWei", type: "uint128" },
      { name: "mintCap", type: "uint32" },
    ],
    outputs: [{ name: "skillId", type: "uint256" }],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },

  /* ── 事件（用于索引调用次数与成交历史） ── */
  {
    type: "event",
    name: "SkillInvoked",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "skillId", type: "uint256", indexed: true },
      { name: "energySpent", type: "uint64", indexed: false },
      { name: "inputHash", type: "bytes32", indexed: false },
    ],
  },
  {
    type: "event",
    name: "SkillUnlocked",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "skillId", type: "uint256", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "pricePaid", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RevenueSplit",
    inputs: [
      { name: "skillId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "creatorAmount", type: "uint256", indexed: false },
      { name: "platformAmount", type: "uint256", indexed: false },
      { name: "onchainLogAmount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TransferSingle",
    inputs: [
      { name: "operator", type: "address", indexed: true },
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "id", type: "uint256", indexed: false },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
] as const;

export function explorerTxUrl(hash: string): string {
  return `${activeChain.blockExplorers.default.url}/tx/${hash}`;
}

export function explorerAddrUrl(addr: string): string {
  return `${activeChain.blockExplorers.default.url}/address/${addr}`;
}

export function shortAddress(addr?: string | null): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
