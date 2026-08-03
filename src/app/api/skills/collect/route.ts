import { NextResponse } from "next/server";

/**
 * POST /api/skills/collect — 已下线。
 *
 * 这里曾是一个 mock:不查余额、不记账,对任何请求都返回「收藏成功」。
 * 假成功比报错更糟 —— 用户以为自己拥有了一张卡,而链上和账本里什么都没有。
 *
 * 收藏(买断)现在只有一条路径:链上 unlockSkill。
 * 前端入口是 CertificateCard 的解锁按钮,详见 useOrchorWrites().unlock。
 */
export async function POST() {
  return NextResponse.json(
    { error: "GONE_USE_ONCHAIN_UNLOCK" },
    { status: 410 }
  );
}
