import { NextResponse } from "next/server";
import { issueNonce, loginMessage, type MsgLang } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/nonce?address=0x...
 * 返回待签名的消息。nonce 是无状态的（自带时间戳 + HMAC），5 分钟有效。
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address");
  const lang: MsgLang = url.searchParams.get("lang") === "zh" ? "zh" : "en";
  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json({ error: "BAD_ADDRESS" }, { status: 400 });
  }
  const nonce = issueNonce();
  return NextResponse.json({
    nonce,
    lang,
    message: loginMessage(address.toLowerCase(), nonce, lang),
  });
}
