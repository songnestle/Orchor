import { prisma } from '../db';

export interface LedgerEntry {
  id: string;
  userId: string;
  entryType: 'deposit' | 'skill_run' | 'creator_revenue' | 'platform_fee' | 'runtime_cost' | 'withdrawal';
  amount: bigint;
  balanceAfter: bigint;
  metadata?: Record<string, any>;
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
    if (params.amount <= 0n) {
      throw new Error('Credit amount must be positive');
    }

    return await prisma.$transaction(async (tx) => {
      // Get or create user with lock
      let user = await tx.user.findUnique({
        where: { id: params.userId },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            id: params.userId,
            walletAddress: params.userId, // Assuming userId is wallet address
            credits: 0n,
          },
        });
      }

      // Lock user row for update
      const lockedUser = await tx.user.findUnique({
        where: { id: params.userId },
      });

      if (!lockedUser) {
        throw new Error('User not found');
      }

      const currentBalance = BigInt(lockedUser.credits);
      const newBalance = currentBalance + params.amount;

      // Update balance
      await tx.user.update({
        where: { id: params.userId },
        data: {
          credits: newBalance,
          updatedAt: new Date(),
        },
      });

      // Insert ledger entry
      const entry = await tx.ledgerEntry.create({
        data: {
          userId: params.userId,
          entryType: params.entryType,
          amount: params.amount,
          balanceAfter: newBalance,
          metadata: params.metadata || {},
        },
      });

      return {
        id: entry.id,
        userId: entry.userId,
        entryType: entry.entryType as LedgerEntry['entryType'],
        amount: BigInt(entry.amount),
        balanceAfter: BigInt(entry.balanceAfter),
        metadata: entry.metadata as Record<string, any> | undefined,
        createdAt: entry.createdAt,
      };
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

    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: params.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const currentBalance = BigInt(user.credits);
      if (currentBalance < params.amount) {
        throw new Error(`Insufficient credits. Need ${params.amount}, have ${currentBalance}`);
      }

      const newBalance = currentBalance - params.amount;

      await tx.user.update({
        where: { id: params.userId },
        data: {
          credits: newBalance,
          updatedAt: new Date(),
        },
      });

      const entry = await tx.ledgerEntry.create({
        data: {
          userId: params.userId,
          entryType: params.entryType,
          amount: -params.amount, // Negative for debit
          balanceAfter: newBalance,
          metadata: params.metadata || {},
        },
      });

      return {
        id: entry.id,
        userId: entry.userId,
        entryType: entry.entryType as LedgerEntry['entryType'],
        amount: BigInt(entry.amount),
        balanceAfter: BigInt(entry.balanceAfter),
        metadata: entry.metadata as Record<string, any> | undefined,
        createdAt: entry.createdAt,
      };
    });
  }

  /**
   * Get user's current credit balance
   */
  async getBalance(userId: string): Promise<bigint> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    return user ? BigInt(user.credits) : 0n;
  }

  /**
   * Get transaction history
   */
  async getHistory(userId: string, limit = 50, offset = 0): Promise<LedgerEntry[]> {
    const entries = await prisma.ledgerEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return entries.map(entry => ({
      id: entry.id,
      userId: entry.userId,
      entryType: entry.entryType as LedgerEntry['entryType'],
      amount: BigInt(entry.amount),
      balanceAfter: BigInt(entry.balanceAfter),
      metadata: entry.metadata as Record<string, any> | undefined,
      createdAt: entry.createdAt,
    }));
  }

  /**
   * Get user summary stats
   */
  async getUserStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            skillRuns: true,
            deposits: true,
            withdrawals: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    const totalDeposited = await prisma.deposit.aggregate({
      where: { userId, status: 'confirmed' },
      _sum: { creditsMinted: true },
    });

    const totalSpent = await prisma.skillRun.aggregate({
      where: { userId, status: 'completed' },
      _sum: { creditsCost: true },
    });

    return {
      balance: BigInt(user.credits),
      totalDeposited: totalDeposited._sum.creditsMinted ? BigInt(totalDeposited._sum.creditsMinted) : 0n,
      totalSpent: totalSpent._sum.creditsCost ? BigInt(totalSpent._sum.creditsCost) : 0n,
      totalSkillRuns: user._count.skillRuns,
      totalDeposits: user._count.deposits,
      totalWithdrawals: user._count.withdrawals,
    };
  }
}

export const ledgerService = new LedgerService();
