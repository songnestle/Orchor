# Orchor

**The Skill Runtime Economy for AI Agents**
**AI 智能体的技能运行时经济层**

> Turn AI Agent capabilities into collectible, executable, tradable **Skill Cards** — powered by **B.AI compute**, settled on-chain.
>
> 把 AI Agent 的能力封装成可收藏、可执行、可交易的**技能卡** —— 由 **B.AI 算力**驱动，链上结算。

🌐 **Live Demo:** [orchor.webpsy.net](https://orchor.webpsy.net)
🏆 **Built for:** HTX Genesis Hackathon 2026 — *AI × Web3 Fusion Track*

---

## 🎯 The Problem / 问题

As AI Agents become the core interface of Web3, a critical question emerges:

> **How should the capabilities of these Agents be owned, traded, and monetized?**

Today, AI capabilities are closed and rented. We believe they should be **assets** — ownable, tradable, composable.

当 AI Agent 成为 Web3 的核心入口，一个关键问题浮现：**这些 Agent 的能力，该如何被拥有、交易和变现?** 今天的 AI 能力是封闭的、租来的 —— 我们认为它应该像资产一样**可拥有、可交易、可组合**。

---

## 💡 What is Orchor / 什么是 Orchor

Orchor is an **AI Skill Runtime Economy** platform. It packages AI Agent capabilities — research, auditing, marketing, on-chain analysis — into **executable Skill Cards**.

- Users deposit stablecoins → receive **Credits**
- Run any skill with one click → **B.AI compute** executes it
- Creators earn per-run revenue, settled with an automatic **70 / 20 / 10** split

> Orchor is to AI Agents what an app store is to Apps — but every capability is a card you can **own and trade**.
>
> Orchor 之于 AI Agent，就像应用商店之于 App —— 但每个能力都是一张可以**拥有和交易**的卡。

---

## 🔗 AI × Web3 Fusion — The HTX Ecosystem Fit

Orchor is a native fusion of AI and Web3, mapped directly onto the HTX ecosystem:

| Layer | Role | 角色 |
|-------|------|------|
| **B.AI** | AI compute layer — every skill run is powered by B.AI. We don't build models; we distribute & settle capabilities. | AI 算力层 —— 每次技能运行由 B.AI 驱动 |
| **TRON** | Payment backbone — TRC-20 stablecoin deposits, low fee, instant, built for high-frequency per-run calls. | 支付底层 —— TRC-20 稳定币充值，低费率、秒到账 |
| **HTX** | Liquidity gateway — skill-card trading & creator withdrawals plug into the HTX ecosystem. | 流动性入口 —— 技能卡交易与创作者提现 |

**We didn't choose between AI and Web3 — we welded them together.**
**我们不在 AI 和 Web3 之间二选一 —— 我们把它们焊在了一起。**

---

## ✅ What's Real / 已实现（可现场验证）

The full economic loop is **live and persisted to a database** — not a mockup:

完整的经济闭环**已上线、落数据库** —— 不是 PPT：

```
Deposit stablecoins  →  Credits minted  →  Run skill (B.AI)
   充值稳定币             铸造 Credits         运行技能
        ↓                                         ↓
Creator withdraws  ←  Revenue split 70/20/10  ←  Credits deducted
   创作者提现            分账 70/20/10              扣除 Credits
```

- ✅ Credits ledger with **atomic transactions** (deposit / deduct / balance) — 原子事务积分账本
- ✅ Skill execution with real cost deduction — 真实扣费的技能执行
- ✅ Automatic **70% creator / 20% platform / 10% reserve** revenue split — 自动分账
- ✅ Creator revenue dashboard with live earnings — 创作者实时收益面板
- ✅ Multi-chain top-up UI (TRON / Base / Ethereum) — 多链充值界面
- ✅ 10 full pages, holographic card UI, **EN/中 bilingual** — 10 个页面，全息卡牌 UI，中英双语
- ✅ Deployed with HTTPS on production — 生产环境 HTTPS 部署

---

## 🚧 Roadmap / 路线图（拿奖后第一优先级）

- 🔜 **B.AI real compute integration** — replace the runtime stub with live B.AI inference — 接入 B.AI 真实算力
- 🔜 **TRON mainnet settlement** — real TRC-20 USDT deposit monitoring & withdrawal — TRON 主网真实结算
- 🔜 **HTX liquidity** — list skill cards for trading in the HTX ecosystem — 接入 HTX 流动性
- 🔜 **`.or` privacy compiler** — privacy-preserving executable skill packages — 隐私保护的技能封装

---

## ⚡ Why Hybrid Settlement / 为什么用混合结算

AI calls are **high-frequency micro-payments**. Putting every run on-chain is slow and expensive.

Orchor uses **hybrid settlement**: deposits & withdrawals on-chain, execution off-chain.

> **10× faster experience, 90% lower cost** — the perfect fit for TRON's payment backbone + an off-chain runtime.
>
> **体验快 10 倍，成本降 90%** —— TRON 支付底层 + 链下运行时的最佳组合。

---

## 🏗️ Architecture / 架构

```
┌─────────────────────────────────────────────────┐
│  Frontend (Next.js 14 · TypeScript · Tailwind)   │
│  10 pages · holographic cards · EN/中 i18n       │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│  API Layer (Next.js Route Handlers)              │
│  /credits · /skills · /creator                   │
└────────────────────┬────────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
┌─────────┐  ┌──────────────┐  ┌──────────────┐
│ Credit  │  │ Skill        │  │ Payment      │
│ Ledger  │  │ Executor     │  │ Adapters     │
│ (Prisma)│  │ (→ B.AI)     │  │ (TRON/EVM)   │
└────┬────┘  └──────────────┘  └──────────────┘
     ▼
┌──────────────┐
│ PostgreSQL   │  users · ledger · deposits ·
│              │  skill_runs · creator_revenues
└──────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router) · TypeScript · Tailwind · Framer Motion
- **Backend:** Next.js API Routes · Prisma · PostgreSQL
- **AI Runtime:** B.AI compute layer (integration in progress)
- **Payments:** TRON (TRC-20) · EVM adapters · hybrid on/off-chain settlement
- **Web3:** wagmi v2 · viem · RainbowKit

---

## 🚀 Run Locally

```bash
npm install
cp .env.example .env.local     # set DATABASE_URL
npx prisma generate
npx prisma db push
npm run dev                    # → http://localhost:3000
```

---

## 📖 Vision / 愿景

> When AI Agents become the core of Web3, **Orchor is the economic layer for those Agents' capabilities.**
>
> We're not just building a tool — we're minting an ownable capability economy for the AI Agent era.
>
> 当 AI Agent 成为 Web3 的核心，**Orchor 就是那些 Agent 能力的经济层**。我们不只是在造一个工具 —— 我们在为 AI Agent 时代，铸造一个可拥有的能力经济。

---

*License: MIT*
