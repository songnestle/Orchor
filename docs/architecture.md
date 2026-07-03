# Orchor Multi-Chain Architecture - Technical Implementation

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE LAYER                            │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Skill Cards │  │   Creator    │  │    Wallet    │  │  Transaction │  │
│  │  Marketplace │  │  Dashboard   │  │   Balance    │  │   History    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │                  │          │
└─────────┼──────────────────┼──────────────────┼──────────────────┼──────────┘
          │                  │                  │                  │
          ▼                  ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS API ROUTES LAYER                           │
│                                                                              │
│  /api/credits/*          /api/skills/*         /api/creator/*               │
│  ├─ balance              ├─ execute            ├─ stats                     │
│  ├─ deposit/create       ├─ list               ├─ revenue                   │
│  ├─ deposit/verify       ├─ detail             └─ withdraw                  │
│  ├─ withdraw/request     └─ publish                                         │
│  └─ transactions                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BUSINESS LOGIC LAYER                                 │
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐ │
│  │  Payment Manager     │  │  Skill Executor      │  │  Revenue Manager │ │
│  │                      │  │                      │  │                  │ │
│  │  • Deposit tracking  │  │  • Queue management  │  │  • Split logic   │ │
│  │  • Verification      │  │  • B.ai integration  │  │  • Creator earn  │ │
│  │  • Credit minting    │  │  • Result streaming  │  │  • Withdrawal    │ │
│  │  • Withdrawal        │  │  • Cost tracking     │  │  • Settlement    │ │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
          │                          │                          │
          ▼                          ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA PERSISTENCE LAYER                               │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL Database                                │  │
│  │                                                                       │  │
│  │  ┌─────────┐  ┌───────────┐  ┌───────────┐  ┌────────────────┐     │  │
│  │  │  users  │  │  ledger_  │  │ deposits  │  │ skill_runs     │     │  │
│  │  │         │  │  entries  │  │           │  │                │     │  │
│  │  └─────────┘  └───────────┘  └───────────┘  └────────────────┘     │  │
│  │                                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐                                   │  │
│  │  │  creator_   │  │ withdrawals │                                   │  │
│  │  │  revenues   │  │             │                                   │  │
│  │  └─────────────┘  └─────────────┘                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS LAYER                               │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ TRON Adapter │  │  EVM Adapter │  │ X402 Adapter │  │ B.ai Runtime │  │
│  │              │  │              │  │              │  │              │  │
│  │ • TronWeb    │  │ • viem       │  │ • HTTP       │  │ • Skill exec │  │
│  │ • TRC20-USDT │  │ • USDC/USDT  │  │ • Payment    │  │ • Streaming  │  │
│  │ • Balance    │  │ • Monad      │  │   headers    │  │ • Cost track │  │
│  │ • Transfer   │  │ • Base, etc. │  │ • Auth       │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Payment Adapter System

#### Generic Interface
```typescript
// src/lib/payment/adapter.ts

export interface Asset {
  symbol: string;          // 'USDT', 'USDC', 'MON'
  decimals: number;        // 6 for USDT, 18 for MON
  contractAddress?: string;
}

export interface DepositAddress {
  address: string;
  memo?: string;           // For exchanges
  qrCode: string;          // Data URL for QR display
  expiresAt?: Date;        // Some chains use temporary addresses
}

export interface TransactionStatus {
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  requiredConfirmations: number;
  amount: bigint;
  asset: string;
  from: string;
  to: string;
  timestamp: Date;
  blockNumber?: number;
}

export interface WithdrawParams {
  userId: string;
  asset: string;
  amount: bigint;
  destination: string;
  memo?: string;
}

export interface WithdrawResult {
  txHash: string;
  estimatedConfirmationTime: number; // seconds
  actualFee: bigint;
}

export interface FeeEstimate {
  fee: bigint;
  feeAsset: string;
  estimatedTime: number;  // seconds
}

export abstract class ChainAdapter {
  abstract chainId: string;
  abstract chainName: string;
  abstract supportedAssets: Asset[];
  
  // Deposit flow
  abstract createDepositAddress(userId: string): Promise<DepositAddress>;
  abstract verifyTransaction(txHash: string): Promise<TransactionStatus>;
  abstract getTransactionStatus(txHash: string): Promise<TransactionStatus>;
  
  // Withdrawal flow
  abstract withdraw(params: WithdrawParams): Promise<WithdrawResult>;
  abstract estimateFee(asset: string, amount: bigint): Promise<FeeEstimate>;
  
  // Health checks
  abstract getBalance(address: string, asset: string): Promise<bigint>;
  abstract isHealthy(): Promise<boolean>;
  
  // Utilities
  abstract validateAddress(address: string): boolean;
  abstract formatAmount(amount: bigint, asset: string): string;
  abstract parseAmount(amount: string, asset: string): bigint;
}
```

#### TRON Adapter Implementation
```typescript
// src/lib/payment/tron-adapter.ts

import TronWeb from 'tronweb';

export class TronAdapter extends ChainAdapter {
  chainId = 'tron-mainnet';
  chainName = 'TRON';
  supportedAssets: Asset[] = [
    { symbol: 'USDT', decimals: 6, contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' }
  ];
  
  private tronWeb: TronWeb;
  private depositWallet: string; // Hot wallet for deposits
  
  constructor(config: { apiKey: string; network: 'mainnet' | 'testnet' }) {
    super();
    this.tronWeb = new TronWeb({
      fullHost: config.network === 'mainnet' 
        ? 'https://api.trongrid.io' 
        : 'https://api.shasta.trongrid.io',
      headers: { 'TRON-PRO-API-KEY': config.apiKey }
    });
  }
  
  async createDepositAddress(userId: string): Promise<DepositAddress> {
    // Option 1: Generate unique address per user (requires key management)
    // Option 2: Use single hot wallet + memo system (centralized exchange style)
    // Option 3: Deterministic addresses from master seed
    
    // For MVP, we'll use Option 2: single hot wallet
    const address = this.depositWallet;
    const memo = Buffer.from(userId).toString('base64'); // Encode user ID
    
    // Generate QR code data
    const qrData = `tron:${address}?amount=10&token=USDT&memo=${memo}`;
    
    return {
      address,
      memo,
      qrCode: await this.generateQRCode(qrData),
    };
  }
  
  async verifyTransaction(txHash: string): Promise<TransactionStatus> {
    const tx = await this.tronWeb.trx.getTransaction(txHash);
    
    if (!tx) {
      throw new Error('Transaction not found');
    }
    
    // Parse TRC20 transfer
    const contract = tx.raw_data?.contract?.[0];
    if (contract?.type !== 'TriggerSmartContract') {
      throw new Error('Not a TRC20 transfer');
    }
    
    // Decode transfer parameters
    const { amount, to } = this.decodeTRC20Transfer(contract.parameter.value);
    
    const info = await this.tronWeb.trx.getTransactionInfo(txHash);
    const confirmed = info.blockNumber && info.receipt?.result === 'SUCCESS';
    
    return {
      txHash,
      status: confirmed ? 'confirmed' : 'pending',
      confirmations: confirmed ? 19 : 0, // TRON requires 19 confirmations
      requiredConfirmations: 19,
      amount: BigInt(amount),
      asset: 'USDT',
      from: contract.parameter.value.owner_address,
      to,
      timestamp: new Date(tx.raw_data.timestamp),
      blockNumber: info.blockNumber,
    };
  }
  
  async withdraw(params: WithdrawParams): Promise<WithdrawResult> {
    const { asset, amount, destination } = params;
    
    // Get contract instance
    const contract = await this.tronWeb.contract().at(
      this.supportedAssets.find(a => a.symbol === asset)!.contractAddress!
    );
    
    // Send transaction
    const tx = await contract.transfer(destination, amount).send();
    
    return {
      txHash: tx,
      estimatedConfirmationTime: 60, // ~3 seconds per block * 19 confirmations
      actualFee: BigInt(0), // TRON fees are usually covered by energy/bandwidth
    };
  }
  
  async estimateFee(asset: string, amount: bigint): Promise<FeeEstimate> {
    // TRC20 transfers cost ~14 TRX if no energy
    // With energy delegation, can be <$0.01
    return {
      fee: BigInt(14_000_000), // 14 TRX in sun
      feeAsset: 'TRX',
      estimatedTime: 60,
    };
  }
  
  async isHealthy(): Promise<boolean> {
    try {
      await this.tronWeb.trx.getCurrentBlock();
      return true;
    } catch {
      return false;
    }
  }
  
  validateAddress(address: string): boolean {
    return this.tronWeb.isAddress(address);
  }
  
  // ... other utility methods
}
```

#### EVM Adapter Implementation
```typescript
// src/lib/payment/evm-adapter.ts

import { createPublicClient, createWalletClient, http, parseUnits, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from './chain';

export class EVMAdapter extends ChainAdapter {
  chainId: string;
  chainName: string;
  supportedAssets: Asset[];
  
  private publicClient;
  private walletClient;
  private depositAddress: string;
  
  constructor(config: {
    chain: any; // viem Chain
    rpcUrl: string;
    privateKey: `0x${string}`;
  }) {
    super();
    this.chainId = `evm-${config.chain.id}`;
    this.chainName = config.chain.name;
    
    this.publicClient = createPublicClient({
      chain: config.chain,
      transport: http(config.rpcUrl),
    });
    
    const account = privateKeyToAccount(config.privateKey);
    this.depositAddress = account.address;
    
    this.walletClient = createWalletClient({
      account,
      chain: config.chain,
      transport: http(config.rpcUrl),
    });
    
    // Configure supported assets per chain
    this.supportedAssets = this.getAssetsForChain(config.chain.id);
  }
  
  async createDepositAddress(userId: string): Promise<DepositAddress> {
    // Similar to TRON: single hot wallet + memo system
    // Or generate deterministic addresses from HD wallet
    
    return {
      address: this.depositAddress,
      memo: Buffer.from(userId).toString('base64'),
      qrCode: await this.generateQRCode(`ethereum:${this.depositAddress}?value=10`),
    };
  }
  
  async verifyTransaction(txHash: string): Promise<TransactionStatus> {
    const tx = await this.publicClient.getTransaction({ hash: txHash as `0x${string}` });
    const receipt = await this.publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
    
    // Parse ERC20 transfer logs
    const transferLog = receipt.logs.find(log => 
      log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // Transfer event
    );
    
    if (!transferLog) {
      throw new Error('Not an ERC20 transfer');
    }
    
    const amount = BigInt(transferLog.data);
    const currentBlock = await this.publicClient.getBlockNumber();
    const confirmations = Number(currentBlock - receipt.blockNumber);
    
    return {
      txHash,
      status: receipt.status === 'success' ? 'confirmed' : 'failed',
      confirmations,
      requiredConfirmations: 12, // Standard for most EVM chains
      amount,
      asset: 'USDT', // Need to decode from contract address
      from: tx.from,
      to: receipt.to || '',
      timestamp: new Date(Number(tx.blockNumber) * 1000),
      blockNumber: Number(receipt.blockNumber),
    };
  }
  
  async withdraw(params: WithdrawParams): Promise<WithdrawResult> {
    const asset = this.supportedAssets.find(a => a.symbol === params.asset);
    if (!asset?.contractAddress) {
      throw new Error(`Asset ${params.asset} not supported`);
    }
    
    // Call ERC20 transfer
    const hash = await this.walletClient.writeContract({
      address: asset.contractAddress as `0x${string}`,
      abi: [{
        name: 'transfer',
        type: 'function',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
      }],
      functionName: 'transfer',
      args: [params.destination as `0x${string}`, params.amount],
    });
    
    // Get gas used
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
    const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;
    
    return {
      txHash: hash,
      estimatedConfirmationTime: 180, // ~15s per block * 12 confirmations
      actualFee: gasUsed,
    };
  }
  
  // ... rest of implementation
}
```

#### X402 Adapter (Mock for now)
```typescript
// src/lib/payment/x402-adapter.ts

export class X402Adapter extends ChainAdapter {
  chainId = 'x402-http';
  chainName = 'X402 HTTP Payment';
  supportedAssets: Asset[] = [
    { symbol: 'USD', decimals: 2 } // Fiat via X402
  ];
  
  async createDepositAddress(userId: string): Promise<DepositAddress> {
    // X402 uses payment requests, not addresses
    throw new Error('X402 uses payment headers, not deposit addresses');
  }
  
  async verifyTransaction(txHash: string): Promise<TransactionStatus> {
    // Verify X402 payment via HTTP headers
    // Implementation depends on X402 spec
    throw new Error('Not implemented');
  }
  
  // ... mock implementation for Phase 1
}
```

---

### 2. Credit Ledger System

#### Ledger Service
```typescript
// src/lib/ledger/ledger-service.ts

import { db } from './db';

export interface LedgerEntry {
  id: string;
  userId: string;
  entryType: 'deposit' | 'skill_run' | 'creator_revenue' | 'platform_fee' | 'runtime_cost' | 'withdrawal';
  amount: bigint;  // Positive = credit, Negative = debit
  balanceAfter: bigint;
  metadata: Record<string, any>;
  createdAt: Date;
}

export class LedgerService {
  /**
   * Add credits to user balance (atomic operation)
   */
  async creditUser(params: {
    userId: string;
    amount: bigint;
    entryType: LedgerEntry['entryType'];
    metadata?: Record<string, any>;
  }): Promise<LedgerEntry> {
    return await db.transaction(async (tx) => {
      // Lock user row
      const user = await tx.query(
        'SELECT credits FROM users WHERE id = $1 FOR UPDATE',
        [params.userId]
      );
      
      const currentBalance = BigInt(user.rows[0].credits);
      const newBalance = currentBalance + params.amount;
      
      // Update balance
      await tx.query(
        'UPDATE users SET credits = $1, updated_at = NOW() WHERE id = $2',
        [newBalance.toString(), params.userId]
      );
      
      // Insert ledger entry
      const entry = await tx.query(
        `INSERT INTO ledger_entries (user_id, entry_type, amount, balance_after, metadata)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [params.userId, params.entryType, params.amount.toString(), newBalance.toString(), params.metadata || {}]
      );
      
      return this.parseLedgerEntry(entry.rows[0]);
    });
  }
  
  /**
   * Deduct credits from user balance (atomic operation)
   */
  async debitUser(params: {
    userId: string;
    amount: bigint;
    entryType: LedgerEntry['entryType'];
    metadata?: Record<string, any>;
  }): Promise<LedgerEntry> {
    if (params.amount <= 0n) {
      throw new Error('Debit amount must be positive');
    }
    
    return await db.transaction(async (tx) => {
      const user = await tx.query(
        'SELECT credits FROM users WHERE id = $1 FOR UPDATE',
        [params.userId]
      );
      
      const currentBalance = BigInt(user.rows[0].credits);
      if (currentBalance < params.amount) {
        throw new Error('Insufficient credits');
      }
      
      const newBalance = currentBalance - params.amount;
      
      await tx.query(
        'UPDATE users SET credits = $1, updated_at = NOW() WHERE id = $2',
        [newBalance.toString(), params.userId]
      );
      
      const entry = await tx.query(
        `INSERT INTO ledger_entries (user_id, entry_type, amount, balance_after, metadata)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [params.userId, params.entryType, (-params.amount).toString(), newBalance.toString(), params.metadata || {}]
      );
      
      return this.parseLedgerEntry(entry.rows[0]);
    });
  }
  
  /**
   * Get user's current credit balance
   */
  async getBalance(userId: string): Promise<bigint> {
    const result = await db.query(
      'SELECT credits FROM users WHERE id = $1',
      [userId]
    );
    return BigInt(result.rows[0]?.credits || 0);
  }
  
  /**
   * Get transaction history
   */
  async getHistory(userId: string, limit = 50, offset = 0): Promise<LedgerEntry[]> {
    const result = await db.query(
      `SELECT * FROM ledger_entries 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows.map(this.parseLedgerEntry);
  }
  
  private parseLedgerEntry(row: any): LedgerEntry {
    return {
      id: row.id,
      userId: row.user_id,
      entryType: row.entry_type,
      amount: BigInt(row.amount),
      balanceAfter: BigInt(row.balance_after),
      metadata: row.metadata,
      createdAt: new Date(row.created_at),
    };
  }
}

export const ledgerService = new LedgerService();
```

---

### 3. Skill Execution Engine

```typescript
// src/lib/runtime/skill-executor.ts

import { ledgerService } from '../ledger/ledger-service';
import { baiClient } from './bai-client';
import { revenueManager } from './revenue-manager';

export interface SkillExecutionParams {
  userId: string;
  skillId: number;
  input: string;
}

export interface SkillExecutionResult {
  output: string;
  runtimeMs: number;
  creditsCharged: bigint;
  creatorRevenue: bigint;
  platformFee: bigint;
  runtimeCost: number; // USD cents
}

export class SkillExecutor {
  async execute(params: SkillExecutionParams): Promise<SkillExecutionResult> {
    const { userId, skillId, input } = params;
    
    // 1. Get skill details
    const skill = await this.getSkill(skillId);
    if (!skill) {
      throw new Error(`Skill ${skillId} not found`);
    }
    
    // 2. Check user balance
    const balance = await ledgerService.getBalance(userId);
    if (balance < skill.creditsPerRun) {
      throw new Error(`Insufficient credits. Need ${skill.creditsPerRun}, have ${balance}`);
    }
    
    // 3. Deduct credits (atomic)
    await ledgerService.debitUser({
      userId,
      amount: skill.creditsPerRun,
      entryType: 'skill_run',
      metadata: { skillId, inputHash: this.hashInput(input) }
    });
    
    // 4. Execute via B.ai
    const startTime = Date.now();
    let result;
    
    try {
      result = await baiClient.executeSkill({
        skillId,
        orPackage: buildOrPackage(skill),
        input,
        userId
      });
    } catch (error) {
      // Refund credits on execution failure
      await ledgerService.creditUser({
        userId,
        amount: skill.creditsPerRun,
        entryType: 'skill_run',
        metadata: { skillId, refund: true, error: String(error) }
      });
      throw error;
    }
    
    const runtimeMs = Date.now() - startTime;
    
    // 5. Distribute revenue
    await revenueManager.distribute({
      skillId,
      creatorAddress: skill.creator,
      totalCredits: skill.creditsPerRun,
      runtimeCostUsdCents: result.costUsdCents
    });
    
    // 6. Record run
    await this.recordRun({
      userId,
      skillId,
      creditsCost: skill.creditsPerRun,
      runtimeCostUsdCents: result.costUsdCents,
      runtimeMs,
      outputPreview: result.output.slice(0, 200)
    });
    
    return {
      output: result.output,
      runtimeMs,
      creditsCharged: skill.creditsPerRun,
      creatorRevenue: (skill.creditsPerRun * 70n) / 100n,
      platformFee: (skill.creditsPerRun * 20n) / 100n,
      runtimeCost: result.costUsdCents
    };
  }
  
  private async getSkill(skillId: number) {
    // Fetch from database or cache
    // For now, use static SKILL_MODULES + published skills
  }
  
  private hashInput(input: string): string {
    // SHA256 hash for privacy
    return crypto.createHash('sha256').update(input).digest('hex');
  }
  
  private async recordRun(params: any) {
    await db.query(
      `INSERT INTO skill_runs (user_id, skill_id, credits_cost, runtime_cost_usd_cents, runtime_ms, output_preview, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'completed')`,
      [params.userId, params.skillId, params.creditsCost.toString(), params.runtimeCostUsdCents, params.runtimeMs, params.outputPreview]
    );
  }
}

export const skillExecutor = new SkillExecutor();
```

---

## API Routes Implementation

### Credit Balance API
```typescript
// src/app/api/credits/balance/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ledgerService } from '@/lib/ledger/ledger-service';

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  
  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 });
  }
  
  try {
    const balance = await ledgerService.getBalance(address);
    
    return NextResponse.json({
      address,
      credits: balance.toString(),
      creditsFormatted: Number(balance).toLocaleString(),
      usdEquivalent: (Number(balance) * 0.01).toFixed(2)
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
```

### Skill Execution API
```typescript
// src/app/api/skills/execute/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { skillExecutor } from '@/lib/runtime/skill-executor';

export async function POST(req: NextRequest) {
  try {
    const { skillId, input, userId } = await req.json();
    
    if (!skillId || !input || !userId) {
      return NextResponse.json({ error: 'skillId, input, and userId required' }, { status: 400 });
    }
    
    const result = await skillExecutor.execute({ userId, skillId, input });
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
```

---

## Environment Variables (Updated)

```bash
# .env (add these to existing vars)

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/orchor

# Payment Adapters
TRON_API_KEY=your-trongrid-api-key
TRON_DEPOSIT_WALLET=TYour...Address
TRON_PRIVATE_KEY=your-private-key

EVM_MONAD_RPC=https://testnet-rpc.monad.xyz
EVM_DEPOSIT_WALLET=0xYour...Address
EVM_PRIVATE_KEY=0x...

# B.ai Integration
BAI_API_KEY=your-bai-api-key
BAI_ENDPOINT=https://api.b.ai/v1

# Credit System
CREDITS_PER_USD=100  # 1 USD = 100 credits = $0.01 per credit
```

---

## Next Steps Summary

1. ✅ **Plan created** - Comprehensive architecture documented
2. 📝 **User review** - Review plan and approve scope
3. 🗄️ **Database setup** - Provision PostgreSQL, run migrations
4. 🔌 **Mock adapters** - Build payment adapter skeletons
5. 🎨 **UI scaffolding** - Add credits display to components
6. 🚀 **Phase 1 implementation** - Build foundation without breaking Monad flow

This architecture provides a clear path from single-chain Monad to multi-chain hybrid settlement while maintaining backward compatibility and allowing for gradual rollout.
