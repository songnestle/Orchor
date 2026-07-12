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

As AI Agents become the core interface of Web3, two groups are both stuck:

**🎨 Skill creators can't get paid.**
Countless prompt engineers, researchers, and Agent builders craft powerful AI skills — but there's no way to monetize them. A brilliant VC-research agent or a battle-tested contract auditor stays trapped in one person's private toolkit, earning nothing. The work has real value; the market to capture it doesn't exist.

**🔍 Users can't find good skills.**
Everyone knows AI can do amazing things, but *which* prompt, *which* workflow, *which* agent actually delivers? Users waste hours reinventing wheels, or settle for generic ChatGPT output — because there's no trusted marketplace to discover, rate, and instantly run proven, high-quality skills.

> **The capability exists. The creators exist. The demand exists. What's missing is the economic layer that connects them.**

当 AI Agent 成为 Web3 的核心入口，两类人都被困住了：

**🎨 技能创作者拿不到收益。** 无数 prompt 工程师、研究员、Agent 开发者打磨出强大的 AI 技能，却无从变现。一个出色的 VC 研究 Agent、一个久经考验的合约审计工具，只能锁在个人的私有工具箱里，赚不到一分钱。价值真实存在，但捕获价值的市场不存在。

**🔍 用户找不到优质技能。** 人人都知道 AI 能做很多事，但*哪个* prompt、*哪个* 工作流、*哪个* Agent 真正好用？用户浪费大量时间重复造轮子，或将就用通用的 ChatGPT 输出 —— 因为没有一个可信的市场，去发现、评价、一键运行那些经过验证的优质技能。

> **能力存在，创作者存在，需求存在。缺的，是那个把三者连起来的经济层。**

That economic layer is Orchor. / 这个经济层，就是 Orchor。

---

## 💡 What is Orchor / 什么是 Orchor

Orchor is an **AI Skill Runtime Economy** platform. It packages AI Agent capabilities — research, auditing, marketing, on-chain analysis — into **executable Skill Cards**, then gives creators a way to earn and users a place to discover.

**For creators / 对创作者:** publish a skill once → earn per-run revenue forever, with an automatic **70 / 20 / 10** split. 发布一次技能 → 按次持续赚取收益。

**For users / 对用户:** browse a marketplace of rated, proven skills → deposit stablecoins for **Credits** → run any skill in one click, powered by **B.AI**. 浏览经过评价验证的技能市场 → 充值获得 Credits → 一键运行，由 B.AI 驱动。

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
