import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { paymentManager } from '@/lib/payment/payment-manager';
import { ledgerService } from '@/lib/ledger/ledger-service';

export const runtime = 'nodejs';

/**
 * POST /api/credits/deposit/verify
 * Verify a deposit transaction and mint credits
 *
 * Body: { userId: string, txHash: string, chain: string, asset: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, txHash, chain, asset } = body;

    if (!userId || !txHash || !chain || !asset) {
      return NextResponse.json(
        { error: 'userId, txHash, chain, and asset are required' },
        { status: 400 }
      );
    }

    // Check if deposit already processed
    const existingDeposit = await prisma.deposit.findUnique({
      where: { txHash },
    });

    if (existingDeposit) {
      return NextResponse.json({
        success: existingDeposit.status === 'confirmed',
        status: existingDeposit.status,
        credits: existingDeposit.creditsMinted?.toString(),
        message: existingDeposit.status === 'confirmed'
          ? 'Deposit already processed'
          : 'Deposit pending',
      });
    }

    // Get adapter and verify transaction
    const adapter = paymentManager.getAdapter(chain);
    const txStatus = await adapter.verifyTransaction(txHash);

    if (txStatus.status === 'failed') {
      // Record failed deposit
      await prisma.deposit.create({
        data: {
          userId,
          chain,
          asset,
          amount: txStatus.amount,
          txHash,
          status: 'failed',
        },
      });

      return NextResponse.json(
        { error: 'Transaction failed', txStatus },
        { status: 400 }
      );
    }

    if (txStatus.status === 'pending') {
      // Record pending deposit
      await prisma.deposit.create({
        data: {
          userId,
          chain,
          asset,
          amount: txStatus.amount,
          txHash,
          status: 'pending',
        },
      });

      return NextResponse.json({
        success: false,
        status: 'pending',
        confirmations: txStatus.confirmations,
        required: txStatus.requiredConfirmations,
        message: 'Transaction pending confirmation',
      });
    }

    // Transaction confirmed - calculate and mint credits
    const credits = paymentManager.calculateCredits(txStatus.amount, asset, chain);

    // Create deposit record and mint credits in a transaction
    const deposit = await prisma.deposit.create({
      data: {
        userId,
        chain,
        asset,
        amount: txStatus.amount,
        txHash,
        status: 'confirmed',
        creditsMinted: credits,
        confirmedAt: new Date(),
      },
    });

    // Mint credits to user
    await ledgerService.creditUser({
      userId,
      amount: credits,
      entryType: 'deposit',
      metadata: {
        depositId: deposit.id,
        txHash,
        chain,
        asset,
        amount: txStatus.amount.toString(),
      },
    });

    return NextResponse.json({
      success: true,
      status: 'confirmed',
      credits: credits.toString(),
      creditsFormatted: Number(credits).toLocaleString(),
      usdValue: (Number(credits) * 0.01).toFixed(2),
      txHash,
      deposit: {
        id: deposit.id,
        amount: txStatus.amount.toString(),
        asset,
        chain,
        confirmedAt: deposit.confirmedAt,
      },
    });
  } catch (error) {
    console.error('[API] Error verifying deposit:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify deposit' },
      { status: 500 }
    );
  }
}
