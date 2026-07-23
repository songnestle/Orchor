# Orchor

**The Capital Market for Machine Intelligence — built on Injective**
**AI 能力的资本市场 —— 构建于 Injective**

> Turn AI Agent capabilities into collectible, executable, tradable **Skill Cards** — registered, priced and settled on-chain on **Injective**.
>
> 把 AI Agent 的能力封装成可收藏、可执行、可交易的**技能卡** —— 在 **Injective** 上注册、定价、结算。

🌐 **Live Demo:** [orchor.webpsy.net](https://orchor.webpsy.net)
🏆 **Built for:** Injective Nova Program — *Injective × Microsoft × Web3Labs*
⛓️ **Contract (Injective Testnet, chainId 1439):** [`0xc5DBA06ECdb428f5072a12CEc61cd544BFe54078`](https://testnet.blockscout.injective.network/address/0xc5DBA06ECdb428f5072a12CEc61cd544BFe54078)

> **Injective financialized assets. Orchor financializes intelligence.**
> **Injective 金融化了资产，Orchor 金融化了智能。**

---

## ⚡ Verify It On-Chain / 链上验证

Everything marked **LIVE** in this document is on-chain right now and takes about a minute to reproduce:

1. Open the [verified contract source on Blockscout](https://testnet.blockscout.injective.network/address/0xc5DBA06ECdb428f5072a12CEc61cd544BFe54078#code) — `OrchorCore.sol` is verified, so `registerSkill`, `hasAccess` and `_splitRevenue` are readable as source, not bytecode
2. Read `nextSkillId` → returns **20** (twenty Skill Cards registered on-chain)
3. Read `getSkill(1)` → `"Solidity Security Scanner"`, Mythic, mint cap 100, priced in INJ
4. Read `CREATOR_BPS / PLATFORM_BPS / ONCHAIN_BPS` → **7000 / 2500 / 500** — the 70/25/5 revenue split is a contract constant, not a promise
5. Visit [orchor.webpsy.net](https://orchor.webpsy.net), connect a wallet — it auto-switches to Injective Testnet (EVM chainId 1439)

打开 Blockscout 合约页（源码已验证开源）→ 读 `nextSkillId` 得 20 → 读 `getSkill(1)` 看到链上注册的技能卡 → 读分账常量 7000/2500/500 → 打开网站连钱包自动切到 Injective 测试网。**全部可复现。**

---

## 🎯 The Problem / 问题

As AI Agents become the core interface of Web3, two groups are both stuck:

**🎨 Skill creators can't get paid.**
Countless prompt engineers, researchers, and Agent builders craft powerful AI skills — but there's no way to monetize them. A brilliant VC-research agent or a battle-tested contract auditor stays trapped in one person's private toolkit, earning nothing.

**🔍 Users can't find good skills.**
Everyone knows AI can do amazing things, but *which* prompt, *which* workflow, *which* agent actually delivers? Users waste hours reinventing wheels because there's no trusted marketplace to discover, rate, and instantly run proven skills.

And beneath both: **AI capabilities have real value, but no market — and therefore no price.** Nobody can tell you what a world-class contract-auditing agent is *worth*, because nowhere on earth does one trade.

当 AI Agent 成为 Web3 的核心入口：**创作者拿不到收益，用户找不到优质技能**。而更底层的问题是——**AI 能力有真实价值，却没有市场，因此没有价格**。没有人能说清一个顶级合约审计 Agent 值多少钱，因为世界上没有任何地方在交易它。

> **The capability exists. The creators exist. The demand exists. What's missing is the market — and the chain built to clear it.**
> **能力存在，创作者存在，需求存在。缺的是市场 —— 和那条为清算市场而生的链。**

---

## 💡 What is Orchor / 什么是 Orchor

Orchor is an **AI Skill Runtime Economy**. It packages AI Agent capabilities — research, auditing, marketing, on-chain analysis — into **executable Skill Cards**, registers them on Injective, and gives creators a way to earn and users a place to discover.

- **For creators / 对创作者:** publish a skill once (`registerSkill`) → earn per-use revenue forever, with an automatic **70 / 25 / 5** split enforced on-chain. 发布一次技能 → 按次持续赚取收益，链上自动分账。
- **For users / 对用户:** browse a marketplace of rated skills → top up **⚡ Energy** with INJ (`1 INJ = 100 ⚡`) → unlock, subscribe, and invoke any skill, every action logged on-chain. 用 INJ 充值 Energy → 解锁 / 订阅 / 调用，每一步上链。
- **For the market / 对市场:** rarity tiers (Common → Mythic) with on-chain mint caps make scarce skills **scarce on-chain** — the precondition for real price discovery. 稀有度与链上限量，为真实价格发现创造前提。

> Orchor is to AI Agents what an app store is to Apps — but every capability is a card you can **own, trade, and one day list on an order book**.
> Orchor 之于 AI Agent，就像应用商店之于 App —— 但每个能力都是一张可以**拥有、交易、并终将挂上订单簿**的卡。

---

## ✅ What's LIVE Today / 已实现（链上可验证）

The full on-chain loop runs on **Injective Testnet** — verifiable on Blockscout, not a mockup:

```
Top up Energy (INJ)  →  Unlock / Subscribe skill  →  Invoke (spend Energy)
   用 INJ 充值 Energy       解锁 / 订阅技能               调用（消耗 Energy）
        │                                                    │
        └──────────  Revenue split 70/25/5 on-chain  ◄───────┘
                       链上自动分账 70/25/5
```

- ✅ `OrchorCore` deployed to **Injective Testnet** (native EVM / MultiVM, chainId 1439)
- ✅ **20 Skill Cards registered on-chain** — 5 rarity tiers, 8 imported from the open-source skills ecosystem, Mythic cards mint-capped (50 / 100) at the contract level
- ✅ On-chain **Energy** ledger (`topUpEnergy`, `1 INJ = 100 ⚡`)
- ✅ One-time **unlock** + 30-day **subscription** access models, enforced by `hasAccess`
- ✅ On-chain **invocation** with `SkillInvoked(user, skillId, energySpent, inputHash)` events — every AI run leaves an auditable on-chain trail
- ✅ Automatic **70% creator / 25% platform / 5% on-chain reserve** split (`_splitRevenue`, basis-point constants)
- ✅ Multi-chain **Credits top-up** on-ramp (Injective / TRON / Base / Ethereum) for stablecoin users
- ✅ 10+ pages, holographic retro card UI, **EN/中 bilingual**, deployed with HTTPS on production

---

## ⛓️ Why Injective / 为什么必须是 Injective

Orchor is a settlement-heavy, high-frequency product whose endgame is a **market**. Injective is the only L1 whose native primitives match every stage of that endgame:

| Injective primitive | What Orchor builds on it |
|---------------------|--------------------------|
| **Native EVM (MultiVM, chainId 1439)** | `OrchorCore.sol` deploys unchanged — Solidity + wagmi/viem, zero rewrite. **LIVE today.** |
| **Sub-second finality, sub-cent gas** | Per-invocation on-chain logging is economically viable — every AI run is a real transaction. **LIVE today.** |
| **Native on-chain orderbook (CLOB)** | Skill Cards get real bid/ask and price discovery — no other L1 has this natively. *(Blueprint §1)* |
| **Burn Auction** | Orchor's platform fees can join the weekly INJ burn — every AI call contributes to deflation. *(Blueprint §3)* |
| **iAgent SDK / AI-native stack** | Injective agents rent Orchor skills mid-task and pay autonomously — M2M economy. *(Blueprint §4)* |
| **MultiVM Token Standard (MTS)** | ⚡ Energy as a cross-VM asset usable from both EVM and WASM sides. *(Blueprint §6)* |
| **RWA / tokenization track record** | Injective already trades tokenized equities & FX — skill revenue-streams are the next asset class. *(Blueprint §2)* |

**We didn't bolt AI onto a chain — we are building the skill economy on the only chain designed to clear it.**
**我们没有把 AI 硬套到链上 —— 我们把技能经济建在唯一为清算它而生的链上。**

---

## 🚀 The Injective Blueprint — Six Deep Integrations / 深度结合 Injective 的六大创新蓝图

> Status legend: **LIVE** = on-chain now · **NEXT** = next engineering phase · **VISION** = designed, sequenced on the roadmap.
> 状态标注：**LIVE** 已上链 · **NEXT** 下一阶段开发 · **VISION** 已设计、按路线图推进。

### §1 · Skill Cards on the Native Orderbook — "The Nasdaq for AI Capabilities" 【NEXT】
### 技能卡上原生订单簿 —— AI 能力的纳斯达克

Injective is the only L1 with a **native central limit order book**. We list mint-capped Skill Cards (Mythic: 50/100 supply, already enforced on-chain today) as tradable assets on that orderbook:

- Real **bid/ask spreads, limit orders, and depth** for AI capabilities — not an AMM approximation
- A skill's price chart becomes the market's live valuation of that AI capability
- Injective's **frequent batch auctions** make card markets MEV-resistant by construction
- Floor prices and volume become the first **objective quality signal** for AI skills — better than star ratings, because it's capital voting

为什么重要：AI 能力第一次获得**公允价格发现**。一张 "Solidity Security Scanner"（Mythic，限量 100，今天已在链上强制执行）的价格曲线，就是市场对这个 AI 能力的实时定价。订单簿、限价单、深度图——这只有 Injective 的原生 CLOB 能做到；其他链最多给你一个 AMM 池。

### §2 · Revenue-Share Tokenization — "AI Skills as Cash-Flow RWAs" 【VISION】
### 技能收益权代币化 —— 会产生现金流的 AI 资产

`OrchorCore` already routes **70% of every unlock and subscription to the creator, forever** — that is a genuine on-chain cash-flow stream. The next step is to financialize it:

- Creators tokenize a slice of future skill revenue (e.g. sell 20% of future income) via Injective's **TokenFactory** — an **IPO for an AI skill**
- Revenue-share tokens trade on the orderbook (§1); holders receive their pro-rata share of the on-chain split automatically
- Bundle top skills into a **Skill Index** — one asset giving exposure to the whole AI-skill economy, iAssets-style

Injective already brought equities and FX on-chain. **The next asset class is intelligence itself.** A skill with provable, on-chain, per-invocation income is a *better-audited* cash-flow asset than most RWAs: its entire revenue history is public by construction (`SkillUnlocked` / `SkillSubscribed` / `RevenueSplit` events).

为什么重要：合约里 70% 收益永久归创作者，这本质上是一条**链上现金流**。把未来收益权代币化，创作者可以像 IPO 一样为技能融资；收益权在订单簿交易；打包成技能指数就是 AI 版 iAssets。Injective 已经把股票和外汇搬上链——**下一个资产类别，就是智能本身**。而且技能的全部收入历史天然公开在事件日志里，比绝大多数 RWA 更可审计。

### §3 · Burn Auction Alignment — "Every AI Call Burns INJ" 【NEXT】
### 接入 Burn Auction —— 每一次 AI 推理，都在燃烧 INJ

Injective's weekly **Burn Auction** lets ecosystem dApps contribute revenue to be auctioned for INJ that is then burned. Orchor commits its **25% platform share** (a bps constant in the contract today) to the burn-auction basket:

- Every `unlockSkill` / `subscribeSkill` / `invokeSkill` → platform fee → weekly burn
- Orchor's growth becomes **structurally deflationary for INJ**
- One sentence for the ecosystem: **"Every AI inference burns INJ."**

为什么重要：平台 25% 分成（今天已是合约常量）进入 Injective 每周销毁拍卖。Orchor 的增长与 INJ 的通缩**结构性绑定**——AI 调用越多，INJ 烧得越多。这是对 Injective 代币经济最直接的贡献承诺。

### §4 · iAgent Machine-to-Machine Economy — "Agents Hiring Agents" 【NEXT】
### iAgent 机器对机器经济 —— Agent 雇佣 Agent

Injective's **iAgent SDK** puts autonomous agents on-chain. Orchor gives them something to hire:

- An iAgent executing a trading strategy rents Orchor's *Contract Risk Explainer* mid-task, pays in INJ, gets the audit, then places its order — **fully autonomous, sub-second settlement per hop**
- Our per-invoke billing (`invokeSkill` + Energy) is *already* machine-shaped: no seats, no subscriptions required, no human in the loop
- Roadmap includes **x402 (HTTP 402) machine payments**, so any agent on the internet can pay per skill call over plain HTTP, settled to Injective

为什么重要：AI Agent 之间互相租用能力、自动付费——真正的 **M2M 经济**，Injective 是清算层。我们的按次计费模型天生是为机器设计的：没有席位、不需要订阅、不需要人在场。这正是「AI 原生 Web3」的字面意思。

### §5 · Skill Staking — "Financializing Trust in AI" 【VISION】
### 技能质押保证金 —— 把 AI 的可信度金融化

The hardest problem in AI markets is quality assurance. Orchor's answer is financial, not editorial:

- Creators **stake INJ behind their skill** as a quality bond
- Verifiably bad output (oracle-checked / dispute-voted) → bond slashed, user compensated
- Stake size becomes a public, costly signal of creator confidence — **skin in the game for AI quality**, using the same financial-infrastructure DNA as Injective's insurance-fund module

为什么重要：AI 市场最难的是质量保证。我们的答案不是人工审核，而是金融机制：创作者为技能质押 INJ 作保证金，劣质输出被罚没赔付用户。质押量成为公开的、有成本的质量信号——**第一次让 AI 的质量承诺有真金白银背书**。

### §6 · Energy as an MTS Asset — "One Economy, Both VMs" 【VISION】
### Energy 成为 MTS 资产 —— 一个经济体，横跨双虚拟机

⚡ Energy today lives inside `OrchorCore` on the EVM side. With Injective's **MultiVM Token Standard**, Energy becomes a first-class cross-VM asset:

- CosmWasm-side agents and dApps hold and spend the *same* Energy as EVM users — one skill economy across both VMs
- IBC opens the door for **any Cosmos-ecosystem agent** to invoke Orchor skills — Orchor as the AI-skill hub of the interchain

为什么重要：借助 MTS，Energy 从 EVM 内部账本升级为横跨 EVM/WASM 的一等资产，Cosmos 生态的任何 agent 都能经 IBC 调用 Orchor 技能——Orchor 成为跨链世界的 AI 技能枢纽。

### §7 · Skill Battles as Prediction Markets — "Watch AI Compete, Trade the Outcome" 【VISION】
### 技能对战预测市场 —— 围观 AI 竞技，交易比赛结果

Orchor already ships a **Battle Arena** (live in the product today): two Skill Cards face off on the same task, and outputs are compared head-to-head. Injective turns spectation into a market:

- Each battle spawns a **binary outcome market** on Injective's orderbook — spectators take positions on which skill wins
- Injective's **frequent batch auctions** make these micro-markets manipulation-resistant; its **native oracle module** carries the judged result on-chain for settlement
- Battle records accumulate into an **on-chain Elo** per skill — a price-relevant, provable performance history that feeds back into card valuation (§1) and revenue-share pricing (§2)

为什么重要：产品里**已经有 Battle 竞技场页面**——两张技能卡同题对战、输出对比。接上 Injective 后，每场对战生成一个订单簿上的二元结果市场，观众可以对"哪个 AI 赢"下注；原生预言机把裁决结果带上链结算；对战积累出每张卡的**链上 Elo 等级分**，成为可证明的性能履历，反哺卡价（§1）与收益权定价（§2）。竞技 → 数据 → 定价，闭环成立。

### §8 · Task Orderbook — "Post a Bounty, Let Skills Bid" 【VISION】
### 任务订单簿 —— 发布悬赏，让技能来竞标

Flip the marketplace: instead of users browsing skills, **tasks come to the market and skills compete for them**:

- A user (or an agent) posts a task with a bounty in INJ — "audit this contract, 0.5 INJ"
- Qualified skills (matched by category + on-chain Elo from §7) **bid in a reverse auction**; lowest credible bid wins execution
- This is a **labor market for machine intelligence**, cleared the same way Injective clears any market — by its matching engine, not a middleman

为什么重要：把市场反过来——不是人找技能，而是**任务进场、技能竞价**。用户或 agent 发布带 INJ 悬赏的任务，符合条件的技能按链上 Elo 资质进入反向拍卖，最低可信报价成交。这就是**机器智能的劳动力市场**，用 Injective 的撮合引擎清算，而不是靠平台中介抽成定价。

---

## 📦 The `.or` Package — A Sealed, Executable Skill Format
## `.or` 封装 —— 密封可执行的技能格式

A skill's real IP is its prompt, examples and tool wiring. If those leak, the asset is worthless — so the `.or` format splits every skill into a **public manifest** and a **sealed payload**:

技能的真正 IP 是它的 prompt、示例与工具编排。这些一旦泄露，资产就一文不值 —— 所以 `.or` 格式把每个技能拆成**公开清单**与**密封载荷**两层：

```
or:solidity-security-scanner@1.2.1
├── manifest        # PUBLIC — name, creator, category, rarity, version
├── runtime         # PUBLIC — model, tools, memory, latency
├── economics       # PUBLIC — energy cost, 70/25/5 bps (mirrors contract)
├── permissions     # PUBLIC — network / filesystem / onchain_write flags
├── onchain         # PUBLIC — Injective chain id, skillId, mint cap
├── signature       # PUBLIC — creator's signature over the manifest
└── payload         # SEALED — system prompt, few-shot examples, tool configs
```

**How the sealing works / 密封机制** — status-labelled like everything else:

1. **【LIVE】Prompt isolation / Prompt 隔离** — skill system prompts never ship to the browser. They live server-side only (`src/lib/runtime/skill-prompts.ts`); the client bundle contains catalog metadata, nothing executable. 系统 prompt 只存在于运行时服务端，前端 bundle 里没有任何可执行 IP。
2. **【LIVE】Manifest + on-chain anchor / 清单与链上锚定** — every skill's public manifest (the `.or Package` tab in the product) carries its Injective `chain_id`, `skillId` and mint data; economics mirror the contract's bps constants. 产品内可见的 `.or` 清单与链上数据一一对应。
3. **【NEXT】Envelope encryption / 信封加密** — the creator encrypts the payload locally (AES-256-GCM); the content key is wrapped to the runtime's enclave key (TEE attestation). Neither Orchor's web tier nor the database ever sees plaintext. 创作者本地加密载荷，内容密钥只封装给运行时飞地——平台自身也看不到明文。
4. **【NEXT】On-chain key release / 链上门控解封** — the runtime unseals a payload **only after** `OrchorCore.hasAccess(user, skillId)` passes on Injective, and each unseal is tied to an `invokeSkill` tx. Access control isn't a database row — it's the chain. 解封前必须通过链上 `hasAccess` 校验，每次解封绑定一笔 `invokeSkill` 交易——权限不是数据库字段，而是链本身。
5. **【NEXT】Integrity anchoring / 完整性锚定** — `keccak256(payload)` is committed at `registerSkill` time; the runtime refuses payloads whose hash doesn't match the chain. Creators sign manifests with EIP-712. 载荷哈希注册时上链，运行时拒绝执行哈希不匹配的载荷。
6. **【VISION】Threshold unsealing / 门限解封** — replace the single TEE with t-of-n threshold decryption across independent runtime nodes, so no single party ever holds a complete key. 用 t-of-n 门限解密替代单一 TEE，任何单方都拿不到完整密钥。

> **Why it matters for the market / 为什么这对市场重要:** revenue-share tokens (§2) and orderbook prices (§1) are only meaningful if the underlying asset can't be copied for free. The `.or` seal is what makes a skill **scarce enough to price**. 收益权与订单簿定价成立的前提，是底层资产不能被免费复制 —— `.or` 密封正是让技能**稀缺到可以定价**的那一层。

---

## 🗺️ Roadmap — Three-Stage Ladder / 路线图三级火箭

| Stage | Milestone | Injective primitive |
|-------|-----------|---------------------|
| **Now · LIVE** | Skill registry, Energy economy, 70/25/5 split, 12 cards on testnet | Native EVM, sub-second finality |
| **Stage 1 · Market** | Mainnet (chainId 1776) · orderbook listing for mint-capped cards (§1) · burn-auction contribution (§3) · x402 + iAgent pilots (§4) | CLOB, Burn Auction, iAgent |
| **Stage 2 · Capital** | Revenue-share tokenization & Skill Index (§2) · skill staking bonds (§5) · MTS Energy + IBC reach (§6) | TokenFactory, iAssets pattern, MTS, IBC |
| **Stage 3 · Arena** | Battle prediction markets + on-chain skill Elo (§7) · task orderbook / reverse auctions (§8) | CLOB micro-markets, FBA, oracle module |

**Microsoft angle / 微软协同:** the hosted skill runtime moves onto **Azure** inference (Nova Program Azure credits) — **"Azure computes, Injective clears."** 托管运行时迁移到 Azure 算力——**「Azure 负责算，Injective 负责清算」**。

---

## 🔀 Architecture — On-chain where it counts / 架构：该上链的上链

Orchor is a **hybrid architecture**: the skill economy is on-chain on Injective; a thin off-chain layer keeps the AI runtime fast.

**1. Skill ownership & economy → Injective / 技能确权与经济 → Injective**
`registerSkill`, `unlockSkill`, `subscribeSkill`, `invokeSkill`, `topUpEnergy` and the 70/25/5 `_splitRevenue` all run in `OrchorCore.sol` on Injective. A skill is a verifiable on-chain asset.

**2. Fiat on-ramp → multi-chain / 法币入口 → 多链**
Users who prefer stablecoins top up **Credits** from Injective, TRON, Base, or Ethereum. Money enters and leaves on-chain; the Credits ledger is an off-chain convenience layer.

**3. AI execution → hosted runtime / AI 执行 → 托管运行时**
Skill inference runs on a hosted runtime (Azure on the roadmap; no API keys for the user). Result hashes are logged on-chain via `invokeSkill` — an auditable inference trail.

> **On-chain for ownership, pricing & settlement. Off-chain only for raw model inference. Best of both.**
> **链上做确权、定价与结算；链下只做模型推理。取两者所长。**

```
┌──────────────────────────────────────────────────┐
│  Frontend (Next.js 14 · wagmi/viem · RainbowKit)  │
│  retro holographic cards · EN/中 i18n             │
└───────────────┬───────────────────┬──────────────┘
                │                   │
        on-chain calls          API layer
                │                   │
     ┌──────────▼─────────┐   ┌─────▼──────────────┐
     │  OrchorCore.sol    │   │  Credits Ledger    │
     │  Injective Testnet │   │  (Prisma/Postgres) │
     │  chainId 1439      │   │  + Payment Adapters│
     └────────┬───────────┘   └────────────────────┘
              │  next: orderbook listing · burn auction
              ▼         revenue-share tokens · iAgent
     ┌────────────────────────────────────────────┐
     │  Injective financial primitives            │
     │  CLOB · Burn Auction · TokenFactory · MTS  │
     └────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Chain:** Injective Testnet — native EVM / MultiVM (chainId 1439) · Solidity 0.8.24 · Hardhat
- **Web3:** wagmi v2 · viem · RainbowKit
- **Frontend:** Next.js 14 (App Router) · TypeScript · Tailwind · Framer Motion
- **Backend:** Next.js API Routes · Prisma · PostgreSQL
- **Payments:** multi-chain Credits on-ramp (Injective / TRON / Base / Ethereum)

---

## 🚀 Run Locally

```bash
npm install
cp .env.example .env.local          # set DATABASE_URL + NEXT_PUBLIC_ORCHOR_CORE_ADDRESS
npx prisma generate && npx prisma db push
npm run dev                         # → http://localhost:3000

# Contracts (Injective Testnet)
npx hardhat compile
npm run deploy:orchor:injective     # needs INJECTIVE_PRIVATE_KEY funded with testnet INJ
```

Get testnet INJ from the [Injective faucet](https://testnet.faucet.injective.network/).

---

## 📖 Vision / 愿景

> Every technological revolution ends with its core resource getting a market: land got deeds, companies got stock exchanges, compute got the cloud. **AI capability is the next resource waiting for its market** — and a market needs an exchange-grade chain.
>
> When AI Agents become the core of Web3, **Orchor is the capital market for those Agents' capabilities — and it clears on Injective.**
>
> 每一次技术革命的终点，都是核心资源获得自己的市场：土地有了地契，公司有了证券交易所，算力有了云。**AI 能力是下一个等待市场的资源** —— 而市场需要一条交易所级的链。
>
> 当 AI Agent 成为 Web3 的核心，**Orchor 就是那些 Agent 能力的资本市场 —— 在 Injective 上清算。**

---

*License: MIT*
