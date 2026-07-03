# Orchor Multi-Chain Architecture Upgrade Plan

## Executive Summary

**Current State:** Orchor is a Monad-only on-chain skill marketplace where every skill invocation triggers a blockchain transaction.

**Target State:** Orchor becomes a multi-chain AI Skill Runtime Economy platform with hybrid settlement: users deposit stablecoins via multiple chains → receive internal Orchor Credits → execute skills instantly off-chain → creators earn revenue settled across supported chains.

**Core Positioning:**
- **B.ai** = AI execution / compute layer (runtime provider)
- **Orchor** = Skill packaging + runtime orchestration + internal credit ledger + multi-chain settlement
- **TRON** = HTX ecosystem-compatible USDT deposit/withdrawal channel
- **EVM** = Universal Web3 deposit/withdrawal channel (Monad, Ethereum, Base, etc.)
- **X402** = Future HTTP-native payment gateway for API-based skill execution

---

## Architecture Analysis

### Current Architecture (Monad-Only)

```
User Wallet (MON)
    ↓
    ├─ topUpEnergy() → 1 MON = 100 Energy (on-chain)
    ├─ unlockSkill() → Pay MON on-chain
    ├─ subscribeSkill() → Pay MON on-chain
    └─ invokeSkill() → Deduct Energy on-chain
```

**Limitations:**
1. ❌ Every invocation requires on-chain tx (slow + expensive)
2. ❌ Locked to Monad ecosystem only
3. ❌ No real AI runtime integration (mock only)
4. ❌ Creator revenue is on-chain only (no flexible withdrawal)
5. ❌ Energy is blockchain-specific (can't use USDT/USDC directly)

### Proposed Architecture (Multi-Chain Hybrid)

```
┌─────────────────────────────────────────────────────────────┐
│                   ORCHOR PLATFORM                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Multi-Chain Payment Gateway                  │  │
│  │                                                        │  │
│  │   TRON Adapter  │  EVM Adapter  │  X402 Adapter      │  │
│  │   (TRC20-USDT)  │  (USDC/USDT)  │  (HTTP Payment)    │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Internal Credit Ledger (PostgreSQL)           │  │
│  │                                                        │  │
│  │  • User Balance                                       │  │
│  │  • Transaction History (deposit/run/withdraw)         │  │
│  │  • Creator Revenue Tracking                           │  │
│  │  • Platform Fees                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Skill Runtime Executor                       │  │
│  │                                                        │  │
│  │  • Skill Execution Queue                              │  │
│  │  • B.ai Runtime Integration                           │  │
│  │  • Revenue Distribution Logic                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Settlement Manager                             │  │
│  │                                                        │  │
│  │  • Batch withdrawals                                  │  │
│  │  • Multi-chain settlement routing                     │  │
│  │  • Fee estimation                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Modules

### 1. Multi-Chain Payment Backend

**File Structure:**
```
src/lib/payment/
  ├── adapter.ts           # Generic chain adapter interface
  ├── tron-adapter.ts      # TRON/TRC20-USDT implementation
  ├── evm-adapter.ts       # EVM chains (Monad, Base, etc.)
  ├── x402-adapter.ts      # X402 HTTP payment gateway
  └── payment-manager.ts   # Central payment orchestration
```

**Chain Adapter Interface:**
```typescript
interface ChainAdapter {
  chainId: string;
  chainName: string;
  supportedAssets: Asset[];
  
  // Deposit flow
  createDepositAddress(userId: string): Promise<DepositAddress>;
  verifyTransaction(txHash: string): Promise<TransactionStatus>;
  getTransactionStatus(txHash: string): Promise<TransactionStatus>;
  
  // Withdrawal flow
  withdraw(params: WithdrawParams): Promise<WithdrawResult>;
  estimateFee(asset: string, amount: bigint): Promise<FeeEstimate>;
  
  // Status checks
  getBalance(address: string, asset: string): Promise<bigint>;
  isHealthy(): Promise<boolean>;
}
```

**Phase 1 Implementation:**
- Mock adapters for all chains (TRON, EVM, X402)
- Real deposit address generation (deterministic per user)
- Transaction verification simulation
- Fee estimation logic

**Phase 2 (Production):**
- Real TRON SDK integration (TronWeb)
- Real EVM integration (viem/ethers)
- X402 protocol integration
- Webhook listeners for deposit confirmations

---

### 2. Internal Credit Ledger

**Database Schema (PostgreSQL):**

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  credits BIGINT DEFAULT 0,  -- in smallest unit (e.g., 1 credit = 0.01 USD)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ledger entries (double-entry bookkeeping)
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  entry_type TEXT NOT NULL,  -- 'deposit', 'skill_run', 'creator_revenue', 'platform_fee', 'runtime_cost', 'withdrawal'
  amount BIGINT NOT NULL,     -- positive = credit, negative = debit
  balance_after BIGINT NOT NULL,
  metadata JSONB,             -- skill_id, tx_hash, chain, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_created (user_id, created_at DESC)
);

-- Deposits tracking
CREATE TABLE deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  chain TEXT NOT NULL,        -- 'tron', 'evm-monad', 'evm-base', etc.
  asset TEXT NOT NULL,        -- 'USDT', 'USDC'
  amount BIGINT NOT NULL,     -- in smallest unit (e.g., 1000000 = 1 USDT)
  tx_hash TEXT UNIQUE NOT NULL,
  deposit_address TEXT,
  status TEXT DEFAULT 'pending',  -- 'pending', 'confirmed', 'failed'
  credits_minted BIGINT,      -- how many credits were added
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Skill runs tracking
CREATE TABLE skill_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  skill_id INTEGER NOT NULL,
  credits_cost BIGINT NOT NULL,
  runtime_cost_usd_cents INTEGER,
  creator_revenue_credits BIGINT,
  platform_fee_credits BIGINT,
  status TEXT DEFAULT 'pending',  -- 'pending', 'running', 'completed', 'failed'
  input_hash TEXT,
  output_preview TEXT,
  runtime_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  INDEX idx_user_skill (user_id, skill_id, created_at DESC)
);

-- Creator revenue tracking
CREATE TABLE creator_revenues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_address TEXT NOT NULL,
  skill_id INTEGER NOT NULL,
  total_runs INTEGER DEFAULT 0,
  total_revenue_credits BIGINT DEFAULT 0,
  withdrawable_credits BIGINT DEFAULT 0,
  last_withdrawal_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(creator_address, skill_id)
);

-- Withdrawals tracking
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  creator_address TEXT,       -- either user_id or creator_address
  chain TEXT NOT NULL,
  asset TEXT NOT NULL,
  credits_burned BIGINT NOT NULL,
  amount_sent BIGINT NOT NULL,
  destination_address TEXT NOT NULL,
  tx_hash TEXT,
  status TEXT DEFAULT 'pending',
  fee_credits BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

**Backend API Endpoints:**
```typescript
// src/app/api/credits/balance/route.ts
GET /api/credits/balance
POST /api/credits/deposit/create    // Generate deposit address
POST /api/credits/deposit/verify    // Verify and credit deposit
POST /api/credits/withdraw/request  // Initiate withdrawal
GET /api/credits/transactions       // Transaction history
```

---

### 3. Skill Runtime Execution with B.ai Integration

**Current:** Mock workflow in `/api/workflow/route.ts`

**Upgrade:**
```typescript
// src/lib/runtime/
├── bai-client.ts        // B.ai SDK integration
├── skill-executor.ts    // Skill execution orchestrator
└── revenue-splitter.ts  // Revenue distribution logic
```

**B.ai Integration (Mock for Phase 1):**
```typescript
interface BaiRuntimeClient {
  executeSkill(params: {
    skillId: number;
    orPackage: OrPackage;
    input: string;
    userId: string;
  }): Promise<SkillExecutionResult>;
  
  streamSkill(params: SkillExecutionParams): AsyncGenerator<SkillChunk>;
  estimateCost(skillId: number): Promise<RuntimeCostEstimate>;
}

interface SkillExecutionResult {
  output: string;
  runtimeMs: number;
  tokenUsage: { input: number; output: number };
  costUsdCents: number;
}
```

**Execution Flow:**
```typescript
async function executeSkill(userId: string, skillId: number, input: string) {
  // 1. Check credit balance
  const user = await getUser(userId);
  const skill = await getSkill(skillId);
  if (user.credits < skill.creditsPerRun) {
    throw new Error('Insufficient credits');
  }
  
  // 2. Deduct credits (atomic)
  await deductCredits({
    userId,
    amount: skill.creditsPerRun,
    entryType: 'skill_run',
    metadata: { skillId, input: hashInput(input) }
  });
  
  // 3. Execute via B.ai
  const result = await baiClient.executeSkill({
    skillId,
    orPackage: buildOrPackage(skill),
    input,
    userId
  });
  
  // 4. Distribute revenue
  await distributeRevenue({
    skillId,
    totalCredits: skill.creditsPerRun,
    creatorAddress: skill.creator,
    runtimeCostUsdCents: result.costUsdCents
  });
  
  // 5. Record run
  await recordSkillRun({
    userId,
    skillId,
    creditsCost: skill.creditsPerRun,
    runtimeCostUsdCents: result.costUsdCents,
    runtimeMs: result.runtimeMs,
    outputPreview: result.output.slice(0, 200)
  });
  
  return result;
}
```

---

### 4. Creator Revenue Dashboard

**New Component:**
```typescript
// src/components/CreatorDashboard.tsx
interface CreatorDashboardProps {
  creatorAddress: string;
}

interface CreatorStats {
  totalSkills: number;
  totalRuns: number;
  grossRevenue: number;       // in credits
  runtimeCosts: number;       // platform pays this to B.ai
  platformFee: number;
  netRevenue: number;
  withdrawableBalance: number;
  
  revenueBySkill: Array<{
    skillId: number;
    skillName: string;
    runs: number;
    revenue: number;
  }>;
  
  recentTransactions: Array<{
    date: string;
    type: 'run' | 'withdrawal';
    amount: number;
    skillId?: number;
  }>;
  
  settlementChains: Array<{
    chain: 'tron' | 'evm-monad' | 'evm-base';
    available: boolean;
    minWithdrawal: number;
    estimatedFee: number;
  }>;
}
```

**API Endpoint:**
```typescript
// GET /api/creator/stats?address=0x...
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  
  const stats = await db.query(`
    SELECT 
      COUNT(DISTINCT skill_id) as total_skills,
      SUM(total_runs) as total_runs,
      SUM(total_revenue_credits) as gross_revenue,
      SUM(withdrawable_credits) as withdrawable_balance
    FROM creator_revenues
    WHERE creator_address = $1
  `, [address]);
  
  // ... calculate net revenue, platform fees, etc.
  
  return NextResponse.json(stats);
}
```

---

### 5. User Wallet / Balance UI

**Update TopNav Component:**
```typescript
// src/components/TopNav.tsx
// Add credit balance display next to Energy balance

<div className="flex items-center gap-3">
  {/* Orchor Credits */}
  <div className="px-3 py-1.5 rounded-lg glass flex items-center gap-2">
    <CreditIcon size={14} />
    <span className="font-mono text-sm">{credits.toLocaleString()}</span>
    <span className="text-[10px] text-muted">credits</span>
  </div>
  
  {/* Legacy Energy (still show for Monad users) */}
  <div className="px-3 py-1.5 rounded-lg glass flex items-center gap-2">
    <EnergyBolt size={14} />
    <span className="font-mono text-sm">{energy}</span>
    <span className="text-[10px] text-muted">⚡</span>
  </div>
</div>
```

**New Top-Up Modal:**
```typescript
// src/components/TopUpCreditsModal.tsx
interface TopUpCreditsModalProps {
  open: boolean;
  onClose: () => void;
}

// Steps:
// 1. Select chain (TRON, EVM-Monad, EVM-Base, etc.)
// 2. Select asset (USDT, USDC)
// 3. Enter amount
// 4. Generate deposit address OR connect wallet and send tx
// 5. Wait for confirmation
// 6. Credits minted notification
```

**Payment Flow UI:**
```
┌─────────────────────────────────────────┐
│   Top Up Orchor Credits                 │
├─────────────────────────────────────────┤
│                                          │
│  Select Chain:                           │
│  ○ TRON (TRC20-USDT) - Low fees         │
│  ○ Monad (Native USDT)                   │
│  ○ Base (USDC)                           │
│  ○ Ethereum (USDC) - High fees           │
│                                          │
│  Amount: [______] USDT                   │
│                                          │
│  You will receive: ~9,950 credits        │
│  (1 credit ≈ $0.01 USD)                  │
│                                          │
│  [Generate Deposit Address]              │
│                                          │
└─────────────────────────────────────────┘
```

---

### 6. Updated Skill Execution Flow

**SkillDetailModal Updates:**

```typescript
// src/components/SkillDetailModal.tsx

// Before:
mode: "invoke" | "subscribe" | "unlock"

// After:
mode: "invoke"  // Only mode - no more unlock/subscribe needed

// Pricing display:
<div className="text-[10px] uppercase tracking-wider text-muted">
  Cost per run
</div>
<div className="mt-1 font-display text-3xl font-bold flex items-center gap-2">
  <CreditIcon size={20} />
  <span className="tabular text-cyan-200">{skill.creditsPerRun}</span>
  <span className="text-base text-mutedHi font-mono">credits</span>
</div>
<div className="text-[10px] text-muted">
  ≈ ${(skill.creditsPerRun * 0.01).toFixed(2)} USD · 
  Powered by B.ai · 
  70% to creator
</div>

// Execute button:
async function runSkill() {
  if (credits < skill.creditsPerRun) {
    onOpenTopUpCredits();
    return;
  }
  
  const result = await fetch('/api/skills/execute', {
    method: 'POST',
    body: JSON.stringify({
      skillId: skill.id,
      input: userInput
    })
  });
  
  const data = await result.json();
  // Stream output or show result
}
```

---

## Phased Implementation Plan

### Phase 1: Foundation (Week 1-2)
**Goal:** Set up multi-chain architecture without breaking existing Monad flow

- [ ] Database schema setup (PostgreSQL on Vercel/Supabase)
- [ ] Create payment adapter interface
- [ ] Implement mock adapters for TRON, EVM, X402
- [ ] Build internal credit ledger system
- [ ] Create credit balance API endpoints
- [ ] Add credits display to UI (alongside existing Energy)
- [ ] Update SkillDetailModal to show credit pricing

**Deliverable:** Users can see "credits" in UI, but Monad on-chain flow still works

---

### Phase 2: Credit System Integration (Week 3-4)
**Goal:** Make skill execution use credits instead of on-chain Energy

- [ ] Build skill execution API (`/api/skills/execute`)
- [ ] Integrate mock B.ai runtime
- [ ] Implement revenue splitting logic
- [ ] Create deposit flow UI (generate addresses)
- [ ] Build transaction history page
- [ ] Add credit top-up modal
- [ ] Update skill cards to show credit pricing

**Deliverable:** Users can top up credits (simulated) and run skills using credits

---

### Phase 3: Creator Dashboard (Week 5)
**Goal:** Creators can see earnings and withdraw

- [ ] Build creator stats API
- [ ] Create CreatorDashboard component
- [ ] Implement withdrawal request flow
- [ ] Add withdrawal history
- [ ] Multi-chain settlement UI (choose chain for withdrawal)

**Deliverable:** Creators have full revenue visibility and can request withdrawals

---

### Phase 4: Real Chain Integration (Week 6-7)
**Goal:** Connect to actual blockchains

- [ ] Integrate TronWeb for TRON deposits
- [ ] Integrate viem for EVM deposits (Monad, Base)
- [ ] Set up deposit webhook listeners
- [ ] Implement real withdrawal transactions
- [ ] Add transaction verification
- [ ] Gas fee estimation

**Deliverable:** Real deposits and withdrawals work on testnet

---

### Phase 5: B.ai Runtime (Week 8)
**Goal:** Connect to real AI execution

- [ ] Integrate B.ai SDK
- [ ] Stream skill execution results
- [ ] Real cost tracking
- [ ] Performance monitoring
- [ ] Error handling and retries

**Deliverable:** Skills execute via B.ai with real outputs

---

### Phase 6: X402 Integration (Week 9)
**Goal:** Enable HTTP-native payments for API users

- [ ] Research X402 protocol
- [ ] Implement X402 adapter
- [ ] Create API key + X402 auth flow
- [ ] Add X402 payment headers support
- [ ] API documentation

**Deliverable:** Skills can be invoked via HTTP API with X402 payment

---

### Phase 7: UI/UX Polish (Week 10)
**Goal:** Premium card-based design refresh

- [ ] Redesign skill cards (minimal, premium, collectible feel)
- [ ] Dark graphite background with subtle patterns
- [ ] Soft violet/silver glow effects
- [ ] Floating translucent card silhouettes
- [ ] Animation polish (card flips, smooth transitions)
- [ ] Typography refresh (Linear/Vercel style)
- [ ] Remove playful game elements
- [ ] Professional trading card aesthetic

**Design References:**
- Linear (clean, minimal, technical)
- Vercel (dark, sophisticated, calm)
- OpenAI (trustworthy, clear)
- Stripe (professional, polished)
- Nothing (minimal, premium)
- Slay the Spire cards (layout only, much more minimal)

**Color Palette:**
- Black, white, graphite gray
- Silver accents
- Subtle electric violet (#8B5CF6)
- Avoid: bright neon, cartoons, blockchain cubes, robot faces

---

## Technical Stack Additions

### Backend
- **Database:** PostgreSQL (Vercel Postgres or Supabase)
- **ORM:** Prisma or Drizzle
- **Queue:** BullMQ or Inngest (for async skill execution)
- **Webhooks:** Svix or custom webhook system

### Chain Integrations
- **TRON:** TronWeb SDK
- **EVM:** viem (already in use)
- **X402:** Custom HTTP payment header implementation

### AI Runtime
- **B.ai:** SDK integration (awaiting access)
- **Fallback:** OpenAI (current mock)

### Monitoring
- **Logging:** Axiom or Datadog
- **Metrics:** Vercel Analytics
- **Errors:** Sentry

---

## Migration Strategy

### Backward Compatibility

**Option 1: Dual Mode (Recommended)**
- Keep Monad on-chain flow working
- Add new credit-based flow in parallel
- Users can choose "Legacy Mode" or "Multi-Chain Mode"
- Gradually sunset legacy mode after 3 months

**Option 2: Hard Migration**
- Convert existing Energy balances to credits (1 Energy = 10 credits)
- Disable on-chain invocations
- Force all users to new flow

**Recommendation:** Option 1 for smoother transition

---

## Cost Analysis

### Current (Monad-Only)
- Gas cost per invocation: ~0.0001 MON ($0.0001 USD)
- Friction: wallet signature required every invocation
- Speed: 2-5 seconds per tx confirmation

### Proposed (Multi-Chain Credits)
- Deposit cost: varies by chain
  - TRON: ~$1-3 USD (TRC20 transfer)
  - Monad: ~$0.10 USD (native speed)
  - Base: ~$0.50 USD (L2 fees)
  - Ethereum: ~$5-20 USD (mainnet)
- Skill execution: instant (off-chain)
- Withdrawal cost: same as deposit
- User experience: much better (deposit once, run 100s of times)

### Revenue Split (New Model)
- **70%** → Creator (unchanged)
- **20%** → Platform (covers B.ai runtime + infrastructure)
- **10%** → Reserve (withdrawal fee buffer)

---

## Risk Assessment

### Technical Risks
1. **Database scaling** - PostgreSQL can handle millions of ledger entries
   - Mitigation: Partition by user_id, index properly
2. **Webhook reliability** - Deposit confirmations might be delayed
   - Mitigation: Retry logic + manual verification option
3. **B.ai integration** - SDK might not be ready
   - Mitigation: Keep OpenAI fallback, gradual rollout

### Business Risks
1. **User confusion** - Credits vs Energy vs MON
   - Mitigation: Clear onboarding, tooltips, migration guide
2. **Creator trust** - Will they trust internal ledger?
   - Mitigation: Transparent dashboard, instant withdrawal option
3. **Regulatory** - Is this a custodial wallet?
   - Mitigation: Legal review, terms of service updates

### Security Risks
1. **Double-spend** - Credit balance manipulation
   - Mitigation: Atomic DB transactions, audit logs
2. **Withdrawal fraud** - Fake withdrawal requests
   - Mitigation: Rate limits, KYC for large amounts, multi-sig
3. **SQL injection** - Ledger tampering
   - Mitigation: Parameterized queries, ORM usage, code review

---

## Success Metrics

### Phase 1-2 (Foundation)
- [ ] Credits system operational (simulated)
- [ ] All existing Monad features still work
- [ ] 0 breaking changes for existing users

### Phase 3-4 (Multi-Chain)
- [ ] 3+ chains supported (TRON, Monad, Base)
- [ ] <30 second deposit confirmation time
- [ ] <$3 average deposit cost (via TRON)

### Phase 5-6 (Runtime)
- [ ] B.ai integration live
- [ ] <5 second skill execution time
- [ ] 99% uptime

### Phase 7 (UX)
- [ ] Net Promoter Score >70
- [ ] User feedback: "professional", "premium", "trustworthy"
- [ ] Bounce rate <30%

---

## Open Questions

1. **B.ai SDK access** - Do we have API keys / SDK documentation?
2. **X402 protocol** - Is spec finalized? Reference implementation?
3. **HTX integration** - Do they have specific TRON requirements?
4. **Credit pricing** - Should 1 credit = $0.01 USD or dynamic?
5. **Withdrawal minimums** - What's reasonable per chain?
6. **KYC requirements** - Do we need it for withdrawals?

---

## Next Steps

1. **User approval** - Review this plan, ask questions, approve scope
2. **Database setup** - Provision PostgreSQL, run migrations
3. **Mock adapters** - Build payment adapter skeletons
4. **API scaffolding** - Create credit balance endpoints
5. **UI updates** - Add credits display to existing components

---

## Estimated Timeline

- **Phase 1-2:** 2-4 weeks (foundation + credit system)
- **Phase 3-4:** 2-3 weeks (creator dashboard + real chains)
- **Phase 5:** 1-2 weeks (B.ai integration)
- **Phase 6:** 1 week (X402)
- **Phase 7:** 1-2 weeks (UI polish)

**Total:** 8-12 weeks for full production-ready system

**MVP (Phase 1-3):** 4-6 weeks for working demo with simulated payments

---

## Conclusion

This upgrade transforms Orchor from a single-chain on-chain marketplace into a multi-chain AI Skill Runtime Economy platform. The hybrid settlement model eliminates per-invocation blockchain friction while maintaining creator revenue transparency and multi-chain withdrawal flexibility.

The phased approach ensures backward compatibility and allows for gradual rollout without breaking existing functionality.

**Key Benefits:**
✅ Instant skill execution (no tx wait)
✅ Multi-chain deposits (TRON for low fees, EVM for compatibility)
✅ Flexible creator withdrawals
✅ B.ai runtime integration for real AI execution
✅ Future-proof with X402 HTTP payment support
✅ Premium, professional UI refresh

**Next:** User review and approval to proceed with Phase 1 implementation.
