import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/deposits?userId=0x...&status=confirmed
 * Get user's deposit history
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')?.toLowerCase() ?? null;
    const status = req.nextUrl.searchParams.get('status');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter required' },
        { status: 400 }
      );
    }

    const deposits = await prisma.deposit.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      deposits: deposits.map(d => ({
        id: d.id,
        chain: d.chain,
        asset: d.asset,
        amount: d.amount.toString(),
        amountFormatted: Number(d.amount).toLocaleString(),
        txHash: d.txHash,
        status: d.status,
        creditsMinted: d.creditsMinted?.toString(),
        creditsMintedFormatted: d.creditsMinted ? Number(d.creditsMinted).toLocaleString() : '0',
        confirmedAt: d.confirmedAt,
        createdAt: d.createdAt,
      })),
    });
  } catch (error) {
    console.error('[API] Error fetching deposits:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch deposits' },
      { status: 500 }
    );
  }
}
