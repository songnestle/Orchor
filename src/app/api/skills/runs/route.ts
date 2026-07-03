import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/skills/runs?userId=0x...
 * Get user's skill run history
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const skillId = req.nextUrl.searchParams.get('skillId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter required' },
        { status: 400 }
      );
    }

    const runs = await prisma.skillRun.findMany({
      where: {
        userId,
        ...(skillId ? { skillId: parseInt(skillId) } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      runs: runs.map(r => ({
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
    console.error('[API] Error fetching skill runs:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch skill runs' },
      { status: 500 }
    );
  }
}
