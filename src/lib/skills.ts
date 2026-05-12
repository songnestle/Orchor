import type { Rarity } from "./rarity";

export type SkillCategory =
  | "Research"
  | "Product"
  | "Marketing"
  | "Automation"
  | "Web3 Dev"
  | "Data";

export type PricingType = "PerInvoke" | "Subscription" | "Collection";

export type RuntimeModel =
  | "gpt-4o"
  | "gpt-4.1"
  | "claude-sonnet-4.6"
  | "claude-opus-4.7"
  | "gemini-2.5-pro"
  | "orchor-router";

export type OrigPlatform =
  | "OpenClaw"
  | "Claude Code"
  | "Lobehub"
  | "Dify"
  | "LangGraph"
  | "Custom Agent";

export interface SkillModule {
  id: number;
  title: string;
  creator: string;
  creatorAvatar: string;
  creatorHandle: string;
  category: SkillCategory;
  rarity: Rarity;
  pricingType: PricingType;
  /** Legacy MON prices for unlock / subscription. */
  priceMON: number;
  subscriptionMON?: number;
  /** Energy (⚡) cost per invocation — what the user actually sees. */
  energyCost: number;
  rating: number;
  usageCount: number;
  shortDescription: string;
  inputExample: string;
  outputPreview: string;
  collectionName?: string;
  pipeline: string[];
  sparkline: number[];
  /** Which Agent platform this skill was exported from. */
  origin: OrigPlatform;
  /** Runtime metadata surfaced in the .or Package. */
  runtime: {
    model: RuntimeModel;
    tools: string[];
    memory: "none" | "ephemeral" | "persistent";
    avgLatencyMs: number;
    /** underlying provider token cost estimate per invoke (USD cents) */
    tokenCostCents: number;
  };
  /** Mythic only: serialized mint count / cap */
  mintedOf?: { current: number; cap: number };
}

export const SKILL_MODULES: SkillModule[] = [
  {
    id: 0,
    title: "VC Research Agent",
    creator: "Atlas Labs",
    creatorAvatar: "AT",
    creatorHandle: "@atlaslabs",
    category: "Research",
    rarity: "Legendary",
    pricingType: "PerInvoke",
    priceMON: 0.12,
    subscriptionMON: 3.8,
    energyCost: 48,
    rating: 4.9,
    usageCount: 18420,
    shortDescription:
      "Deep VC-grade research on any company, team, or thesis. Crawls filings, signals, and team graph.",
    inputExample: "Research the team and traction behind Monad Labs",
    outputPreview:
      "▸ Team: 4 ex-Jump Crypto, 2 ex-Lido core\n▸ Capital: $244M raised (Paradigm lead)\n▸ Edge: parallel EVM @ 10k TPS\n▸ Risk: testnet → mainnet token unlock cliff",
    collectionName: "VC Analyst Toolkit",
    pipeline: ["Crawl", "Extract", "Cross-ref", "Synthesize"],
    sparkline: [4, 6, 5, 8, 12, 10, 14, 18, 16, 22, 26, 30],
    origin: "LangGraph",
    runtime: {
      model: "claude-opus-4.7",
      tools: ["web.search", "web.fetch", "memory.recall", "citation.extract"],
      memory: "persistent",
      avgLatencyMs: 3800,
      tokenCostCents: 2.4,
    },
  },
  {
    id: 1,
    title: "Solidity Security Scanner",
    creator: "Cipher Forge",
    creatorAvatar: "CF",
    creatorHandle: "@cipherforge",
    category: "Web3 Dev",
    rarity: "Mythic",
    pricingType: "PerInvoke",
    priceMON: 0.18,
    subscriptionMON: 5.2,
    energyCost: 82,
    rating: 4.95,
    usageCount: 24180,
    shortDescription:
      "Audits Solidity contracts for reentrancy, overflow, oracle manipulation, and gas griefing.",
    inputExample: "Scan SkillFlow.sol for reentrancy and access control",
    outputPreview:
      "✗ HIGH  unchecked call in executeWorkflow:74\n✓ PASS  no integer overflow paths\n✗ MED   missing access control on registerSkill\n▸ 12 checks · 2 issues · score 78/100",
    collectionName: "Web3 Dev Security Pack",
    pipeline: ["Parse AST", "Slither", "Symbolic", "Report"],
    sparkline: [10, 14, 12, 18, 22, 20, 26, 30, 28, 34, 38, 42],
    origin: "Claude Code",
    runtime: {
      model: "claude-opus-4.7",
      tools: ["code.parse", "slither", "mythril", "fs.read"],
      memory: "ephemeral",
      avgLatencyMs: 5400,
      tokenCostCents: 4.8,
    },
    mintedOf: { current: 42, cap: 100 },
  },
  {
    id: 2,
    title: "Market Map Generator",
    creator: "Atlas Labs",
    creatorAvatar: "AT",
    creatorHandle: "@atlaslabs",
    category: "Research",
    rarity: "Epic",
    pricingType: "PerInvoke",
    priceMON: 0.08,
    subscriptionMON: 2.5,
    energyCost: 28,
    rating: 4.8,
    usageCount: 12340,
    shortDescription:
      "Generates a structured competitive landscape with categories, leaders, and whitespace.",
    inputExample: "Map the AI agent marketplace landscape in 2026",
    outputPreview:
      "▸ Tier 1: 4 incumbents · 78% share\n▸ Emerging: 11 projects\n▸ Whitespace: agentic skill composition\n▸ M&A signal: 2 acquisitions Q1 '26",
    collectionName: "VC Analyst Toolkit",
    pipeline: ["Source", "Cluster", "Score", "Render"],
    sparkline: [3, 5, 7, 6, 9, 11, 10, 14, 16, 15, 19, 22],
    origin: "Dify",
    runtime: {
      model: "gpt-4o",
      tools: ["web.search", "chart.render"],
      memory: "ephemeral",
      avgLatencyMs: 2600,
      tokenCostCents: 1.2,
    },
  },
  {
    id: 3,
    title: "Competitor Scanner",
    creator: "Atlas Labs",
    creatorAvatar: "AT",
    creatorHandle: "@atlaslabs",
    category: "Research",
    rarity: "Rare",
    pricingType: "PerInvoke",
    priceMON: 0.05,
    subscriptionMON: 1.8,
    energyCost: 14,
    rating: 4.7,
    usageCount: 8930,
    shortDescription:
      "Tracks new product launches, pricing changes, and team moves at named competitors.",
    inputExample: "Track competitor moves in Monad ecosystem this month",
    outputPreview:
      "▸ 3 new launches detected\n▸ 1 pricing change (-22%)\n▸ 2 senior hires (eng / growth)\n▸ Signal score: 8.4/10",
    collectionName: "VC Analyst Toolkit",
    pipeline: ["Watch", "Diff", "Classify"],
    sparkline: [2, 3, 5, 4, 7, 8, 7, 10, 12, 11, 14, 17],
    origin: "OpenClaw",
    runtime: {
      model: "gpt-4o",
      tools: ["web.fetch", "diff.detect"],
      memory: "persistent",
      avgLatencyMs: 1800,
      tokenCostCents: 0.6,
    },
  },
  {
    id: 4,
    title: "PM Strategy Pack",
    creator: "Mesh Studio",
    creatorAvatar: "MS",
    creatorHandle: "@meshstudio",
    category: "Product",
    rarity: "Epic",
    pricingType: "Subscription",
    priceMON: 0.09,
    subscriptionMON: 2.9,
    energyCost: 32,
    rating: 4.85,
    usageCount: 15670,
    shortDescription:
      "Turns rough product ideas into RICE-scored roadmaps with risks and success metrics.",
    inputExample: "Build a 90-day roadmap for an onchain agent launcher",
    outputPreview:
      "▸ 6 initiatives prioritized (RICE)\n▸ 3 risks flagged\n▸ 4 metrics: D7 retention, invoke/u, ...\n▸ Recommended sequence: A → C → B",
    collectionName: "Product Growth OS",
    pipeline: ["Frame", "Score", "Sequence", "Risk"],
    sparkline: [5, 7, 6, 9, 12, 11, 14, 16, 18, 17, 21, 24],
    origin: "Lobehub",
    runtime: {
      model: "claude-sonnet-4.6",
      tools: ["rice.score", "risk.rank", "chart.render"],
      memory: "persistent",
      avgLatencyMs: 3100,
      tokenCostCents: 1.4,
    },
  },
  {
    id: 5,
    title: "User Interview Summarizer",
    creator: "Mesh Studio",
    creatorAvatar: "MS",
    creatorHandle: "@meshstudio",
    category: "Product",
    rarity: "Rare",
    pricingType: "PerInvoke",
    priceMON: 0.04,
    subscriptionMON: 1.4,
    energyCost: 12,
    rating: 4.75,
    usageCount: 7820,
    shortDescription:
      "Clusters raw interview transcripts into pain points, jobs-to-be-done, and verbatims.",
    inputExample: "Summarize 12 interviews with onchain power users",
    outputPreview:
      "▸ Top pain: tooling fragmentation (8/12)\n▸ JTBD: 'launch agent in <10 min'\n▸ 4 verbatims selected\n▸ 2 surprising signals",
    collectionName: "Product Growth OS",
    pipeline: ["Transcribe", "Cluster", "Extract"],
    sparkline: [2, 4, 3, 6, 5, 8, 9, 8, 12, 14, 13, 17],
    origin: "Dify",
    runtime: {
      model: "gpt-4.1",
      tools: ["transcribe.whisper", "cluster.hdbscan"],
      memory: "none",
      avgLatencyMs: 2200,
      tokenCostCents: 0.5,
    },
  },
  {
    id: 6,
    title: "GTM Launch Planner",
    creator: "Mesh Studio",
    creatorAvatar: "MS",
    creatorHandle: "@meshstudio",
    category: "Marketing",
    rarity: "Epic",
    pricingType: "Subscription",
    priceMON: 0.07,
    subscriptionMON: 2.4,
    energyCost: 26,
    rating: 4.8,
    usageCount: 11280,
    shortDescription:
      "Generates channel-by-channel launch plans with sequencing, copy hooks, and KPIs.",
    inputExample: "Plan the launch of a Monad-native AI agent SDK",
    outputPreview:
      "▸ 5 channels sequenced over 14d\n▸ 9 copy hooks per ICP\n▸ KPI targets: 5k signups, 18% activation\n▸ Risk: dev-rel bandwidth in week 2",
    collectionName: "Product Growth OS",
    pipeline: ["ICP", "Hook", "Channel", "KPI"],
    sparkline: [4, 6, 8, 7, 10, 12, 11, 14, 17, 16, 20, 23],
    origin: "Lobehub",
    runtime: {
      model: "gpt-4o",
      tools: ["segment.icp", "copy.variants", "kpi.forecast"],
      memory: "ephemeral",
      avgLatencyMs: 2800,
      tokenCostCents: 1.1,
    },
  },
  {
    id: 7,
    title: "Contract Risk Explainer",
    creator: "Cipher Forge",
    creatorAvatar: "CF",
    creatorHandle: "@cipherforge",
    category: "Web3 Dev",
    rarity: "Epic",
    pricingType: "PerInvoke",
    priceMON: 0.07,
    subscriptionMON: 2.2,
    energyCost: 24,
    rating: 4.78,
    usageCount: 9640,
    shortDescription:
      "Reads any contract address and explains risks in plain English with severity.",
    inputExample: "Explain the risks of 0xC74...3001 on Monad Testnet",
    outputPreview:
      "▸ Owner can pause transfers (HIGH)\n▸ Upgradeable proxy detected\n▸ No timelock on admin functions\n▸ Reentrancy guard: present",
    collectionName: "Web3 Dev Security Pack",
    pipeline: ["Fetch", "Decode", "Explain"],
    sparkline: [3, 5, 4, 7, 9, 8, 11, 13, 12, 15, 18, 21],
    origin: "Claude Code",
    runtime: {
      model: "claude-sonnet-4.6",
      tools: ["chain.fetch", "abi.decode", "mcp.monad"],
      memory: "ephemeral",
      avgLatencyMs: 2400,
      tokenCostCents: 1.0,
    },
  },
  {
    id: 8,
    title: "Testnet Deploy Assistant",
    creator: "Cipher Forge",
    creatorAvatar: "CF",
    creatorHandle: "@cipherforge",
    category: "Web3 Dev",
    rarity: "Rare",
    pricingType: "PerInvoke",
    priceMON: 0.05,
    subscriptionMON: 1.7,
    energyCost: 14,
    rating: 4.7,
    usageCount: 6840,
    shortDescription:
      "Guides you through deploying & verifying a contract to Monad Testnet step by step.",
    inputExample: "Deploy and verify SkillFlow.sol on Monad Testnet",
    outputPreview:
      "▸ Step 1/4: compile (ok)\n▸ Step 2/4: fund deployer (1.2 MON)\n▸ Step 3/4: deploy (gas 2.1M)\n▸ Step 4/4: verify on explorer",
    collectionName: "Web3 Dev Security Pack",
    pipeline: ["Compile", "Deploy", "Verify"],
    sparkline: [1, 2, 3, 3, 5, 7, 6, 9, 11, 10, 13, 16],
    origin: "Claude Code",
    runtime: {
      model: "gpt-4o",
      tools: ["hardhat.compile", "chain.deploy", "mcp.monad"],
      memory: "none",
      avgLatencyMs: 1600,
      tokenCostCents: 0.4,
    },
  },
  {
    id: 9,
    title: "Onchain Data Pulse",
    creator: "Helix Nodes",
    creatorAvatar: "HX",
    creatorHandle: "@helixnodes",
    category: "Data",
    rarity: "Epic",
    pricingType: "Subscription",
    priceMON: 0.08,
    subscriptionMON: 2.6,
    energyCost: 30,
    rating: 4.82,
    usageCount: 13420,
    shortDescription:
      "Streams onchain analytics: wallet cohorts, flow graphs, anomaly alerts, all on Monad.",
    inputExample: "Surface anomalies in MON transfer flows last 24h",
    outputPreview:
      "▸ 2 anomalous wallets flagged\n▸ Net flow: +124k MON to CEX\n▸ Active cohort: builders (+18%)\n▸ Z-score: 3.4",
    pipeline: ["Index", "Cohort", "Detect"],
    sparkline: [6, 8, 7, 10, 13, 12, 16, 18, 17, 21, 25, 28],
    origin: "Custom Agent",
    runtime: {
      model: "orchor-router",
      tools: ["chain.index", "cohort.build", "anomaly.zscore"],
      memory: "persistent",
      avgLatencyMs: 3400,
      tokenCostCents: 1.3,
    },
  },
  {
    id: 10,
    title: "Agent Workflow Runner",
    creator: "Helix Nodes",
    creatorAvatar: "HX",
    creatorHandle: "@helixnodes",
    category: "Automation",
    rarity: "Mythic",
    pricingType: "Subscription",
    priceMON: 0.15,
    subscriptionMON: 4.5,
    energyCost: 120,
    rating: 4.92,
    usageCount: 21680,
    shortDescription:
      "Composes multi-agent workflows with tool use, memory, and conditional branching.",
    inputExample: "Run a research → write → review loop until quality > 0.9",
    outputPreview:
      "▸ 3 agents chained\n▸ 4 iterations · quality 0.94\n▸ Tools used: web, code, memory\n▸ Cost: 120 ⚡",
    pipeline: ["Plan", "Branch", "Tool", "Verify"],
    sparkline: [8, 10, 9, 13, 16, 15, 19, 22, 21, 25, 29, 34],
    origin: "LangGraph",
    runtime: {
      model: "orchor-router",
      tools: ["agent.spawn", "memory.persist", "tool.dispatch", "mcp.any"],
      memory: "persistent",
      avgLatencyMs: 9200,
      tokenCostCents: 7.4,
    },
    mintedOf: { current: 17, cap: 50 },
  },
  {
    id: 11,
    title: "Crypto Meme Stylist",
    creator: "Riot Pixel",
    creatorAvatar: "RP",
    creatorHandle: "@riotpixel",
    category: "Marketing",
    rarity: "Common",
    pricingType: "PerInvoke",
    priceMON: 0.02,
    subscriptionMON: 0.8,
    energyCost: 6,
    rating: 4.5,
    usageCount: 4520,
    shortDescription:
      "Rewrites copy in CT-native tone with meme references and inside jokes calibrated by era.",
    inputExample: "Rewrite this tweet in 2026 CT-degen tone",
    outputPreview:
      "▸ Tone: high-conviction degen\n▸ Refs: parallel EVM, points season\n▸ Emoji density: low (ironic)\n▸ Length: 188 chars",
    pipeline: ["Tone", "Refs", "Compress"],
    sparkline: [2, 3, 2, 4, 5, 4, 6, 7, 8, 7, 10, 12],
    origin: "OpenClaw",
    runtime: {
      model: "gpt-4o",
      tools: ["tone.adjust", "meme.lookup"],
      memory: "none",
      avgLatencyMs: 900,
      tokenCostCents: 0.2,
    },
  },
];

export const DEFAULT_SELECTED_IDS = [0, 1, 10];
