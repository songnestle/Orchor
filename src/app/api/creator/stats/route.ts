import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/creator/stats?address=0x...
 * Get creator revenue statistics
 */
export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get('address')?.toLowerCase() ?? null;

    if (!address) {
      return NextResponse.json(
        { error: 'address parameter required' },
        { status: 400 }
      );
    }

    // Get all skills by this creator
    const revenues = await prisma.creatorRevenue.findMany({
      where: { creatorAddress: address },
      orderBy: { totalRevenue: 'desc' },
    });

    // Calculate totals
    const totalSkills = revenues.length;
    const totalRuns = revenues.reduce((sum, r) => sum + r.totalRuns, 0);
    const grossRevenue = revenues.reduce((sum, r) => sum + BigInt(r.totalRevenue), 0n);
    const withdrawableBalance = revenues.reduce((sum, r) => sum + BigInt(r.withdrawableCredits), 0n);

    // Get recent skill runs for this creator's skills
    const skillIds = revenues.map(r => r.skillId);
    const recentRuns = await prisma.skillRun.findMany({
      where: {
        skillId: { in: skillIds },
        status: 'completed',
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
    });

    // Get withdrawal history
    const withdrawals = await prisma.withdrawal.findMany({
      where: { creatorAddress: address },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Calculate platform fees (20% of gross)
    const platformFee = (grossRevenue * 20n) / 100n;
    const netRevenue = grossRevenue - platformFee;

    return NextResponse.json({
      address,
      summary: {
        totalSkills,
        totalRuns,
        grossRevenue: grossRevenue.toString(),
        grossRevenueFormatted: Number(grossRevenue).toLocaleString(),
        platformFee: platformFee.toString(),
        platformFeeFormatted: Number(platformFee).toLocaleString(),
        netRevenue: netRevenue.toString(),
        netRevenueFormatted: Number(netRevenue).toLocaleString(),
        withdrawableBalance: withdrawableBalance.toString(),
        withdrawableBalanceFormatted: Number(withdrawableBalance).toLocaleString(),
        usdValue: (Number(withdrawableBalance) * 0.01).toFixed(2),
      },
      revenueBySkill: revenues.map(r => ({
        skillId: r.skillId,
        runs: r.totalRuns,
        revenue: r.totalRevenue.toString(),
        revenueFormatted: Number(r.totalRevenue).toLocaleString(),
        withdrawable: r.withdrawableCredits.toString(),
        lastWithdrawal: r.lastWithdrawalAt,
      })),
      recentTransactions: recentRuns.map(run => ({
        id: run.id,
        skillId: run.skillId,
        userId: run.userId,
        credits: run.creditsCost.toString(),
        creatorEarned: run.creatorRevenue?.toString() || '0',
        completedAt: run.completedAt,
      })),
      withdrawalHistory: withdrawals.map(w => ({
        id: w.id,
        chain: w.chain,
        asset: w.asset,
        amount: w.amountSent.toString(),
        amountFormatted: Number(w.amountSent).toLocaleString(),
        creditsBurned: w.creditsBurned.toString(),
        status: w.status,
        txHash: w.txHash,
        createdAt: w.createdAt,
        completedAt: w.completedAt,
      })),
      settlementChains: [
        {
          chain: 'evm-injective',
          name: 'Injective',
          available: true,
          minWithdrawal: 20,
          estimatedFee: 1,
          recommendedFor: 'Native chain, sub-cent fees',
        },
        {
          chain: 'tron',
          name: 'TRON',
          available: true,
          minWithdrawal: 100, // 100 credits = $1
          estimatedFee: 150, // ~$1.50
          recommendedFor: 'Low fees, fast confirmation',
        },
        {
          chain: 'evm-base',
          name: 'Base',
          available: true,
          minWithdrawal: 100,
          estimatedFee: 50,
          recommendedFor: 'L2, moderate fees',
        },
      ],
    });
  } catch (error) {
    // Graceful degradation: if the DB is unavailable, return an empty but
    // structurally-complete payload (HTTP 200) so the dashboard renders an
    // empty state instead of crashing. `degraded` flags the fallback.
    console.error('[API] Error fetching creator stats:', error);
    const address = req.nextUrl.searchParams.get('address')?.toLowerCase() ?? '';
    return NextResponse.json({
      address,
      degraded: true,
      summary: {
        totalSkills: 0,
        totalRuns: 0,
        grossRevenue: '0',
        grossRevenueFormatted: '0',
        platformFee: '0',
        platformFeeFormatted: '0',
        netRevenue: '0',
        netRevenueFormatted: '0',
        withdrawableBalance: '0',
        withdrawableBalanceFormatted: '0',
        usdValue: '0.00',
      },
      revenueBySkill: [],
      recentTransactions: [],
      withdrawalHistory: [],
      settlementChains: [],
    });
  }
}
