# Orchor

**The Skill Layer for AI Agents — a collectible, programmable, onchain intelligence economy powered by Monad.**

Orchor turns AI capabilities into **collectible Skill Cards**. Creators export from any agent platform (OpenClaw / Claude Code / LangGraph / Dify / Lobehub) → Orchor normalizes into a `.or` Skill Package → users unlock / subscribe / invoke with Energy, settled onchain by Monad.

---

## What's onchain (Monad Testnet)

**Contract:** [`OrchorCore`](https://testnet.monadexplorer.com/address/0x769fC7dFf74502E5A387eE7EF47A01917A847a03) — `0x769fC7dFf74502E5A387eE7EF47A01917A847a03`

| Action | Onchain |
|---|---|
| Register a skill | `registerSkill(name, rarity, energyCost, unlockPrice, subPrice, mintCap)` |
| Top up Energy | `topUpEnergy()` payable, 1 MON = 100 ⚡ |
| One-time unlock | `unlockSkill(id)` payable, Mythic enforces mint cap |
| 30-day subscription | `subscribeSkill(id)` payable, stackable |
| Invoke skill | `invokeSkill(id, inputHash)` — spends Energy, emits event |
| Revenue split | 70% creator / 25% platform / 5% onchain reserve, auto on every payment |

Five rarity tiers: **Common · Rare · Epic · Legendary · Mythic** (Mythic is hard-capped onchain).

---

## Tech stack

- **Frontend:** Next.js 14 (App Router) · TypeScript · Tailwind · Framer Motion · Zustand
- **Web3:** wagmi v2 · viem · RainbowKit (Phantom / MetaMask / Rabby / Coinbase / WalletConnect)
- **Contracts:** Solidity 0.8.24 · Hardhat
- **Chain:** Monad Testnet (chainId `10143`)

---

## Run locally

```bash
# 1. install
npm install

# 2. configure env
cp .env.example .env
# fill in NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (free at cloud.reown.com)

# 3. start
npm run dev          # http://localhost:3000
```

The frontend works without `PRIVATE_KEY` — that key is only needed to deploy / seed the contract from scripts.

---

## Deploy to Vercel

1. Push this repo to GitHub
2. New Project → import the repo
3. Set environment variables (Project Settings → Environment Variables):
   ```
   NEXT_PUBLIC_ORCHOR_CORE_ADDRESS=0x769fC7dFf74502E5A387eE7EF47A01917A847a03
   NEXT_PUBLIC_MONAD_TESTNET_RPC=https://testnet-rpc.monad.xyz
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-id-from-cloud.reown.com
   ```
   **Do NOT add `PRIVATE_KEY`** — Vercel doesn't need it. Frontend only reads
   chain state + sends user-signed txs.
4. Deploy. Vercel auto-detects Next.js, no build config needed.

---

## Redeploy the contract (optional, only if you fork)

```bash
# add PRIVATE_KEY to .env first (a Monad-Testnet-funded wallet)
npm run compile
npm run deploy:orchor:monad
# copy the printed address into NEXT_PUBLIC_ORCHOR_CORE_ADDRESS
```

Deployer becomes contract owner + platform treasury + creator of every seeded skill, so all revenue splits return to that wallet during the demo. Use additional wallets if you want to demo creator settlement.

---

## Project layout

```
contracts/OrchorCore.sol         # marketplace + Energy ledger + 70/25/5 split
scripts/deploy-orchor.ts         # deploys + seeds 12 skills (2 Mythic w/ caps)
src/lib/chain.ts                 # monadTestnet config + OrchorCore ABI
src/lib/useOrchor.ts             # wagmi hooks (energy, owned, subscribed, mint, writes)
src/lib/useOrchorState.ts        # aggregated hook used by every component
src/lib/skills.ts                # static seed skill catalog
src/lib/publishedStore.ts        # localStorage persistence for user-published skills
src/lib/orPackage.ts             # builds the .or Skill Package manifest
src/app/page.tsx                 # main page composition
src/components/SkillCard.tsx     # holographic card with tilt + rarity theming
src/components/SkillCarousel.tsx # central stage carousel
src/components/SkillsGrid.tsx    # responsive browse grid
src/components/SkillDetailModal.tsx       # Overview / .or Package / Runtime tabs + payment flow
src/components/TopUpEnergyModal.tsx       # MON → Energy conversion
src/components/PublishSkillModal.tsx      # creator publishing (form / .or import / preset)
src/components/SkillPackAnimation.tsx     # gacha-style pack reveal
src/components/MyDeckDrawer.tsx           # owned + subscribed inventory
src/components/Providers.tsx              # wagmi + react-query + RainbowKit
```

---

## What's "real" and what's UX-only

**Real onchain actions** (signing a tx really moves MON / Energy / state):
- Top-up Energy
- Unlock skill
- Subscribe skill
- Invoke skill (debits Energy, logs event — **does not yet trigger LLM inference**)
- Publish skill via `registerSkill`
- Mythic mint counter (live from chain)

**UX-only** for now:
- Skill Pack opening animation
- AI output streaming after invoke (hosted runtime layer not wired)
- Recently Invoked / Top Creators sidebar widgets (mock data)
- Daily Discovery countdown

---

## Security notes

- `.env` is gitignored — never commit it. Anyone with the deployer key controls the contract owner + treasury wallet.
- The contract uses a hand-rolled reentrancy guard and pull-style revenue split. No proxy / upgrade path — redeploy if you need to change economics.
- WalletConnect projectId is public — putting it in a `NEXT_PUBLIC_*` env var is by design.

---

## License

MIT.
