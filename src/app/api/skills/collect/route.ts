import { NextResponse } from "next/server";

/**
 * POST /api/skills/collect
 * Collect (own) a skill card by spending Credits.
 * Credits are funded via multi-chain deposits (TRON / Base / Ethereum).
 *
 * NOTE: Currently a mock. Real implementation requires DB connection
 * to deduct Credits and record ownership in the ledger.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { skillId, credits } = body;

    if (skillId === undefined || !credits) {
      return NextResponse.json(
        { error: "Missing skillId or credits" },
        { status: 400 }
      );
    }

    // TODO: When DATABASE_URL is configured:
    // 1. Verify user has enough Credits
    // 2. Deduct `credits` from user balance
    // 3. Record ownership in `ownership` table
    // 4. Split revenue: 70% creator / 20% platform / 10% treasury

    return NextResponse.json({
      success: true,
      skillId,
      creditsSpent: credits,
      output: `Card #${skillId} collected for ${credits} Credits.`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Collect failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
