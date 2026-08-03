import { NextResponse } from "next/server";
import { issueNonce, loginMessage } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/nonce?address=0x...
 * 返回待签名的消息。nonce 是无状态的（自带时间戳 + HMAC），5 分钟有效。
 */
export async function GET(req: Request) {
  const address = new URL(req.url).searchParams.get("address");
  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json({ error: "address 无效" }, { status: 400 });
  }
  const nonce = issueNonce();
  return NextResponse.json({
    nonce,
    message: loginMessage(address.toLowerCase(), nonce),
  });
}
