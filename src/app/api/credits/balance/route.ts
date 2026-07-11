import { NextRequest, NextResponse } from 'next/server';
import { ledgerService } from '@/lib/ledger/ledger-service';

export const runtime = 'nodejs';

/**
 * GET /api/credits/balance?address=0x...
 * Get user's credit balance
 */
export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'address parameter required' },
        { status: 400 }
      );
    }

    const balance = await ledgerService.getBalance(address);
    const stats = await ledgerService.getUserStats(address);

    return NextResponse.json({
      address,
      credits: balance.toString(),
      creditsFormatted: Number(balance).toLocaleString(),
      usdEquivalent: (Number(balance) * 0.01).toFixed(2),
      stats: stats ? {
        totalDeposited: stats.totalDeposited.toString(),
        totalSpent: stats.totalSpent.toString(),
        totalSkillRuns: stats.totalSkillRuns,
        totalDeposits: stats.totalDeposits,
        totalWithdrawals: stats.totalWithdrawals,
      } : null,
    });
  } catch (error) {
    // Graceful degradation: if the DB is unavailable, return a zero-balance
    // payload (HTTP 200) instead of a 500. This keeps the UI functional
    // (shows 0 credits) rather than crashing on a failed fetch.
    console.error('[API] Error fetching balance:', error);
    const address = req.nextUrl.searchParams.get('address') ?? '';
    return NextResponse.json({
      address,
      credits: '0',
      creditsFormatted: '0',
      usdEquivalent: '0.00',
      stats: null,
      degraded: true,
    });
  }
}
