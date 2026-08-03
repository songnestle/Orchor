import { NextRequest, NextResponse } from 'next/server';
import { requireUser, UnauthorizedError } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/skills/runs?userId=0x...
 * Get user's skill run history
 */
export async function GET(req: NextRequest) {
  try {
    // 只能读自己的记录。改造前 userId 来自查询串,任何人都能枚举地址读别人的历史。
    const userId = requireUser(req);
    const skillId = req.nextUrl.searchParams.get('skillId');


    const runs = await prisma.skillRun.findMany({
      where: {
        userId,
        ...(skillId ? { skillId: parseInt(skillId) } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      runs: runs.map((r: any) => ({
        id: r.id,
        skillId: r.skillId,
        creditsCost: r.creditsCost.toString(),
        creditsCostFormatted: Number(r.creditsCost).toLocaleString(),
        runtimeMs: r.runtimeMs,
        status: r.status,
        outputPreview: r.outputPreview,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
      })),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('[API] Error fetching skill runs:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch skill runs' },
      { status: 500 }
    );
  }
}
