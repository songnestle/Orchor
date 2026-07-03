import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { paymentManager } from '@/lib/payment/payment-manager';

export const runtime = 'nodejs';

/**
 * POST /api/creator/withdraw
 * Request a withdrawal of creator revenue
 *
 * Body: { creatorAddress: string, chain: string, asset: string, credits: string, destinationAddress: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { creatorAddress, chain, asset, credits, destinationAddress } = body;

    if (!creatorAddress || !chain || !asset || !credits || !destinationAddress) {
      return NextResponse.json(
        { error: 'All fields required: creatorAddress, chain, asset, credits, destinationAddress' },
        { status: 400 }
      );
    }

    const creditsAmount = BigInt(credits);

    // Validate address
    const adapter = paymentManager.getAdapter(chain);
    if (!adapter.validateAddress(destinationAddress)) {
      return NextResponse.json(
        { error: 'Invalid destination address' },
        { status: 400 }
      );
    }

    // Check withdrawable balance
    const revenues = await prisma.creatorRevenue.findMany({
      where: { creatorAddress },
    });

    const totalWithdrawable = revenues.reduce(
      (sum, r) => sum + BigInt(r.withdrawableCredits),
      0n
    );

    if (totalWithdrawable < creditsAmount) {
      return NextResponse.json(
        {
          error: `Insufficient withdrawable balance. Available: ${totalWithdrawable}, requested: ${creditsAmount}`,
        },
        { status: 400 }
      );
    }

    // Estimate withdrawal cost
    const estimate = await paymentManager.estimateWithdrawalCost(
      creditsAmount,
      asset,
      chain
    );

    // Check if credits cover amount + fee
    if (creditsAmount < estimate.totalCreditsCost) {
      return NextResponse.json(
        {
          error: `Insufficient credits to cover withdrawal + fee. Need ${estimate.totalCreditsCost}, have ${creditsAmount}`,
          estimate: {
            amount: estimate.assetAmount.toString(),
            fee: estimate.fee.toString(),
            totalCost: estimate.totalCreditsCost.toString(),
          },
        },
        { status: 400 }
      );
    }

    // Calculate actual amount to send (credits - fee converted to asset)
    const netCredits = creditsAmount - estimate.totalCreditsCost + creditsAmount;
    const amountToSend = paymentManager.calculateAssetAmount(netCredits, asset, chain);

    // Create withdrawal request (will be processed by background job in production)
    const withdrawal = await prisma.withdrawal.create({
      data: {
        creatorAddress,
        chain,
        asset,
        creditsBurned: creditsAmount,
        amountSent: amountToSend,
        destinationAddress,
        status: 'pending',
        feeCredits: estimate.totalCreditsCost - creditsAmount,
      },
    });

    // Deduct from withdrawable balance
    await prisma.$transaction(async (tx) => {
      let remaining = creditsAmount;

      for (const revenue of revenues) {
        if (remaining <= 0n) break;

        const available = BigInt(revenue.withdrawableCredits);
        const toDeduct = remaining > available ? available : remaining;

        await tx.creatorRevenue.update({
          where: { id: revenue.id },
          data: {
            withdrawableCredits: { decrement: toDeduct },
            lastWithdrawalAt: new Date(),
          },
        });

        remaining -= toDeduct;
      }
    });

    // Mock withdrawal execution (in production, this would be queued)
    // For Phase 1-2, we simulate successful withdrawal
    const mockTxHash = await adapter.withdraw({
      userId: creatorAddress,
      asset,
      amount: amountToSend,
      destination: destinationAddress,
    });

    // Update withdrawal with tx hash
    await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        status: 'completed',
        txHash: mockTxHash.txHash,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      withdrawal: {
        id: withdrawal.id,
        credits: creditsAmount.toString(),
        amount: amountToSend.toString(),
        amountFormatted: adapter.formatAmount(amountToSend, asset),
        asset,
        chain,
        destination: destinationAddress,
        fee: estimate.fee.toString(),
        feeFormatted: adapter.formatAmount(estimate.fee, asset),
        txHash: mockTxHash.txHash,
        estimatedTime: estimate.estimatedTime,
        status: 'completed',
      },
    });
  } catch (error) {
    console.error('[API] Error processing withdrawal:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}
