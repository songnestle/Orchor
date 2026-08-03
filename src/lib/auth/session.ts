import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

/**
 * 钱包签名登录（SIWE 风格）的会话层。
 *
 * 改造前的状态：所有 API 的身份都来自请求体。
 *   /api/skills/execute   —— 传谁的 userId 就扣谁的 credits
 *   /api/creator/withdraw —— 传任意 creatorAddress + 自己的收款地址,
 *                            就能把别人的创作者收益提走
 *   /api/credits/deposit/demo —— 无鉴权白送最高 $10,000
 *
 * 现在：身份只能来自一枚 HMAC 签名的 httpOnly cookie,
 * 而这枚 cookie 只有在用户用私钥签过一条带 nonce 的消息之后才会发出。
 * 请求体里的 userId 一律忽略。
 *
 * 刻意不引入 next-auth / iron-session —— 只需要 HMAC 和 viem 的验签,
 * 少一个依赖就少一个供应链面。
 */

const COOKIE = "orchor_session";
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 天

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    // 没有密钥就不要假装有鉴权。宁可整条链路失败,也不要静默降级成裸奔。
    throw new Error(
      "AUTH_SECRET 未设置或长度不足 32 —— 请在环境变量里配置后再启动。生成：openssl rand -hex 32"
    );
  }
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function issueToken(address: string): { token: string; expires: Date } {
  const exp = Date.now() + TTL_MS;
  const payload = `${address.toLowerCase()}.${exp}`;
  return { token: `${payload}.${sign(payload)}`, expires: new Date(exp) };
}

/** 校验 token,返回小写地址;任何异常一律返回 null,不抛。 */
export function verifyToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [address, expStr, mac] = parts;
  const payload = `${address}.${expStr}`;
  try {
    if (!safeEqual(mac, sign(payload))) return null;
  } catch {
    return null;
  }
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return null;
  if (!/^0x[0-9a-f]{40}$/.test(address)) return null;
  return address;
}

export const SESSION_COOKIE = COOKIE;

export function sessionCookieOptions(expires: Date) {
  return {
    name: COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  };
}

/** 从请求里取出已登录地址;未登录返回 null。 */
export function getSessionAddress(req?: NextRequest): string | null {
  const token = req
    ? req.cookies.get(COOKIE)?.value
    : cookies().get(COOKIE)?.value;
  return verifyToken(token);
}

/**
 * 要求登录。未登录时抛 UnauthorizedError,由路由统一转成 401。
 *
 * 用法：
 *   const user = requireUser(req);   // 永远用这个,不要读 body.userId
 */
export class UnauthorizedError extends Error {
  constructor(message = "请先连接钱包并登录") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function requireUser(req?: NextRequest): string {
  const addr = getSessionAddress(req);
  if (!addr) throw new UnauthorizedError();
  return addr;
}

/* ─────────────────────────── nonce ─────────────────────────── */

/**
 * nonce 用无状态签名实现:自带时间戳和 HMAC,不需要 Redis 或数据库表。
 * 有效期 5 分钟,足够完成一次签名,又短到重放没有价值。
 */
const NONCE_TTL_MS = 5 * 60 * 1000;

export function issueNonce(): string {
  const exp = Date.now() + NONCE_TTL_MS;
  const rand = randomBytes(16).toString("hex");
  const payload = `${rand}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function consumeNonce(nonce: string): boolean {
  const parts = nonce.split(".");
  if (parts.length !== 3) return false;
  const [rand, expStr, mac] = parts;
  try {
    if (!safeEqual(mac, sign(`${rand}.${expStr}`))) return false;
  } catch {
    return false;
  }
  const exp = Number(expStr);
  return Number.isFinite(exp) && Date.now() <= exp;
}

/** 用户要签名的消息。地址与 nonce 都在里面,防止跨站重放。 */
export function loginMessage(address: string, nonce: string): string {
  return [
    "Orchor 登录",
    "",
    `地址: ${address}`,
    `Nonce: ${nonce}`,
    "",
    "签名不会发起任何交易,也不会花费任何费用。",
  ].join("\n");
}
