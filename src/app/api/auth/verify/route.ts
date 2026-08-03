import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "viem";
import {
  consumeNonce,
  issueToken,
  loginMessage,
  sessionCookieOptions,
} from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/auth/verify
 * Body: { address, nonce, signature }
 *
 * 验签成功后下发 httpOnly session cookie。此后所有 API 的身份都来自这枚 cookie,
 * 请求体里的 userId / creatorAddress 一律忽略。
 */
export async function POST(req: NextRequest) {
  try {
    const { address, nonce, signature } = await req.json();

    if (!address || !nonce || !signature) {
      return NextResponse.json(
        { error: "address、nonce、signature 都是必填" },
        { status: 400 }
      );
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      return NextResponse.json({ error: "address 无效" }, { status: 400 });
    }
    if (!consumeNonce(nonce)) {
      return NextResponse.json(
        { error: "nonce 已过期或无效,请重新登录" },
        { status: 400 }
      );
    }

    const lower = address.toLowerCase() as `0x${string}`;

    // 消息里同时包含地址和 nonce —— 签名无法被挪到别的地址或别的站点上重放。
    const ok = await verifyMessage({
      address: lower,
      message: loginMessage(lower, nonce),
      signature: signature as `0x${string}`,
    });

    if (!ok) {
      return NextResponse.json({ error: "签名校验失败" }, { status: 401 });
    }

    const { token, expires } = issueToken(lower);
    const res = NextResponse.json({ address: lower });
    res.cookies.set({ ...sessionCookieOptions(expires), value: token });
    return res;
  } catch (e) {
    console.error("[auth/verify]", e);
    const msg = e instanceof Error ? e.message : "登录失败";
    // AUTH_SECRET 缺失属于配置错误,应该明确失败而不是静默放行
    const isConfig = msg.includes("AUTH_SECRET");
    return NextResponse.json(
      { error: isConfig ? "服务端未配置 AUTH_SECRET" : "登录失败" },
      { status: isConfig ? 500 : 400 }
    );
  }
}
