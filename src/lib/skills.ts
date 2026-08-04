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
  shortDescription: string;
  inputExample: string;
  outputPreview: string;
  collectionName?: string;
  pipeline: string[];
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
  /**
   * 中文界面文案。缺省时回退英文 —— 卡面宁可显示英文,也不显示机翻。
   * 注意:`title` 的英文原名是链上 registerSkill 写入的规范名,
   * `zh.title` 只是展示层本地化,链上核验看到的仍是英文。
   */
  zh?: {
    title?: string;
    shortDescription?: string;
    inputExample?: string;
    outputPreview?: string;
    collectionName?: string;
  };
}

/**
 * 取技能卡的展示文案。中文缺字段就回退英文 —— 半中半英好过机翻,
 * 也好过留空。链上规范名(skill.title)永远是英文,这里只管界面。
 */
export function localizeSkill(skill: SkillModule, lang: "en" | "zh") {
  const z = lang === "zh" ? skill.zh : undefined;
  return {
    title: z?.title || skill.title,
    shortDescription: z?.shortDescription || skill.shortDescription,
    inputExample: z?.inputExample || skill.inputExample,
    outputPreview: z?.outputPreview || skill.outputPreview,
    collectionName: z?.collectionName || skill.collectionName,
    /** 链上注册的规范名,详情页需要显示它以便核验。 */
    onchainName: skill.title,
  };
}

export const SKILL_MODULES: SkillModule[] = [
  {
    id: 0,
    title: "VC Research Agent",
    creator: "Atlas Labs",
    creatorAvatar: "AT",
    creatorHandle: "atlaslabs",
    category: "Research",
    rarity: "Legendary",
    pricingType: "PerInvoke",
    priceMON: 0.1,
    subscriptionMON: 0.8,
    energyCost: 8,
    shortDescription:
      "Deep VC-grade research on any company, team, or thesis. Crawls filings, signals, and team graph.",
    inputExample: "Research the team and traction behind Injective Labs",
    outputPreview:
      "▸ Team: 4 ex-Jump Crypto, 2 ex-Lido core\n▸ Capital: $244M raised (Paradigm lead)\n▸ Edge: parallel EVM @ 10k TPS\n▸ Risk: testnet → mainnet token unlock cliff",
    collectionName: "VC Analyst Toolkit",
    pipeline: ["Crawl", "Extract", "Cross-ref", "Synthesize"],
    origin: "LangGraph",
    runtime: {
      model: "claude-opus-4.7",
      tools: ["web.search", "web.fetch", "memory.recall", "citation.extract"],
      memory: "persistent",
      avgLatencyMs: 3800,
      tokenCostCents: 2.4,
    },
    zh: {
      title: "VC 尽调分析师",
      shortDescription:
        "深挖一家公司的团队、业务与投资逻辑，交叉比对公开资料和市场信号，输出机构级尽调结论。",
      inputExample: "查一下 Injective Labs 的团队背景和业务进展",
      outputPreview:
        "▸ 团队：4 人出自 Jump Crypto，2 人出自 Lido 核心\n▸ 融资：累计 $244M，Paradigm 领投\n▸ 壁垒：并行 EVM @ 10k TPS\n▸ 风险：测试网转主网后代币解锁悬崖",
    },
  },
  {
    id: 1,
    title: "Solidity Security Scanner",
    creator: "Cipher Forge",
    creatorAvatar: "CF",
    creatorHandle: "cipherforge",
    category: "Web3 Dev",
    rarity: "Mythic",
    pricingType: "PerInvoke",
    priceMON: 0.2,
    subscriptionMON: 1.2,
    energyCost: 12,
    shortDescription:
      "Audits Solidity contracts for reentrancy, overflow, oracle manipulation, and gas griefing.",
    inputExample: "Scan SkillFlow.sol for reentrancy and access control",
    outputPreview:
      "✗ HIGH  unchecked call in executeWorkflow:74\n✓ PASS  no integer overflow paths\n✗ MED   missing access control on registerSkill\n▸ 12 checks · 2 issues · score 78/100",
    collectionName: "Web3 Dev Security Pack",
    pipeline: ["Parse AST", "Slither", "Symbolic", "Report"],
    origin: "Claude Code",
    runtime: {
      model: "claude-opus-4.7",
      tools: ["code.parse", "slither", "mythril", "fs.read"],
      memory: "ephemeral",
      avgLatencyMs: 5400,
      tokenCostCents: 4.8,
    },
    mintedOf: { current: 42, cap: 100 },
    zh: {
      title: "Solidity 安全扫描器",
      shortDescription:
        "审计 Solidity 合约的重入、整数溢出、预言机操纵和 gas griefing，逐条标出风险等级。",
      inputExample: "扫一下 SkillFlow.sol 的重入和权限控制",
      outputPreview:
        "✗ HIGH  executeWorkflow:74 存在未校验的外部调用\n✓ PASS  未发现整数溢出路径\n✗ MED   registerSkill 缺少权限控制\n▸ 12 项检查 · 2 处问题 · 评分 78/100",
    },
  },
  {
    id: 2,
    title: "Market Map Generator",
    creator: "Atlas Labs",
    creatorAvatar: "AT",
    creatorHandle: "atlaslabs",
    category: "Research",
    rarity: "Epic",
    pricingType: "PerInvoke",
    priceMON: 0.06,
    subscriptionMON: 0.5,
    energyCost: 5,
    shortDescription:
      "Generates a structured competitive landscape with categories, leaders, and whitespace.",
    inputExample: "Map the AI agent marketplace landscape in 2026",
    outputPreview:
      "▸ Tier 1: 4 incumbents · 78% share\n▸ Emerging: 11 projects\n▸ Whitespace: agentic skill composition\n▸ M&A signal: 2 acquisitions Q1 '26",
    collectionName: "VC Analyst Toolkit",
    pipeline: ["Source", "Cluster", "Score", "Render"],
    origin: "Dify",
    runtime: {
      model: "gpt-4o",
      tools: ["web.search", "chart.render"],
      memory: "ephemeral",
      avgLatencyMs: 2600,
      tokenCostCents: 1.2,
    },
    zh: {
      title: "赛道地图生成器",
      shortDescription:
        "画出赛道竞争格局：拆分层级、点名头部玩家，标出还没人占的空白地带。",
      inputExample: "梳理一下 2026 年 AI Agent 市场的竞争格局",
      outputPreview:
        "▸ 第一梯队：4 家老牌玩家 · 占 78% 份额\n▸ 新兴力量：11 个项目\n▸ 空白地带：Agent 技能编排\n▸ 并购信号：2026 Q1 已有 2 起收购",
    },
  },
  {
    id: 3,
    title: "Competitor Scanner",
    creator: "Atlas Labs",
    creatorAvatar: "AT",
    creatorHandle: "atlaslabs",
    category: "Research",
    rarity: "Rare",
    pricingType: "PerInvoke",
    priceMON: 0.04,
    subscriptionMON: 0.3,
    energyCost: 3,
    shortDescription:
      "Tracks new product launches, pricing changes, and team moves at named competitors.",
    inputExample: "Track competitor moves in Injective ecosystem this month",
    outputPreview:
      "▸ 3 new launches detected\n▸ 1 pricing change (-22%)\n▸ 2 senior hires (eng / growth)\n▸ Signal score: 8.4/10",
    collectionName: "VC Analyst Toolkit",
    pipeline: ["Watch", "Diff", "Classify"],
    origin: "OpenClaw",
    runtime: {
      model: "gpt-4o",
      tools: ["web.fetch", "diff.detect"],
      memory: "persistent",
      avgLatencyMs: 1800,
      tokenCostCents: 0.6,
    },
    zh: {
      title: "竞品动态雷达",
      shortDescription:
        "盯住指定竞品的新品发布、价格调整和核心人员变动，有动静立刻抓回来。",
      inputExample: "看看这个月 Injective 生态里竞品都在干什么",
      outputPreview:
        "▸ 监测到 3 次新品发布\n▸ 1 次价格调整（-22%）\n▸ 2 名资深人员加入（工程 / 增长）\n▸ 信号强度：8.4/10",
    },
  },
  {
    id: 4,
    title: "PM Strategy Pack",
    creator: "Mesh Studio",
    creatorAvatar: "MS",
    creatorHandle: "meshstudio",
    category: "Product",
    rarity: "Epic",
    pricingType: "Subscription",
    priceMON: 0.07,
    subscriptionMON: 0.5,
    energyCost: 5,
    shortDescription:
      "Turns rough product ideas into RICE-scored roadmaps with risks and success metrics.",
    inputExample: "Build a 90-day roadmap for an onchain agent launcher",
    outputPreview:
      "▸ 6 initiatives prioritized (RICE)\n▸ 3 risks flagged\n▸ 4 metrics: D7 retention, invoke/u, ...\n▸ Recommended sequence: A → C → B",
    collectionName: "Product Growth OS",
    pipeline: ["Frame", "Score", "Sequence", "Risk"],
    origin: "Lobehub",
    runtime: {
      model: "claude-sonnet-4.6",
      tools: ["rice.score", "risk.rank", "chart.render"],
      memory: "persistent",
      avgLatencyMs: 3100,
      tokenCostCents: 1.4,
    },
    zh: {
      title: "PM 策略工具包",
      shortDescription:
        "拆解粗糙的产品想法，输出 RICE 排序的路线图、风险清单和可验证的成功指标。",
      inputExample: "给链上 Agent 启动器做一份 90 天路线图",
      outputPreview:
        "▸ 6 项举措按 RICE 排序\n▸ 标出 3 个风险点\n▸ 4 项指标：D7 留存、invoke/u、...\n▸ 建议顺序：A → C → B",
    },
  },
  {
    id: 5,
    title: "User Interview Summarizer",
    creator: "Mesh Studio",
    creatorAvatar: "MS",
    creatorHandle: "meshstudio",
    category: "Product",
    rarity: "Rare",
    pricingType: "PerInvoke",
    priceMON: 0.03,
    subscriptionMON: 0.25,
    energyCost: 2,
    shortDescription:
      "Clusters raw interview transcripts into pain points, jobs-to-be-done, and verbatims.",
    inputExample: "Summarize 12 interviews with onchain power users",
    outputPreview:
      "▸ Top pain: tooling fragmentation (8/12)\n▸ JTBD: 'launch agent in <10 min'\n▸ 4 verbatims selected\n▸ 2 surprising signals",
    collectionName: "Product Growth OS",
    pipeline: ["Transcribe", "Cluster", "Extract"],
    origin: "Dify",
    runtime: {
      model: "gpt-4.1",
      tools: ["transcribe.whisper", "cluster.hdbscan"],
      memory: "none",
      avgLatencyMs: 2200,
      tokenCostCents: 0.5,
    },
    zh: {
      title: "用户访谈提炼器",
      shortDescription:
        "梳理零散的访谈记录，提炼痛点、JTBD 和可直接引用的原话，并标注每项出现频次",
      inputExample: "帮我把 12 场链上重度用户的访谈总结一下",
      outputPreview:
        "▸ 最高频痛点：工具链割裂（8/12）\n▸ JTBD：「<10 分钟跑起一个 agent」\n▸ 挑出 4 条可引用原话\n▸ 2 个反直觉信号",
    },
  },
  {
    id: 6,
    title: "GTM Launch Planner",
    creator: "Mesh Studio",
    creatorAvatar: "MS",
    creatorHandle: "meshstudio",
    category: "Marketing",
    rarity: "Epic",
    pricingType: "Subscription",
    priceMON: 0.05,
    subscriptionMON: 0.45,
    energyCost: 4,
    shortDescription:
      "Generates channel-by-channel launch plans with sequencing, copy hooks, and KPIs.",
    inputExample: "Plan the launch of an Injective-native AI agent SDK",
    outputPreview:
      "▸ 5 channels sequenced over 14d\n▸ 9 copy hooks per ICP\n▸ KPI targets: 5k signups, 18% activation\n▸ Risk: dev-rel bandwidth in week 2",
    collectionName: "Product Growth OS",
    pipeline: ["ICP", "Hook", "Channel", "KPI"],
    origin: "Lobehub",
    runtime: {
      model: "gpt-4o",
      tools: ["segment.icp", "copy.variants", "kpi.forecast"],
      memory: "ephemeral",
      avgLatencyMs: 2800,
      tokenCostCents: 1.1,
    },
    zh: {
      title: "GTM 发布排期器",
      shortDescription:
        "按渠道排出发布节奏，为每个 ICP 配好文案钩子和 KPI 目标，并标出执行风险",
      inputExample: "帮我给一个 Injective 原生的 AI agent SDK 排发布计划",
      outputPreview:
        "▸ 5 个渠道，14 天内依次铺开\n▸ 按 ICP 拆出 9 条文案钩子\n▸ KPI 目标：5k 注册、18% 激活\n▸ 风险：第 2 周 dev-rel 人手吃紧",
    },
  },
  {
    id: 7,
    title: "Contract Risk Explainer",
    creator: "Cipher Forge",
    creatorAvatar: "CF",
    creatorHandle: "cipherforge",
    category: "Web3 Dev",
    rarity: "Epic",
    pricingType: "PerInvoke",
    priceMON: 0.05,
    subscriptionMON: 0.4,
    energyCost: 4,
    shortDescription:
      "Reads any contract address and explains risks in plain English with severity.",
    inputExample: "Explain the risks of 0xC74...3001 on Injective Testnet",
    outputPreview:
      "▸ Owner can pause transfers (HIGH)\n▸ Upgradeable proxy detected\n▸ No timelock on admin functions\n▸ Reentrancy guard: present",
    collectionName: "Web3 Dev Security Pack",
    pipeline: ["Fetch", "Decode", "Explain"],
    origin: "Claude Code",
    runtime: {
      model: "claude-sonnet-4.6",
      tools: ["chain.fetch", "abi.decode", "mcp.monad"],
      memory: "ephemeral",
      avgLatencyMs: 2400,
      tokenCostCents: 1.0,
    },
    zh: {
      title: "合约风险解读器",
      shortDescription:
        "解析任意合约地址，用大白话说清潜在风险，并按严重程度逐条分级",
      inputExample: "看看 Injective 测试网上 0xC74...3001 有什么风险",
      outputPreview:
        "▸ owner 可暂停转账（高危）\n▸ 检测到可升级 proxy\n▸ 管理员函数没有 timelock\n▸ 重入保护：已启用",
    },
  },
  {
    id: 8,
    title: "Testnet Deploy Assistant",
    creator: "Cipher Forge",
    creatorAvatar: "CF",
    creatorHandle: "cipherforge",
    category: "Web3 Dev",
    rarity: "Rare",
    pricingType: "PerInvoke",
    priceMON: 0.04,
    subscriptionMON: 0.3,
    energyCost: 3,
    shortDescription:
      "Guides you through deploying & verifying a contract to Injective Testnet step by step.",
    inputExample: "Deploy and verify SkillFlow.sol on Injective Testnet",
    outputPreview:
      "▸ Step 1/4: compile (ok)\n▸ Step 2/4: fund deployer (1.2 INJ)\n▸ Step 3/4: deploy (gas 2.1M)\n▸ Step 4/4: verify on explorer",
    collectionName: "Web3 Dev Security Pack",
    pipeline: ["Compile", "Deploy", "Verify"],
    origin: "Claude Code",
    runtime: {
      model: "gpt-4o",
      tools: ["hardhat.compile", "chain.deploy", "mcp.monad"],
      memory: "none",
      avgLatencyMs: 1600,
      tokenCostCents: 0.4,
    },
    zh: {
      title: "测试网部署向导",
      shortDescription:
        "带你把合约部署到 Injective 测试网，编译、打钱、上链、验证每步都有提示",
      inputExample: "把 SkillFlow.sol 部署到 Injective 测试网并验证",
      outputPreview:
        "▸ 第 1/4 步：编译（通过）\n▸ 第 2/4 步：给部署账户打钱（1.2 INJ）\n▸ 第 3/4 步：部署（gas 2.1M）\n▸ 第 4/4 步：在区块浏览器验证",
    },
  },
  {
    id: 9,
    title: "Onchain Data Pulse",
    creator: "Helix Nodes",
    creatorAvatar: "HX",
    creatorHandle: "helixnodes",
    category: "Data",
    rarity: "Epic",
    pricingType: "Subscription",
    priceMON: 0.06,
    subscriptionMON: 0.5,
    energyCost: 5,
    shortDescription:
      "Streams onchain analytics: wallet cohorts, flow graphs, anomaly alerts, all on Injective.",
    inputExample: "Surface anomalies in INJ transfer flows last 24h",
    outputPreview:
      "▸ 2 anomalous wallets flagged\n▸ Net flow: +124k INJ to CEX\n▸ Active cohort: builders (+18%)\n▸ Z-score: 3.4",
    pipeline: ["Index", "Cohort", "Detect"],
    origin: "Custom Agent",
    runtime: {
      model: "orchor-router",
      tools: ["chain.index", "cohort.build", "anomaly.zscore"],
      memory: "persistent",
      avgLatencyMs: 3400,
      tokenCostCents: 1.3,
    },
    zh: {
      title: "链上数据脉搏",
      shortDescription:
        "盯住 Injective 链上数据流：钱包分群、资金流向图谱、异常告警，有异动实时推送",
      inputExample: "查一下过去 24 小时 INJ 转账里有没有异常",
      outputPreview:
        "▸ 标记出 2 个异常钱包\n▸ 净流向：+124k INJ 流入 CEX\n▸ 活跃分群：builders（+18%）\n▸ Z-score：3.4",
    },
  },
  {
    id: 10,
    title: "Agent Workflow Runner",
    creator: "Helix Nodes",
    creatorAvatar: "HX",
    creatorHandle: "helixnodes",
    category: "Automation",
    rarity: "Mythic",
    pricingType: "Subscription",
    priceMON: 0.18,
    subscriptionMON: 1.5,
    energyCost: 15,
    shortDescription:
      "Composes multi-agent workflows with tool use, memory, and conditional branching.",
    inputExample: "Run a research → write → review loop until quality > 0.9",
    outputPreview:
      "▸ 3 agents chained\n▸ 4 iterations · quality 0.94\n▸ Tools used: web, code, memory\n▸ Cost: 120 ⚡",
    pipeline: ["Plan", "Branch", "Tool", "Verify"],
    origin: "LangGraph",
    runtime: {
      model: "orchor-router",
      tools: ["agent.spawn", "memory.persist", "tool.dispatch", "mcp.any"],
      memory: "persistent",
      avgLatencyMs: 9200,
      tokenCostCents: 7.4,
    },
    mintedOf: { current: 17, cap: 50 },
    zh: {
      title: "Agent 工作流编排器",
      shortDescription:
        "串联多个 Agent 跑完整流程,支持工具调用、记忆共享和条件分支,循环迭代到达标为止。",
      inputExample: "跑 研究 → 撰写 → 审校 的循环,质量分过 0.9 才停",
      outputPreview:
        "▸ 编排 3 个 Agent\n▸ 4 轮迭代 · 质量 0.94\n▸ 调用工具:web、code、memory\n▸ 消耗:120 ⚡",
    },
  },
  {
    id: 11,
    title: "Crypto Meme Stylist",
    creator: "Riot Pixel",
    creatorAvatar: "RP",
    creatorHandle: "riotpixel",
    category: "Marketing",
    rarity: "Common",
    pricingType: "PerInvoke",
    priceMON: 0.01,
    subscriptionMON: 0.08,
    energyCost: 1,
    shortDescription:
      "Rewrites copy in CT-native tone with meme references and inside jokes calibrated by era.",
    inputExample: "Rewrite this tweet in 2026 CT-degen tone",
    outputPreview:
      "▸ Tone: high-conviction degen\n▸ Refs: parallel EVM, points season\n▸ Emoji density: low (ironic)\n▸ Length: 188 chars",
    pipeline: ["Tone", "Refs", "Compress"],
    origin: "OpenClaw",
    runtime: {
      model: "gpt-4o",
      tools: ["tone.adjust", "meme.lookup"],
      memory: "none",
      avgLatencyMs: 900,
      tokenCostCents: 0.2,
    },
    zh: {
      title: "CT 腔调改写器",
      shortDescription:
        "改写文案语气,切成 CT 原生腔调,按年代匹配当时的梗、黑话和圈内笑点。",
      inputExample: "把这条推文改成 2026 年 CT degen 那味儿",
      outputPreview:
        "▸ 语气:高信仰 degen\n▸ 梗点:parallel EVM、points season\n▸ Emoji 密度:低(反讽向)\n▸ 长度:188 字符",
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
    creatorHandle: "anthropics",
    category: "Automation",
    rarity: "Legendary",
    pricingType: "PerInvoke",
    priceMON: 0.12,
    subscriptionMON: 0.9,
    energyCost: 9,
    shortDescription:
      "Builds production-grade MCP servers for any external API — schemas, error handling, evals. Imported from Anthropic's open-source skills repo.",
    inputExample: "Build an MCP server for the Injective Blockscout API",
    outputPreview:
      "▸ 4-phase plan: research → implement → review → eval\n▸ 9 tools scaffolded (TypeScript, stdio)\n▸ Error taxonomy + retry policy\n▸ 10 eval questions generated",
    pipeline: ["Research", "Implement", "Review", "Eval"],
    origin: "anthropics/skills",
    runtime: {
      model: "claude-sonnet-4.6",
      tools: ["code.write", "api.probe", "eval.run"],
      memory: "ephemeral",
      avgLatencyMs: 6200,
      tokenCostCents: 3.4,
    },
    zh: {
      title: "MCP 服务构建器",
      shortDescription:
        "封装任意外部 API,产出可上生产的 MCP 服务:schema、错误处理、eval 一次配齐。源自 Anthropic 开源技能库。",
      inputExample: "给 Injective Blockscout API 做一个 MCP 服务",
      outputPreview:
        "▸ 4 阶段计划:调研 → 开发 → 审查 → 评测\n▸ 生成 9 个 tool 脚手架(TypeScript、stdio)\n▸ 错误分类 + 重试策略\n▸ 附 10 道 eval 测试用例",
    },
  },
  {
    id: 13,
    title: "Webapp Testing Agent",
    creator: "anthropics/skills",
    creatorAvatar: "AS",
    creatorHandle: "anthropics",
    category: "Automation",
    rarity: "Epic",
    pricingType: "PerInvoke",
    priceMON: 0.06,
    subscriptionMON: 0.5,
    energyCost: 5,
    shortDescription:
      "Drives Playwright to verify frontend flows, capture screenshots, and read browser logs. Imported from Anthropic's open-source skills repo.",
    inputExample: "Test the wallet-connect and top-up flow on my dApp",
    outputPreview:
      "▸ 6/7 flows passed\n▸ 1 failure: top-up modal (selector timeout)\n▸ 4 screenshots captured\n▸ Console: 2 warnings, 0 errors",
    pipeline: ["Recon", "Script", "Run", "Report"],
    origin: "anthropics/skills",
    runtime: {
      model: "claude-sonnet-4.6",
      tools: ["playwright.run", "browser.logs", "screenshot"],
      memory: "ephemeral",
      avgLatencyMs: 8400,
      tokenCostCents: 2.8,
    },
    zh: {
      title: "Web 应用测试 Agent",
      shortDescription:
        "驱动 Playwright 跑通前端流程,自动截图并读取浏览器日志,直接定位失败的那一步。源自 Anthropic 开源技能库。",
      inputExample: "测一下我这个 dApp 的连接钱包和充值流程",
      outputPreview:
        "▸ 6/7 条流程通过\n▸ 1 处失败:充值弹窗(selector 超时)\n▸ 截图 4 张\n▸ Console:2 条警告,0 条报错",
    },
  },
  {
    id: 14,
    title: "Frontend Design Director",
    creator: "anthropics/skills",
    creatorAvatar: "AS",
    creatorHandle: "anthropics",
    category: "Product",
    rarity: "Epic",
    pricingType: "PerInvoke",
    priceMON: 0.05,
    subscriptionMON: 0.45,
    energyCost: 4,
    shortDescription:
      "Boutique-studio design direction: tokens, type roles, one signature element — explicitly avoids AI-template aesthetics. From Anthropic's skills repo.",
    inputExample: "Design direction for a retro trading-card marketplace",
    outputPreview:
      "▸ Palette: 5 tokens (paper/ink/ember)\n▸ Type: display + mono pairing\n▸ Signature: holo-foil card tilt\n▸ Critique pass: 2 generic patterns removed",
    pipeline: ["Brief", "Plan", "Critique", "Spec"],
    origin: "anthropics/skills",
    runtime: {
      model: "claude-opus-4.7",
      tools: ["design.tokens", "critique.pass"],
      memory: "ephemeral",
      avgLatencyMs: 4100,
      tokenCostCents: 2.1,
    },
    zh: {
      title: "前端设计总监",
      shortDescription:
        "给出精品工作室水准的设计方向:色彩 token、字体分工、一个招牌元素,并主动剔除 AI 模板味。源自 Anthropic 开源技能库。",
      inputExample: "给一个复古交易卡市场定个设计方向",
      outputPreview:
        "▸ 配色:5 个 token(paper/ink/ember)\n▸ 字体:display + mono 搭配\n▸ 招牌元素:holo-foil 卡面倾斜\n▸ 自审一轮:剔除 2 处套路化设计",
    },
  },
  {
    id: 15,
    title: "Skill Creator",
    creator: "anthropics/skills",
    creatorAvatar: "AS",
    creatorHandle: "anthropics",
    category: "Automation",
    rarity: "Mythic",
    pricingType: "PerInvoke",
    priceMON: 0.15,
    subscriptionMON: 1.2,
    energyCost: 12,
    shortDescription:
      "The skill that creates skills: interview → draft SKILL.md → benchmark with/without → revise until it wins. Meta-tooling from Anthropic's skills repo.",
    inputExample: "Create a skill that audits ERC-20 approval risks",
    outputPreview:
      "▸ SKILL.md drafted (frontmatter + 4 sections)\n▸ Benchmark: +34% vs baseline (n=12)\n▸ 2 revision loops\n▸ Packaged: erc20-approval-audit.skill",
    pipeline: ["Interview", "Draft", "Benchmark", "Revise"],
    origin: "anthropics/skills",
    runtime: {
      model: "claude-opus-4.7",
      tools: ["skill.scaffold", "eval.bench", "subagent.run"],
      memory: "persistent",
      avgLatencyMs: 11800,
      tokenCostCents: 5.6,
    },
    mintedOf: { current: 0, cap: 80 },
    zh: {
      title: "技能生成器",
      shortDescription:
        "先访谈问清需求，起草 SKILL.md，再跑对照基准测试，一轮轮迭代到跑赢基线。源自 Anthropic 官方 skills 仓库。",
      inputExample: "帮我做一张审计 ERC-20 授权风险的技能卡",
      outputPreview:
        "▸ SKILL.md 已起草（frontmatter + 4 个章节）\n▸ 基准测试：优于基线 +34%（n=12）\n▸ 修订 2 轮\n▸ 已打包：erc20-approval-audit.skill",
    },
  },
  {
    id: 16,
    title: "Ethereum Contract Engineer",
    creator: "prompts.chat",
    creatorAvatar: "PC",
    creatorHandle: "promptschat",
    category: "Web3 Dev",
    rarity: "Legendary",
    pricingType: "PerInvoke",
    priceMON: 0.1,
    subscriptionMON: 0.8,
    energyCost: 8,
    shortDescription:
      "Experienced Ethereum developer persona: writes Solidity with explanations, access control and gas awareness. CC0-imported from prompts.chat.",
    inputExample: "Write a message-board contract: public reads, owner-only writes, update counter",
    outputPreview:
      "▸ Solidity 0.8.x contract (42 lines)\n▸ onlyOwner write guard\n▸ update counter + events\n▸ Deploy & test notes included",
    pipeline: ["Spec", "Write", "Explain"],
    origin: "prompts.chat",
    runtime: {
      model: "gpt-4.1",
      tools: ["sol.compile", "code.write"],
      memory: "ephemeral",
      avgLatencyMs: 3800,
      tokenCostCents: 1.9,
    },
    zh: {
      title: "以太坊合约工程师",
      shortDescription:
        "按资深以太坊开发者的标准写 Solidity，边写边讲清权限控制与 gas 开销。CC0 引自 prompts.chat。",
      inputExample: "写个留言板合约：谁都能读，只有 owner 能写，带更新计数",
      outputPreview:
        "▸ Solidity 0.8.x 合约（42 行）\n▸ onlyOwner 写入权限校验\n▸ 更新计数 + 事件\n▸ 附部署与测试说明",
    },
  },
  {
    id: 17,
    title: "Cyber Security Strategist",
    creator: "prompts.chat",
    creatorAvatar: "PC",
    creatorHandle: "promptschat",
    category: "Web3 Dev",
    rarity: "Epic",
    pricingType: "PerInvoke",
    priceMON: 0.06,
    subscriptionMON: 0.5,
    energyCost: 5,
    shortDescription:
      "Security-specialist persona: threat models your data flows and proposes encryption, monitoring and policy hardening. CC0-imported from prompts.chat.",
    inputExample: "Harden a hot-wallet signing service exposed over HTTP",
    outputPreview:
      "▸ Threat model: 6 attack surfaces\n▸ mTLS + HSM key custody proposed\n▸ 4 detection rules (anomalous signing)\n▸ Policy: rate limits + allowlists",
    pipeline: ["Model", "Harden", "Detect"],
    origin: "prompts.chat",
    runtime: {
      model: "claude-sonnet-4.6",
      tools: ["threat.map", "policy.gen"],
      memory: "ephemeral",
      avgLatencyMs: 3400,
      tokenCostCents: 1.6,
    },
    zh: {
      title: "网络安全策略师",
      shortDescription:
        "顺着你的数据流做威胁建模，给出加密方案、监控规则和收紧策略。CC0 引自 prompts.chat。",
      inputExample: "热钱包签名服务裸跑在 HTTP 上，帮我加固一下",
      outputPreview:
        "▸ 威胁建模：6 处攻击面\n▸ 建议 mTLS + HSM 托管密钥\n▸ 4 条检测规则（异常签名）\n▸ 策略：限流 + 白名单",
    },
  },
  {
    id: 18,
    title: "Data Science Analyst",
    creator: "prompts.chat",
    creatorAvatar: "PC",
    creatorHandle: "promptschat",
    category: "Data",
    rarity: "Rare",
    pricingType: "PerInvoke",
    priceMON: 0.04,
    subscriptionMON: 0.3,
    energyCost: 3,
    shortDescription:
      "Data-scientist persona: mines behavioral datasets for actionable retention and engagement insights. CC0-imported from prompts.chat.",
    inputExample: "Find retention drivers in my dApp's 30-day usage export",
    outputPreview:
      "▸ D7 retention: 21% (+6% for wallet-connected)\n▸ Top driver: first invoke < 5 min\n▸ Churn cohort: gas-fail on first tx\n▸ 3 experiments proposed",
    pipeline: ["Explore", "Model", "Recommend"],
    origin: "prompts.chat",
    runtime: {
      model: "gpt-4o",
      tools: ["df.analyze", "chart.render"],
      memory: "ephemeral",
      avgLatencyMs: 2900,
      tokenCostCents: 1.2,
    },
    zh: {
      title: "数据科学家",
      shortDescription:
        "翻遍行为数据，挖出真正影响留存和活跃的因素，结论能直接拿去做实验。CC0 引自 prompts.chat。",
      inputExample: "分析我 dApp 近 30 天的使用数据，找出影响留存的关键因素",
      outputPreview:
        "▸ D7 留存 21%（连过钱包的用户 +6%）\n▸ 头号因素：5 分钟内完成首次调用\n▸ 流失人群：首笔交易 gas 失败\n▸ 提出 3 个实验方案",
    },
  },
  {
    id: 19,
    title: "RegEx Forge",
    creator: "prompts.chat",
    creatorAvatar: "PC",
    creatorHandle: "promptschat",
    category: "Automation",
    rarity: "Common",
    pricingType: "PerInvoke",
    priceMON: 0.01,
    subscriptionMON: 0.08,
    energyCost: 1,
    shortDescription:
      "Generates copy-paste-ready regular expressions for any pattern — emails, tx hashes, addresses. CC0-imported from prompts.chat.",
    inputExample: "Regex for a checksummed EVM address",
    outputPreview: "▸ ^0x[a-fA-F0-9]{40}$\n▸ variant: strict EIP-55 check note",
    pipeline: ["Parse", "Generate"],
    origin: "prompts.chat",
    runtime: {
      model: "gpt-4o",
      tools: ["regex.gen"],
      memory: "none",
      avgLatencyMs: 800,
      tokenCostCents: 0.2,
    },
    zh: {
      title: "RegEx 正则铸造台",
      shortDescription:
        "生成可直接复制粘贴的正则，邮箱、交易哈希、钱包地址等模式都写得出来。CC0 引自 prompts.chat。",
      inputExample: "给我一个匹配 EIP-55 校验和地址的正则",
      outputPreview:
        "▸ ^0x[a-fA-F0-9]{40}$\n▸ 变体：附 EIP-55 严格校验说明",
    },
  },
  {
    id: 20,
    title: "Tokenomics Model Architect",
    creator: "Kestrel Economics",
    creatorAvatar: "KE",
    creatorHandle: "kestreleconomics",
    category: "Research",
    rarity: "Legendary",
    pricingType: "PerInvoke",
    priceMON: 0.12,
    subscriptionMON: 1.08,
    energyCost: 11,
    shortDescription:
      "Designs token supply, emission curves, and vesting schedules with dilution and runway stress tests.",
    inputExample: "Design tokenomics for a 1B supply perp DEX with 4-year team vesting",
    outputPreview:
      "▸ Supply 1B · team 22%, 4y linear, 1y cliff\n▸ Emission 14% y1 → 4% y4, tail 2%\n✓ TGE float 8.4% · treasury runway 31 months\n✗ Month 13 unlock = 2.7x daily volume, stagger it",
    collectionName: "Token Design Suite",
    pipeline: ["Supply Model", "Emission Sim", "Unlock Stress", "Spec Draft"],
    origin: "LangGraph",
    runtime: {
      model: "claude-opus-4.7",
      tools: ["sim.montecarlo", "sheet.model", "web.search", "chart.render"],
      memory: "persistent",
      avgLatencyMs: 6200,
      tokenCostCents: 3.6,
    },
    zh: {
      title: "代币经济模型师",
      shortDescription:
        "设计代币供应、释放曲线与解锁节奏,并对稀释风险和国库续航做压力测试。",
      inputExample: "为一个 10 亿总量的永续合约 DEX 设计四年归属的代币模型",
      outputPreview:
        "▸ 总量 10 亿 · 团队 22%,4 年线性,1 年悬崖期\n▸ 释放:首年 14% → 第四年 4%,尾部 2%\n✓ TGE 流通 8.4% · 国库续航 31 个月\n✗ 第 13 个月解锁量达日均成交 2.7 倍,建议拆分",
    },
  },
  {
    id: 21,
    title: "DeFi Yield Radar",
    creator: "Basis Point Labs",
    creatorAvatar: "BP",
    creatorHandle: "basispointlabs",
    category: "Data",
    rarity: "Epic",
    pricingType: "PerInvoke",
    priceMON: 0.07,
    subscriptionMON: 0.63,
    energyCost: 7,
    shortDescription:
      "Scans lending, LP, and staking pools for real yield after fees, incentive decay, and impermanent loss.",
    inputExample: "Find the best risk-adjusted USDC yield above 8% APY on Injective",
    outputPreview:
      "▸ 41 pools scanned · 6 pass risk filter\n✓ Neptune USDC lend 11.2% net (TVL $38M)\n▸ Helix INJ/USDC LP 19.4% gross → 12.1% after IL\n✗ Dropped 3 pools: emissions end in 9 days",
    collectionName: "DeFi Alpha Kit",
    pipeline: ["Pull Pools", "Net APY", "Risk Filter", "Rank"],
    origin: "Custom Agent",
    runtime: {
      model: "orchor-router",
      tools: ["defi.pools", "chain.index", "fee.model", "risk.score"],
      memory: "ephemeral",
      avgLatencyMs: 2900,
      tokenCostCents: 1.6,
    },
    zh: {
      title: "DeFi 收益雷达",
      shortDescription:
        "扫描借贷、做市与质押池,扣除手续费、激励衰减与无常损失后给出真实收益。",
      inputExample: "在 Injective 上找出年化 8% 以上、风险可控的 USDC 收益机会",
      outputPreview:
        "▸ 扫描 41 个池 · 6 个通过风险过滤\n✓ Neptune USDC 借贷净收益 11.2%(TVL 3800 万美元)\n▸ Helix INJ/USDC LP 名义 19.4% → 扣除无常损失后 12.1%\n✗ 剔除 3 个池:激励将在 9 天后结束",
    },
  },
  {
    id: 22,
    title: "Airdrop Eligibility Tracer",
    creator: "Sable Signal",
    creatorAvatar: "SS",
    creatorHandle: "sablesignal",
    category: "Data",
    rarity: "Rare",
    pricingType: "PerInvoke",
    priceMON: 0.04,
    subscriptionMON: 0.36,
    energyCost: 4,
    shortDescription:
      "Traces a wallet's interaction footprint across chains and scores it against live airdrop criteria.",
    inputExample: "Check which airdrops my wallet 0x9f3c... still qualifies for",
    outputPreview:
      "▸ 148 txs across 6 chains · 19 protocols touched\n✓ Eligible for 3 of 7 tracked programs\n✗ Short $420 bridge volume on Scroll\n▸ Cheapest path to tier 2: 2 txs, ~$6 gas",
    collectionName: "Onchain Identity Pack",
    pipeline: ["Fetch Txs", "Match Criteria", "Score", "Gap Report"],
    origin: "OpenClaw",
    runtime: {
      model: "gpt-4.1",
      tools: ["chain.scan", "wallet.history", "criteria.match"],
      memory: "none",
      avgLatencyMs: 2100,
      tokenCostCents: 0.9,
    },
    zh: {
      title: "空投资格追踪器",
      shortDescription:
        "追踪钱包在多链上的交互足迹,对照各家空投规则给出资格评分与补足路径。",
      inputExample: "查一下我的钱包 0x9f3c… 还符合哪些空投的资格",
      outputPreview:
        "▸ 6 条链 148 笔交易 · 触达 19 个协议\n✓ 已达标:7 个跟踪项目中的 3 个\n✗ 差距:Scroll 跨链量还差 420 美元\n▸ 升到二档最省路径:2 笔交易,约 6 美元 gas",
    },
  },
  {
    id: 23,
    title: "Subgraph Indexer Builder",
    creator: "Ledger Loom",
    creatorAvatar: "LL",
    creatorHandle: "ledgerloom",
    category: "Web3 Dev",
    rarity: "Epic",
    pricingType: "PerInvoke",
    priceMON: 0.06,
    subscriptionMON: 0.5,
    energyCost: 5,
    shortDescription:
      "Generates a deployable subgraph from any contract ABI: schema, handlers, and Matchstick tests.",
    inputExample: "Build a subgraph for SkillUnlocked events on OrchorCore1155",
    outputPreview:
      "▸ schema.graphql: 4 entities · 11 fields\n▸ 3 event handlers generated (AssemblyScript)\n✓ matchstick tests pass 9/9\n▸ Backfill from block 135633301 · est. 6 min",
    collectionName: "Onchain Builder Kit",
    pipeline: ["Parse ABI", "Model", "Map", "Backfill"],
    origin: "Claude Code",
    runtime: {
      model: "claude-sonnet-4.6",
      tools: ["abi.decode", "graph.codegen", "matchstick.test", "chain.index"],
      memory: "ephemeral",
      avgLatencyMs: 4200,
      tokenCostCents: 1.8,
    },
    zh: {
      title: "子图索引构建器",
      shortDescription:
        "解析合约 ABI,生成可直接部署的子图:实体模型、事件映射与 Matchstick 测试一次到位。",
      inputExample: "为 OrchorCore1155 的 SkillUnlocked 事件生成子图",
      outputPreview:
        "▸ schema.graphql:4 个实体 · 11 个字段\n▸ 生成 3 个事件处理器(AssemblyScript)\n✓ matchstick 测试 9/9 通过\n▸ 自 135633301 区块回补 · 约 6 分钟",
    },
  },
  {
    id: 24,
    title: "Gas Optimization Auditor",
    creator: "Opcode Atelier",
    creatorAvatar: "OA",
    creatorHandle: "opcodeatelier",
    category: "Web3 Dev",
    rarity: "Legendary",
    pricingType: "PerInvoke",
    priceMON: 0.12,
    subscriptionMON: 1,
    energyCost: 9,
    shortDescription:
      "Profiles gas per function, rewrites storage layout, loops, and calldata, then re-runs the tests.",
    inputExample: "Cut gas on the mint and batch transfer paths in OrchorCore1155.sol",
    outputPreview:
      "▸ mintBatch: 214,806 → 148,320 gas (-31%)\n▸ 3 storage slots packed into 1\n✓ 42/42 tests still green after rewrite\n✗ WARN unbounded loop in sweep() left as-is",
    collectionName: "Web3 Dev Security Pack",
    pipeline: ["Profile", "Hotspot", "Rewrite", "Benchmark"],
    origin: "Claude Code",
    runtime: {
      model: "claude-opus-4.7",
      tools: ["forge.snapshot", "evm.trace", "sol.compile", "code.write"],
      memory: "ephemeral",
      avgLatencyMs: 6200,
      tokenCostCents: 3.6,
    },
    zh: {
      title: "Gas 优化审计器",
      shortDescription:
        "逐函数采样 gas 开销,重排存储槽、精简循环与 calldata,改写后自动跑回归测试。",
      inputExample: "优化 OrchorCore1155.sol 里 mint 与批量转账的 gas",
      outputPreview:
        "▸ mintBatch:214,806 → 148,320 gas(-31%)\n▸ 3 个存储槽压缩为 1 个\n✓ 改写后 42/42 测试仍全绿\n✗ 警告:sweep() 中无界循环未改动",
    },
  },
  {
    id: 25,
    title: "Bridge Route Planner",
    creator: "Isthmus Labs",
    creatorAvatar: "IL",
    creatorHandle: "isthmuslabs",
    category: "Web3 Dev",
    rarity: "Rare",
    pricingType: "PerInvoke",
    priceMON: 0.04,
    subscriptionMON: 0.35,
    energyCost: 3,
    shortDescription:
      "Compares bridge routes on liquidity, fees, and finality, then returns the cheapest live route.",
    inputExample: "Move 25k USDC from Arbitrum to Injective with the lowest slippage",
    outputPreview:
      "▸ Best: Wormhole → Astroport · 4m 12s\n▸ Cost 8.40 USDC (0.034%) vs 21.10 direct\n✓ Route liquidity 3.2M · slippage 0.06%\n✗ Skipped 1 route: bridge paused 6h ago",
    collectionName: "Onchain Builder Kit",
    pipeline: ["Quote", "Score", "Simulate"],
    origin: "Custom Agent",
    runtime: {
      model: "gpt-4o",
      tools: ["bridge.quote", "chain.fetch", "route.simulate"],
      memory: "ephemeral",
      avgLatencyMs: 2100,
      tokenCostCents: 0.7,
    },
    zh: {
      title: "跨链路径规划器",
      shortDescription:
        "横向比对各跨链桥的流动性、手续费与确认时长,给出成本最低且未停机的路径。",
      inputExample: "把 25k USDC 从 Arbitrum 跨到 Injective,滑点最低",
      outputPreview:
        "▸ 最优:Wormhole → Astroport · 4 分 12 秒\n▸ 成本 8.40 USDC(0.034%),直桥需 21.10\n✓ 路径流动性 320 万 · 滑点 0.06%\n✗ 排除 1 条:该桥 6 小时前已暂停",
    },
  },
  {
    id: 26,
    title: "Community Ops Copilot",
    creator: "Lantern Loop Studio",
    creatorAvatar: "LL",
    creatorHandle: "lanternloop",
    category: "Marketing",
    rarity: "Rare",
    pricingType: "PerInvoke",
    priceMON: 0.04,
    subscriptionMON: 0.36,
    energyCost: 3,
    shortDescription:
      "Triages Discord and Telegram threads, drafts mod replies, and flags churn signals daily.",
    inputExample: "Summarize the last 24h in our Discord and draft replies to the 5 most urgent threads.",
    outputPreview:
      "▸ 412 messages scanned across 6 channels / 24h\n✓ 5 reply drafts queued — 3 support, 2 partnership\n✗ #bug-reports: 9 threads unanswered >6h, sentiment -0.42\n▸ Churn risk: 4 core holders went quiet after the fee change thread",
    collectionName: "Growth Ops Series",
    pipeline: ["Ingest threads", "Cluster topics", "Score sentiment", "Draft replies"],
    origin: "OpenClaw",
    runtime: {
      model: "claude-sonnet-4.6",
      tools: ["discord-api", "telegram-bot", "sentiment-scan", "notion-sync"],
      memory: "persistent",
      avgLatencyMs: 9400,
      tokenCostCents: 3.6,
    },
    zh: {
      title: "社区运营副驾",
      shortDescription:
        "扫描 Discord 与 Telegram 讨论串，分流话题、起草管理员回复，并标出成员流失的早期信号。",
      inputExample: "汇总过去 24 小时 Discord 的讨论，并为最紧急的 5 个话题起草回复。",
      outputPreview:
        "▸ 24 小时内扫描 6 个频道、412 条消息\n✓ 已生成 5 条回复草稿 —— 3 条答疑，2 条合作\n✗ #bug-reports：9 个话题超 6 小时无人回应，情绪值 -0.42\n▸ 流失预警：手续费调整贴之后，4 位核心持币者停止发言",
    },
  },
  {
    id: 27,
    title: "X Longform Post Writer",
    creator: "Blue Hour Copy",
    creatorAvatar: "BH",
    creatorHandle: "bluehourcopy",
    category: "Marketing",
    rarity: "Common",
    pricingType: "PerInvoke",
    priceMON: 0.02,
    subscriptionMON: 0.18,
    energyCost: 1,
    shortDescription:
      "Turns a rough idea into a 900-word X post with a tested hook, proof beats, and a closer.",
    inputExample: "Write a longform X post about why most AI agent startups die at the distribution stage.",
    outputPreview:
      "▸ Draft ready: 912 words, 7 beats, reading level 8.2\n✓ Hook scored 84/100 — the claim lands in the first 180 chars\n✓ 3 proof points with hard numbers, 1 counterexample kept\n✗ Cut 2 buzzword lines flagged as low-signal filler",
    collectionName: "Growth Ops Series",
    pipeline: ["Sharpen angle", "Outline beats", "Draft longform", "Score hook"],
    origin: "prompts.chat",
    runtime: {
      model: "gpt-4.1",
      tools: ["x-api", "web-search", "hook-scorer"],
      memory: "ephemeral",
      avgLatencyMs: 5200,
      tokenCostCents: 1.4,
    },
    zh: {
      title: "X 长推文撰稿人",
      shortDescription:
        "把粗略想法扩写成 900 字 X 长推文，配好实测过的钩子、论据节奏与收尾金句。",
      inputExample: "写一篇 X 长推文，讲为什么多数 AI Agent 创业公司都死在分发环节。",
      outputPreview:
        "▸ 初稿完成：912 字，7 个段落节奏，阅读难度 8.2\n✓ 钩子评分 84/100 —— 前 180 字已把观点讲透\n✓ 保留 3 个带硬数据的论据 + 1 个反例\n✗ 删掉 2 句被判定为低信号的套话",
    },
  },
  {
    id: 28,
    title: "Pitch Deck Architect",
    creator: "Northgate Deck Lab",
    creatorAvatar: "ND",
    creatorHandle: "northgatedecklab",
    category: "Product",
    rarity: "Epic",
    pricingType: "PerInvoke",
    priceMON: 0.07,
    subscriptionMON: 0.63,
    energyCost: 6,
    shortDescription:
      "Structures a seed or Series A deck slide by slide, with narrative arc and metric callouts.",
    inputExample: "Build a Series A deck outline for our onchain agent marketplace, 18 months post-launch.",
    outputPreview:
      "▸ 14 slides mapped — problem to ask, three-act arc\n✓ TAM 4.2B / SAM 780M sourced, sizing method shown on slide 5\n✓ Traction slide: 3 metrics kept, 11 cut as noise\n✗ Missing: net revenue retention and the cohort chart on slide 9",
    collectionName: "Founder Stack",
    pipeline: ["Frame narrative", "Size market", "Select metrics", "Draft slides"],
    origin: "Claude Code",
    runtime: {
      model: "claude-opus-4.7",
      tools: ["market-sizing", "financial-model", "deck-builder", "web-search"],
      memory: "persistent",
      avgLatencyMs: 21000,
      tokenCostCents: 9.8,
    },
    zh: {
      title: "融资路演架构师",
      shortDescription:
        "逐页搭建种子轮或 A 轮 BP 框架，理顺叙事主线，并挑出真正该讲的核心指标。",
      inputExample: "为我们的链上 Agent 市场做一份 A 轮 BP 大纲，产品上线已 18 个月。",
      outputPreview:
        "▸ 已规划 14 页 —— 从问题到融资诉求，三幕式叙事\n✓ TAM 42 亿 / SAM 7.8 亿，测算口径写在第 5 页\n✓ 增长数据页：保留 3 个关键指标，砍掉 11 个噪音指标\n✗ 缺口：净收入留存率，以及第 9 页的分群留存图",
    },
  },
  {
    id: 29,
    title: "Technical Doc Writer",
    creator: "Inkbase Labs",
    creatorAvatar: "IL",
    creatorHandle: "inkbaselabs",
    category: "Product",
    rarity: "Common",
    pricingType: "PerInvoke",
    priceMON: 0.015,
    subscriptionMON: 0.14,
    energyCost: 2,
    shortDescription:
      "Turns source files and diffs into README, API reference, and changelog entries in one pass.",
    inputExample: "Write API docs for the payments module in src/api/payments.ts",
    outputPreview:
      "▸ Scanned 14 files · 38 exported functions\n✓ README.md rewritten — 6 sections, 12 runnable samples\n✓ API reference generated for 31/38 exports\n✗ 7 functions missing param docs — flagged inline",
    collectionName: "Engineering Ops",
    pipeline: ["Parse source", "Extract signatures", "Draft sections", "Lint examples"],
    origin: "Claude Code",
    runtime: {
      model: "claude-sonnet-4.6",
      tools: ["file-reader", "ast-parser", "markdown-writer"],
      memory: "ephemeral",
      avgLatencyMs: 9400,
      tokenCostCents: 1.8,
    },
    zh: {
      title: "技术文档生成器",
      shortDescription:
        "读取源码与提交差异，一次产出 README、API 参考和变更日志条目。",
      inputExample: "给 src/api/payments.ts 支付模块写一份 API 文档",
      outputPreview:
        "▸ 已扫描 14 个文件 · 38 个导出函数\n✓ README.md 已重写 —— 6 个章节，12 段可运行示例\n✓ 31/38 个导出已生成 API 参考\n✗ 7 个函数缺少参数说明 —— 已就地标注",
    },
  },
  {
    id: 30,
    title: "Bug Triage Router",
    creator: "Pager Nine Studio",
    creatorAvatar: "PN",
    creatorHandle: "pagernine",
    category: "Automation",
    rarity: "Rare",
    pricingType: "PerInvoke",
    priceMON: 0.04,
    subscriptionMON: 0.36,
    energyCost: 3,
    shortDescription:
      "Classifies incoming bug reports by severity, dedupes against open issues, and assigns an owner.",
    inputExample: "Triage the 23 issues opened in our repo since Friday",
    outputPreview:
      "▸ 23 reports processed · 6 merged as duplicates\n✓ 4 tagged P0 — auth session drop, routed to core-platform\n✓ 13 labeled and assigned by CODEOWNERS match\n✗ 2 lack repro steps — auto-replied with template",
    collectionName: "Engineering Ops",
    pipeline: ["Normalize reports", "Cluster duplicates", "Score severity", "Route to owner"],
    origin: "LangGraph",
    runtime: {
      model: "gpt-4.1",
      tools: ["issue-tracker", "vector-search", "webhook-dispatch"],
      memory: "persistent",
      avgLatencyMs: 16800,
      tokenCostCents: 3.6,
    },
    zh: {
      title: "Bug 分诊调度器",
      shortDescription:
        "按严重程度为新提交的缺陷定级，与未关闭 issue 去重，并自动指派负责人。",
      inputExample: "把仓库里周五之后新开的 23 个 issue 做一次分诊",
      outputPreview:
        "▸ 已处理 23 条报告 · 6 条合并为重复项\n✓ 4 条标记 P0 —— 登录会话掉线，转交 core-platform 组\n✓ 13 条按 CODEOWNERS 匹配打标并指派\n✗ 2 条缺少复现步骤 —— 已自动回复模板",
    },
  },
  {
    id: 31,
    title: "SQL Query Architect",
    creator: "Cardinal Row Labs",
    creatorAvatar: "CR",
    creatorHandle: "cardinalrow",
    category: "Data",
    rarity: "Mythic",
    pricingType: "PerInvoke",
    priceMON: 0.19,
    subscriptionMON: 1.71,
    energyCost: 13,
    shortDescription:
      "Rewrites slow SQL into indexed, plan-verified queries and reports the cost delta per run.",
    inputExample: "This nightly revenue rollup takes 47 minutes on Postgres, make it faster",
    outputPreview:
      "▸ Parsed 312-line query · 9 joins · 3 correlated subqueries\n✓ Rewrite drops planner cost 1.8M → 61K (-96%)\n✓ Index on orders(created_at, tenant_id) — 47min → 1m52s\n✗ 1 rewrite changes NULL ordering — verify before ship",
    collectionName: "Engineering Ops",
    pipeline: ["Parse plan", "Detect anti-patterns", "Rewrite query", "Benchmark delta"],
    origin: "Custom Agent",
    runtime: {
      model: "claude-opus-4.7",
      tools: ["explain-analyze", "schema-introspect", "index-advisor", "query-bench"],
      memory: "persistent",
      avgLatencyMs: 31500,
      tokenCostCents: 9.4,
    },
    mintedOf: { current: 0, cap: 88 },
    zh: {
      title: "SQL 查询优化师",
      shortDescription:
        "把慢查询重写为走索引、经执行计划验证的 SQL，并给出每次运行的成本差值。",
      inputExample: "这个跑 47 分钟的每夜营收汇总在 Postgres 上太慢了，帮我优化",
      outputPreview:
        "▸ 已解析 312 行查询 · 9 处 JOIN · 3 个关联子查询\n✓ 重写后计划成本 1.8M → 61K（-96%）\n✓ 建议在 orders(created_at, tenant_id) 建索引 —— 47 分钟 → 1 分 52 秒\n✗ 1 处重写改变了 NULL 排序 —— 上线前需核对",
    },
  },
];

export const DEFAULT_SELECTED_IDS = [0, 1, 10];
