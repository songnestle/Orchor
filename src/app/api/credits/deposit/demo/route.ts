import { NextRequest, NextResponse } from 'next/server';
import { ledgerService } from '@/lib/ledger/ledger-service';
import { prisma } from '@/lib/db';
import { randomUUID } from 'crypto';
import { requireUser, UnauthorizedError } from '@/lib/auth/session';

export const runtime = 'nodejs';

/**
 * POST /api/credits/deposit/demo
 *
 * Demo / instant top-up. Credits the user's balance directly without an
 * on-chain transfer. Used to demonstrate the full flow (top up -> run skill)
 * before real multi-chain deposit monitoring is wired up.
 *
 * Body: { userId: string, usd: number, chain?: string, asset?: string }
 *
 * Conversion: 1 USD = 100 Credits (mirrors the 0.01 USD/credit rate used
 * elsewhere in the app).
 */
export async function POST(req: NextRequest) {
  try {
    // 这条路由白送余额。默认关闭,只有显式打开开关才可用 ——
    // 改造前它无鉴权且上限 $10,000,等于生产环境的免费提款机。
    if (process.env.ENABLE_DEMO_TOPUP !== 'true') {
      return NextResponse.json({ error: '演示充值未启用' }, { status: 404 });
    }
    const userId = requireUser(req);

    const body = await req.json();
    const usd = Number(body.usd);
    const chain = body.chain ?? 'demo';
    const asset = body.asset ?? 'USDC';

    if (!Number.isFinite(usd) || usd <= 0) {
      return NextResponse.json({ error: 'usd must be a positive number' }, { status: 400 });
    }
    if (usd > 10000) {
      return NextResponse.json({ error: 'Demo top-up capped at $10,000' }, { status: 400 });
    }

    const credits = BigInt(Math.round(usd * 100)); // 1 USD = 100 Credits

    // Credit the user (auto-creates the user row if missing).
    await ledgerService.creditUser({
      userId,
      amount: credits,
      entryType: 'deposit',
      metadata: { chain, asset, usd, demo: true },
    });

    // Record a confirmed deposit for history/stats.
    await prisma.deposit.create({
      data: {
        userId,
        chain,
        asset,
        amount: BigInt(Math.round(usd * 1_000_000)), // 6-decimal stablecoin unit
        txHash: `demo-${randomUUID()}`,
        status: 'confirmed',
        creditsMinted: credits,
        confirmedAt: new Date(),
      },
    });

    const balance = await ledgerService.getBalance(userId);

    return NextResponse.json({
      success: true,
      creditsMinted: credits.toString(),
      newBalance: balance.toString(),
      usd,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('[API] Demo deposit error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Deposit failed' },
      { status: 500 }
    );
  }
}
