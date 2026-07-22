import { NextRequest, NextResponse } from 'next/server';
import { ledgerService } from '@/lib/ledger/ledger-service';

export const runtime = 'nodejs';

/**
 * GET /api/credits/transactions?address=0x...&limit=50&offset=0
 * Get user's transaction history
 */
export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get('address')?.toLowerCase() ?? null;
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');

    if (!address) {
      return NextResponse.json(
        { error: 'address parameter required' },
        { status: 400 }
      );
    }

    const history = await ledgerService.getHistory(address, limit, offset);

    return NextResponse.json({
      address,
      transactions: history.map(entry => ({
        id: entry.id,
        type: entry.entryType,
        amount: entry.amount.toString(),
        amountFormatted: Number(entry.amount).toLocaleString(),
        balanceAfter: entry.balanceAfter.toString(),
        balanceAfterFormatted: Number(entry.balanceAfter).toLocaleString(),
        metadata: entry.metadata,
        timestamp: entry.createdAt.toISOString(),
        isCredit: entry.amount > 0n,
      })),
      pagination: {
        limit,
        offset,
        hasMore: history.length === limit,
      },
    });
  } catch (error) {
    console.error('[API] Error fetching transactions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
