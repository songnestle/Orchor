import { NextRequest, NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/auth/me — 当前会话对应的地址,未登录返回 401。 */
export async function GET(req: NextRequest) {
  try {
    const address = getSessionAddress(req);
    if (!address) return NextResponse.json({ error: "NOT_SIGNED_IN" }, { status: 401 });
    return NextResponse.json({ address });
  } catch {
    // AUTH_SECRET 未配置时也按未登录处理,不泄露配置状态
    return NextResponse.json({ error: "NOT_SIGNED_IN" }, { status: 401 });
  }
}
