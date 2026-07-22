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
  | "Custom Agent"
  | "anthropics/skills"
  | "prompts.chat";

export interface SkillModule {
  id: number;
  title: string;
  creator: string;
  creatorAvatar: string;
  creatorHandle: string;
  category: SkillCategory;
  rarity: Rarity;
  pricingType: PricingType;
  /** Legacy INJ prices for unlock / subscription. */
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
    inputExample: "Research the team and traction behind Injective Labs",
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
    inputExample: "Track competitor moves in Injective ecosystem this month",
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
    inputExample: "Plan the launch of an Injective-native AI agent SDK",
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
    inputExample: "Explain the risks of 0xC74...3001 on Injective Testnet",
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
      "Guides you through deploying & verifying a contract to Injective Testnet step by step.",
    inputExample: "Deploy and verify SkillFlow.sol on Injective Testnet",
    outputPreview:
      "▸ Step 1/4: compile (ok)\n▸ Step 2/4: fund deployer (1.2 INJ)\n▸ Step 3/4: deploy (gas 2.1M)\n▸ Step 4/4: verify on explorer",
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
      "Streams onchain analytics: wallet cohorts, flow graphs, anomaly alerts, all on Injective.",
    inputExample: "Surface anomalies in INJ transfer flows last 24h",
    outputPreview:
      "▸ 2 anomalous wallets flagged\n▸ Net flow: +124k INJ to CEX\n▸ Active cohort: builders (+18%)\n▸ Z-score: 3.4",
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
  /* ────────────────────────────────────────────────────────────────
   * Imported from the open-source skills ecosystem.
   * ids 12–15: github.com/anthropics/skills (Apache-2.0 example skills)
   * ids 16–19: prompts.chat / f/awesome-chatgpt-prompts (CC0 1.0)
   * Attribution kept in `origin` + creator fields; system prompts live
   * server-side in src/lib/runtime/skill-prompts.ts.
   * ──────────────────────────────────────────────────────────────── */
  {
    id: 12,
    title: "MCP Server Builder",
    creator: "anthropics/skills",
    creatorAvatar: "AS",
    creatorHandle: "@anthropics",
    category: "Automation",
    rarity: "Legendary",
    pricingType: "PerInvoke",
    priceMON: 0.13,
    subscriptionMON: 3.9,
    energyCost: 52,
    rating: 4.9,
    usageCount: 0,
    shortDescription:
      "Builds production-grade MCP servers for any external API — schemas, error handling, evals. Imported from Anthropic's open-source skills repo.",
    inputExample: "Build an MCP server for the Injective Blockscout API",
    outputPreview:
      "▸ 4-phase plan: research → implement → review → eval\n▸ 9 tools scaffolded (TypeScript, stdio)\n▸ Error taxonomy + retry policy\n▸ 10 eval questions generated",
    pipeline: ["Research", "Implement", "Review", "Eval"],
    sparkline: [0, 0, 1, 2, 4, 5, 8, 11, 14, 18, 22, 27],
    origin: "anthropics/skills",
    runtime: {
      model: "claude-sonnet-4.6",
      tools: ["code.write", "api.probe", "eval.run"],
      memory: "ephemeral",
      avgLatencyMs: 6200,
      tokenCostCents: 3.4,
    },
  },
  {
    id: 13,
    title: "Webapp Testing Agent",
    creator: "anthropics/skills",
    creatorAvatar: "AS",
    creatorHandle: "@anthropics",
    category: "Automation",
    rarity: "Epic",
    pricingType: "PerInvoke",
    priceMON: 0.08,
    subscriptionMON: 2.6,
    energyCost: 30,
    rating: 4.8,
    usageCount: 0,
    shortDescription:
      "Drives Playwright to verify frontend flows, capture screenshots, and read browser logs. Imported from Anthropic's open-source skills repo.",
    inputExample: "Test the wallet-connect and top-up flow on my dApp",
    outputPreview:
      "▸ 6/7 flows passed\n▸ 1 failure: top-up modal (selector timeout)\n▸ 4 screenshots captured\n▸ Console: 2 warnings, 0 errors",
    pipeline: ["Recon", "Script", "Run", "Report"],
    sparkline: [0, 1, 1, 3, 4, 6, 7, 10, 12, 15, 17, 21],
    origin: "anthropics/skills",
    runtime: {
      model: "claude-sonnet-4.6",
      tools: ["playwright.run", "browser.logs", "screenshot"],
      memory: "ephemeral",
      avgLatencyMs: 8400,
      tokenCostCents: 2.8,
    },
  },
  {
    id: 14,
    title: "Frontend Design Director",
    creator: "anthropics/skills",
    creatorAvatar: "AS",
    creatorHandle: "@anthropics",
    category: "Product",
    rarity: "Epic",
    pricingType: "PerInvoke",
    priceMON: 0.07,
    subscriptionMON: 2.4,
    energyCost: 26,
    rating: 4.85,
    usageCount: 0,
    shortDescription:
      "Boutique-studio design direction: tokens, type roles, one signature element — explicitly avoids AI-template aesthetics. From Anthropic's skills repo.",
    inputExample: "Design direction for a retro trading-card marketplace",
    outputPreview:
      "▸ Palette: 5 tokens (paper/ink/ember)\n▸ Type: display + mono pairing\n▸ Signature: holo-foil card tilt\n▸ Critique pass: 2 generic patterns removed",
    pipeline: ["Brief", "Plan", "Critique", "Spec"],
    sparkline: [0, 0, 2, 3, 5, 6, 9, 11, 13, 16, 19, 23],
    origin: "anthropics/skills",
    runtime: {
      model: "claude-opus-4.7",
      tools: ["design.tokens", "critique.pass"],
      memory: "ephemeral",
      avgLatencyMs: 4100,
      tokenCostCents: 2.1,
    },
  },
  {
    id: 15,
    title: "Skill Creator",
    creator: "anthropics/skills",
    creatorAvatar: "AS",
    creatorHandle: "@anthropics",
    category: "Automation",
    rarity: "Mythic",
    pricingType: "PerInvoke",
    priceMON: 0.16,
    subscriptionMON: 4.8,
    energyCost: 90,
    rating: 4.95,
    usageCount: 0,
    shortDescription:
      "The skill that creates skills: interview → draft SKILL.md → benchmark with/without → revise until it wins. Meta-tooling from Anthropic's skills repo.",
    inputExample: "Create a skill that audits ERC-20 approval risks",
    outputPreview:
      "▸ SKILL.md drafted (frontmatter + 4 sections)\n▸ Benchmark: +34% vs baseline (n=12)\n▸ 2 revision loops\n▸ Packaged: erc20-approval-audit.skill",
    pipeline: ["Interview", "Draft", "Benchmark", "Revise"],
    sparkline: [0, 1, 2, 4, 7, 9, 13, 16, 20, 25, 31, 38],
    origin: "anthropics/skills",
    runtime: {
      model: "claude-opus-4.7",
      tools: ["skill.scaffold", "eval.bench", "subagent.run"],
      memory: "persistent",
      avgLatencyMs: 11800,
      tokenCostCents: 5.6,
    },
    mintedOf: { current: 0, cap: 80 },
  },
  {
    id: 16,
    title: "Ethereum Contract Engineer",
    creator: "prompts.chat",
    creatorAvatar: "PC",
    creatorHandle: "@promptschat",
    category: "Web3 Dev",
    rarity: "Legendary",
    pricingType: "PerInvoke",
    priceMON: 0.11,
    subscriptionMON: 3.5,
    energyCost: 44,
    rating: 4.85,
    usageCount: 0,
    shortDescription:
      "Experienced Ethereum developer persona: writes Solidity with explanations, access control and gas awareness. CC0-imported from prompts.chat.",
    inputExample: "Write a message-board contract: public reads, owner-only writes, update counter",
    outputPreview:
      "▸ Solidity 0.8.x contract (42 lines)\n▸ onlyOwner write guard\n▸ update counter + events\n▸ Deploy & test notes included",
    pipeline: ["Spec", "Write", "Explain"],
    sparkline: [0, 1, 3, 4, 6, 9, 11, 14, 18, 21, 26, 31],
    origin: "prompts.chat",
    runtime: {
      model: "gpt-4.1",
      tools: ["sol.compile", "code.write"],
      memory: "ephemeral",
      avgLatencyMs: 3800,
      tokenCostCents: 1.9,
    },
  },
  {
    id: 17,
    title: "Cyber Security Strategist",
    creator: "prompts.chat",
    creatorAvatar: "PC",
    creatorHandle: "@promptschat",
    category: "Web3 Dev",
    rarity: "Epic",
    pricingType: "PerInvoke",
    priceMON: 0.08,
    subscriptionMON: 2.5,
    energyCost: 28,
    rating: 4.75,
    usageCount: 0,
    shortDescription:
      "Security-specialist persona: threat models your data flows and proposes encryption, monitoring and policy hardening. CC0-imported from prompts.chat.",
    inputExample: "Harden a hot-wallet signing service exposed over HTTP",
    outputPreview:
      "▸ Threat model: 6 attack surfaces\n▸ mTLS + HSM key custody proposed\n▸ 4 detection rules (anomalous signing)\n▸ Policy: rate limits + allowlists",
    pipeline: ["Model", "Harden", "Detect"],
    sparkline: [0, 0, 2, 3, 5, 7, 9, 12, 14, 17, 20, 24],
    origin: "prompts.chat",
    runtime: {
      model: "claude-sonnet-4.6",
      tools: ["threat.map", "policy.gen"],
      memory: "ephemeral",
      avgLatencyMs: 3400,
      tokenCostCents: 1.6,
    },
  },
  {
    id: 18,
    title: "Data Science Analyst",
    creator: "prompts.chat",
    creatorAvatar: "PC",
    creatorHandle: "@promptschat",
    category: "Data",
    rarity: "Rare",
    pricingType: "PerInvoke",
    priceMON: 0.05,
    subscriptionMON: 1.8,
    energyCost: 16,
    rating: 4.7,
    usageCount: 0,
    shortDescription:
      "Data-scientist persona: mines behavioral datasets for actionable retention and engagement insights. CC0-imported from prompts.chat.",
    inputExample: "Find retention drivers in my dApp's 30-day usage export",
    outputPreview:
      "▸ D7 retention: 21% (+6% for wallet-connected)\n▸ Top driver: first invoke < 5 min\n▸ Churn cohort: gas-fail on first tx\n▸ 3 experiments proposed",
    pipeline: ["Explore", "Model", "Recommend"],
    sparkline: [0, 1, 2, 4, 5, 8, 10, 12, 15, 18, 22, 26],
    origin: "prompts.chat",
    runtime: {
      model: "gpt-4o",
      tools: ["df.analyze", "chart.render"],
      memory: "ephemeral",
      avgLatencyMs: 2900,
      tokenCostCents: 1.2,
    },
  },
  {
    id: 19,
    title: "RegEx Forge",
    creator: "prompts.chat",
    creatorAvatar: "PC",
    creatorHandle: "@promptschat",
    category: "Automation",
    rarity: "Common",
    pricingType: "PerInvoke",
    priceMON: 0.02,
    subscriptionMON: 0.8,
    energyCost: 6,
    rating: 4.6,
    usageCount: 0,
    shortDescription:
      "Generates copy-paste-ready regular expressions for any pattern — emails, tx hashes, addresses. CC0-imported from prompts.chat.",
    inputExample: "Regex for a checksummed EVM address",
    outputPreview: "▸ ^0x[a-fA-F0-9]{40}$\n▸ variant: strict EIP-55 check note",
    pipeline: ["Parse", "Generate"],
    sparkline: [1, 2, 2, 4, 5, 7, 8, 10, 13, 15, 18, 22],
    origin: "prompts.chat",
    runtime: {
      model: "gpt-4o",
      tools: ["regex.gen"],
      memory: "none",
      avgLatencyMs: 800,
      tokenCostCents: 0.2,
    },
  },
];

export const DEFAULT_SELECTED_IDS = [0, 1, 10];
