# Orchor

**The Skill Runtime Economy for AI Agents — on Injective**
**AI 智能体的技能运行时经济层 —— 构建于 Injective**

> Turn AI Agent capabilities into collectible, executable, tradable **Skill Cards** — registered, priced and settled on-chain on **Injective**.
>
> 把 AI Agent 的能力封装成可收藏、可执行、可交易的**技能卡** —— 在 **Injective** 上注册、定价、结算。

🌐 **Live Demo:** [orchor.webpsy.net](https://orchor.webpsy.net)
🏆 **Built for:** Injective Nova Program — *Injective × Microsoft × Web3Labs*
⛓️ **Contract (Injective Testnet):** [`0x2612…96d3`](https://testnet.blockscout.injective.network/address/0x26129909CFEA99D0c5D17d93090B8D36179C96d3)

---

## 🎯 The Problem / 问题

As AI Agents become the core interface of Web3, two groups are both stuck:

**🎨 Skill creators can't get paid.**
Countless prompt engineers, researchers, and Agent builders craft powerful AI skills — but there's no way to monetize them. A brilliant VC-research agent or a battle-tested contract auditor stays trapped in one person's private toolkit, earning nothing.

**🔍 Users can't find good skills.**
Everyone knows AI can do amazing things, but *which* prompt, *which* workflow, *which* agent actually delivers? Users waste hours reinventing wheels because there's no trusted marketplace to discover, rate, and instantly run proven skills.

> **The capability exists. The creators exist. The demand exists. What's missing is the economic layer that connects them.**
> **能力存在，创作者存在，需求存在。缺的，是那个把三者连起来的经济层。**

That economic layer is Orchor. / 这个经济层，就是 Orchor。

---

## 💡 What is Orchor / 什么是 Orchor

Orchor is an **AI Skill Runtime Economy**. It packages AI Agent capabilities — research, auditing, marketing, on-chain analysis — into **executable Skill Cards**, registers them on Injective, and gives creators a way to earn and users a place to discover.

- **For creators / 对创作者:** publish a skill once (`registerSkill`) → earn per-use revenue forever, with an automatic **70 / 25 / 5** split enforced on-chain. 发布一次技能 → 按次持续赚取收益，链上自动分账。
- **For users / 对用户:** browse a marketplace of rated skills → top up **⚡ Energy** with INJ → unlock, subscribe, and invoke any skill, every action logged on-chain. 浏览技能市场 → 用 INJ 充值 Energy → 解锁 / 订阅 / 调用，每一步都上链。

> Orchor is to AI Agents what an app store is to Apps — but every capability is a card you can **own and trade on-chain**.
> Orchor 之于 AI Agent，就像应用商店之于 App —— 但每个能力都是一张可以**链上拥有和交易**的卡。

---

## ⛓️ Why Injective / 为什么选 Injective

Orchor is a settlement-heavy, high-frequency product. Injective is the L1 built exactly for that:

| Injective property | What Orchor gets |
|--------------------|------------------|
| **Finance-native L1** | Skill unlock / subscription / invocation are financial primitives — they belong on a chain built for markets, not bolted onto a general-purpose one. |
| **MultiVM (native EVM)** | `OrchorCore.sol` deploys unchanged to Injective's native EVM (chainId **1439**). Solidity + wagmi/viem, zero rewrite. |
| **Sub-second finality, sub-cent gas** | Per-invocation on-chain logging is actually viable — every skill run can be a real transaction, not a promise. |
| **Native orderbook module (roadmap)** | The skill-card marketplace can settle against Injective's on-chain orderbook instead of a bespoke AMM. |

**We didn't bolt AI onto a chain — we built the skill economy on the chain designed to clear it.**
**我们没有把 AI 硬套到链上 —— 我们把技能经济建在了为它而生的链上。**

---

## ✅ What's Real / 已实现（可现场验证）

The full on-chain loop is **live on Injective Testnet** — verifiable on Blockscout, not a mockup:

```
Top up Energy (INJ)  →  Unlock / Subscribe skill  →  Invoke (spend Energy)
   用 INJ 充值 Energy       解锁 / 订阅技能               调用（消耗 Energy）
        │                                                    │
        └──────────  Revenue split 70/25/5 on-chain  ◄───────┘
                       链上自动分账 70/25/5
```

- ✅ `OrchorCore` deployed to **Injective Testnet** (chainId 1439) — **12 Skill Cards registered on-chain**
- ✅ On-chain **Energy** ledger (`topUpEnergy`, `1 INJ = 100 ⚡`) — 链上 Energy 账本
- ✅ One-time **unlock** + 30-day **subscription** access models — 一次性解锁 + 30 天订阅
- ✅ On-chain **invocation** with `SkillInvoked` events — 链上调用与事件
- ✅ Automatic **70% creator / 25% platform / 5% on-chain reserve** split (`_splitRevenue`) — 自动分账
- ✅ Multi-chain **Credits top-up** on-ramp (Injective / TRON / Base / Ethereum) for stablecoin users — 多链稳定币充值入口
- ✅ 10+ pages, holographic retro card UI, **EN/中 bilingual** — 全息复古卡牌 UI，中英双语
- ✅ Deployed with HTTPS on production — 生产环境 HTTPS 部署

Every skill lives at [`OrchorCore` on Blockscout](https://testnet.blockscout.injective.network/address/0x26129909CFEA99D0c5D17d93090B8D36179C96d3) — read `nextSkillId` / `getSkill` to verify all 12.

---

## 🔀 Architecture — On-chain where it counts / 架构：该上链的上链

Orchor is a **hybrid architecture**: the skill economy is on-chain on Injective; a thin off-chain layer keeps the AI runtime fast.

Orchor 是**混合架构**：技能经济在 Injective 链上，链下只做 AI 运行时加速。

**1. Skill ownership & economy → Injective / 技能确权与经济 → Injective**
`registerSkill`, `unlockSkill`, `subscribeSkill`, `invokeSkill`, `topUpEnergy` and the 70/25/5 `_splitRevenue` all run in `OrchorCore.sol` on Injective. A skill is a verifiable on-chain asset.

**2. Fiat on-ramp → multi-chain / 法币入口 → 多链**
Users who prefer stablecoins can top up **Credits** from Injective, TRON, Base, or Ethereum. Money enters and leaves on-chain; the Credits ledger is an off-chain convenience layer.

**3. AI execution → hosted runtime / AI 执行 → 托管运行时**
Skill inference runs on a hosted runtime (no API keys for the user). Result hashes are logged on-chain via `invokeSkill`.

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
     └────────────────────┘   └────────────────────┘
```

---

## 🛠️ Tech Stack

- **Chain:** Injective Testnet — native EVM / MultiVM (chainId 1439) · Solidity 0.8.24 · Hardhat
- **Web3:** wagmi v2 · viem · RainbowKit
- **Frontend:** Next.js 14 (App Router) · TypeScript · Tailwind · Framer Motion
- **Backend:** Next.js API Routes · Prisma · PostgreSQL
- **Payments:** multi-chain Credits on-ramp (Injective / TRON / Base / Ethereum)

---

## 🚧 Roadmap / 路线图（Demo Day 后第一优先级）

- 🔜 **Injective Mainnet** — deploy `OrchorCore` to Injective mainnet (chainId 1776) — 主网部署
- 🔜 **Orderbook-settled marketplace** — list & trade Skill Cards on Injective's native orderbook module — 用 Injective 原生订单簿撮合技能卡交易
- 🔜 **x402 machine payments** — HTTP 402 so AI Agents auto-pay per skill call; our per-invoke model is natively compatible — AI Agent 按次自动付费
- 🔜 **Azure-backed runtime** — Microsoft Azure inference for the hosted skill runtime — Azure 算力接入
- 🔜 **`.or` privacy compiler** — privacy-preserving executable skill packages — 隐私技能封装

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

> When AI Agents become the core of Web3, **Orchor is the on-chain economic layer for those Agents' capabilities** — and it clears on Injective.
>
> 当 AI Agent 成为 Web3 的核心，**Orchor 就是那些 Agent 能力的链上经济层** —— 在 Injective 上结算。

---

*License: MIT*
