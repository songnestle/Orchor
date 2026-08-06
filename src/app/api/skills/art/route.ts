import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { activeChain, ORCHOR_CORE_ADDRESS } from "@/lib/chain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/skills/art — 链上卡面图。
 *
 * 合约的 uri(id) 现算一张完整的证书 SVG(稀有度徽章、按 id 生成的几何
 * 纹样、解锁价/铸造量/能耗、Injective 落款)。MetaMask 一直在显示它,
 * 而我们自己的网站从来没渲染过 —— 卡片全靠文字,看起来张张相同。
 *
 * 走服务端而不是客户端直读:32 张卡就是 32 个 eth_call,每个客户端
 * 都重跑一遍太浪费。这里读一次、全局缓存,前端一个请求拿全部。
 *
 * SVG 里含 minted 数量,会随铸造变化,所以缓存 10 分钟而不是永久。
 * 读失败返回 ok:false,前端回退到无图版式 —— 不塞占位图假装有内容。
 */

const uriAbi = [
  {
    type: "function",
    name: "uri",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "nextSkillId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

interface Cache {
  art: Record<number, string>;
  updatedAt: number;
  refreshing: Promise<void> | null;
}

const TTL_MS = 10 * 60_000;

const g = globalThis as unknown as { __orchorArt?: Cache };
function cache(): Cache {
  if (!g.__orchorArt) g.__orchorArt = { art: {}, updatedAt: 0, refreshing: null };
  return g.__orchorArt;
}

const client = () =>
  createPublicClient({ chain: activeChain, transport: http() });

/** data:application/json;base64,... -> 内联 SVG 的 data URI */
function extractImage(tokenUri: string): string | null {
  const comma = tokenUri.indexOf(",");
  if (comma < 0) return null;
  try {
    const json = JSON.parse(Buffer.from(tokenUri.slice(comma + 1), "base64").toString("utf8"));
    const img = String(json.image ?? "");
    return img.startsWith("data:image/svg+xml;base64,") ? img : null;
  } catch {
    return null;
  }
}

async function refresh(c: Cache) {
  const pc = client();
  const total = Number(
    await pc.readContract({ address: ORCHOR_CORE_ADDRESS, abi: uriAbi, functionName: "nextSkillId" })
  );
  const out: Record<number, string> = {};
  // 分批并发,别把公共 RPC 一次打爆
  const BATCH = 8;
  for (let i = 0; i < total; i += BATCH) {
    const ids = Array.from({ length: Math.min(BATCH, total - i) }, (_, k) => i + k);
    const uris = await Promise.all(
      ids.map((id) =>
        pc
          .readContract({ address: ORCHOR_CORE_ADDRESS, abi: uriAbi, functionName: "uri", args: [BigInt(id)] })
          .catch(() => null)
      )
    );
    ids.forEach((id, k) => {
      const u = uris[k];
      if (typeof u === "string") {
        const img = extractImage(u);
        if (img) out[id] = img;
      }
    });
  }
  c.art = out;
  c.updatedAt = Date.now();
}

export async function GET() {
  const c = cache();
  try {
    if (Date.now() - c.updatedAt > TTL_MS) {
      if (!c.refreshing) {
        c.refreshing = refresh(c).finally(() => (c.refreshing = null));
      }
      // 已有缓存就先用旧的,只有冷启动才等
      if (!Object.keys(c.art).length) await c.refreshing;
    }
  } catch {
    if (!Object.keys(c.art).length) {
      return NextResponse.json({ ok: false, art: {} }, { status: 200 });
    }
  }

  return NextResponse.json({
    ok: true,
    updatedAt: c.updatedAt,
    art: c.art,
  });
}
