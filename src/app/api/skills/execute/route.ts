import { NextRequest, NextResponse } from 'next/server';
import { skillExecutor } from '@/lib/runtime/skill-executor';
import { requireUser, UnauthorizedError } from '@/lib/auth/session';
import { hasOnchainAccess } from '@/lib/chainAccess';

export const runtime = 'nodejs';

/**
 * POST /api/skills/execute
 * Body: { skillId: number, input: string }
 *
 * 两处安全改动:
 *
 * 1. userId 不再从请求体读。改造前传谁的 userId 就扣谁的 credits ——
 *    任何人都能用别人的余额跑推理。现在身份只来自签名会话。
 *
 * 2. 执行前校验链上 hasAccess。改造前这条路径完全不问合约,
 *    不解锁、不订阅也能免费调用任何技能,而 README 声称权限由链上裁决。
 *    这曾经是整个「链上确权」叙事的技术信用缺口。
 */
export async function POST(req: NextRequest) {
  try {
    const userId = requireUser(req);
    const { skillId, input } = await req.json();

    if (skillId === undefined || !input) {
      return NextResponse.json(
        { error: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    const allowed = await hasOnchainAccess(userId, Number(skillId));
    if (!allowed) {
      return NextResponse.json(
        { error: 'NO_ACCESS', needsUnlock: true },
        { status: 403 }
      );
    }

    const result = await skillExecutor.execute({
      userId,
      skillId: Number(skillId),
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
        // 与合约常量一致:CREATOR_BPS / PLATFORM_BPS / ONCHAIN_BPS = 7000 / 2500 / 500。
        // 这里曾经写 70/20/10,和链上对不上 —— 三处数字不一致会直接伤可信度。
        split: '70/25/5',
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('[API] Error executing skill:', error);
    const message = error instanceof Error ? error.message : 'EXECUTION_FAILED';
    if (message.toLowerCase().includes('insufficient credits')) {
      return NextResponse.json({ error: message, needsTopUp: true }, { status: 402 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
