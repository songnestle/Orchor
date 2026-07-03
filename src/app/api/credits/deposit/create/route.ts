import { NextRequest, NextResponse } from 'next/server';
import { paymentManager } from '@/lib/payment/payment-manager';

export const runtime = 'nodejs';

/**
 * POST /api/credits/deposit/create
 * Generate a deposit address for user
 *
 * Body: { userId: string, chain: string, asset: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, chain, asset } = body;

    if (!userId || !chain || !asset) {
      return NextResponse.json(
        { error: 'userId, chain, and asset are required' },
        { status: 400 }
      );
    }

    const adapter = paymentManager.getAdapter(chain);

    // Validate asset is supported
    const supportedAsset = adapter.supportedAssets.find(a => a.symbol === asset);
    if (!supportedAsset) {
      return NextResponse.json(
        { error: `Asset ${asset} not supported on ${chain}` },
        { status: 400 }
      );
    }

    // Create deposit address
    const depositAddress = await adapter.createDepositAddress(userId);

    return NextResponse.json({
      success: true,
      chain,
      asset,
      depositAddress: depositAddress.address,
      memo: depositAddress.memo,
      qrCode: depositAddress.qrCode,
      expiresAt: depositAddress.expiresAt,
      instructions: {
        [chain === 'tron' ? 'TRON' : 'EVM']: [
          `1. Send ${asset} to: ${depositAddress.address}`,
          depositAddress.memo ? `2. Include memo: ${depositAddress.memo}` : null,
          `3. Wait for confirmation`,
          `4. Credits will be added automatically`,
        ].filter(Boolean),
      },
      conversionRate: '1 USD = 100 credits',
      example: '10 USDT = 1000 credits',
    });
  } catch (error) {
    console.error('[API] Error creating deposit address:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create deposit address' },
      { status: 500 }
    );
  }
}
