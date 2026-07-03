import { NextRequest, NextResponse } from 'next/server';
import { skillExecutor } from '@/lib/runtime/skill-executor';

export const runtime = 'nodejs';

/**
 * POST /api/skills/execute
 * Execute a skill using credits
 *
 * Body: { userId: string, skillId: number, input: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, skillId, input } = body;

    if (!userId || skillId === undefined || !input) {
      return NextResponse.json(
        { error: 'userId, skillId, and input are required' },
        { status: 400 }
      );
    }

    const result = await skillExecutor.execute({
      userId,
      skillId,
      input,
    });

    return NextResponse.json({
      success: true,
      output: result.output,
      execution: {
        skillId,
        creditsCharged: result.creditsCharged.toString(),
        runtimeMs: result.runtimeMs,
        runtimeCostUsdCents: result.runtimeCost,
      },
      revenue: {
        creator: result.creatorRevenue.toString(),
        platform: result.platformFee.toString(),
        split: '70/20/10',
      },
    });
  } catch (error) {
    console.error('[API] Error executing skill:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute skill' },
      { status: 500 }
    );
  }
}
