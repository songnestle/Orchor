import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem } from "viem";
import { activeChain, ORCHOR_CORE_ADDRESS } from "@/lib/chain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/skills/stats — 链上事件索引器（最小可用版）
 *
 * 卡面上的调用曲线、累计调用、创作者收入,全部来自这里聚合的真实事件:
 *   SkillInvoked  -> 调用次数 + 近 30 日分桶曲线
 *   RevenueSplit  -> 创作者累计收入
 *
 * 之前的状态必须说清楚:改版删掉了 154,740 Total Runs 这类假统计,
 * 但卡面曲线仍在读 skills.ts 里手写的 sparkline 数组 —— 也是编的。
 * 这条路由存在的意义就是让「卡面即数据」这句话变成真的。
 *
 * 设计取舍:
 * - 模块级内存缓存 + 增量扫描。冷启动全量扫一次,之后每次只扫新块。
 *   进程重启缓存清零,对 demo 规模无所谓;上了量应换 subgraph 或数据库。
 * - 30 日分桶需要块时间戳,按块号缓存,每次刷新最多解析 800 个新块,
 *   超出预算时曲线标记为不完整,但总数仍然准确 —— 宁可少展示,不编造。
 * - 公开聚合数据,无需登录。
 * - 扫链失败返回 ok:false,前端显示破折号。失败绝不伪装成 0。
 */

const invokedEvt = parseAbiItem(
  "event SkillInvoked(address indexed user, uint256 indexed skillId, uint64 energySpent, bytes32 inputHash)"
);
const revenueEvt = parseAbiItem(
  "event RevenueSplit(uint256 indexed skillId, address indexed creator, uint256 creatorAmount, uint256 platformAmount, uint256 onchainLogAmount)"
);

interface SkillStat {
  calls: number;
  creatorEarnedWei: bigint;
  /** dayIndex(UTC 天序号) -> 当日调用数 */
  byDay: Map<number, number>;
  seriesComplete: boolean;
}

interface Cache {
  lastBlock: bigint;
  stats: Map<number, SkillStat>;
  blockTs: Map<string, number>;
  updatedAt: number;
  refreshing: Promise<void> | null;
}

const CHUNK = 9_500n;          // 单次 getLogs 的块跨度,保守取值兼容公共 RPC 限制
const MAX_CHUNKS_PER_CALL = 40; // 单次请求最多扫这么多段,剩余留给下一次
const TS_BUDGET = 800;          // 每次刷新最多解析的块时间戳数
const TTL_MS = 60_000;

const g = globalThis as unknown as { __orchorStats?: Cache };
function cache(): Cache {
  if (!g.__orchorStats) {
    const deployBlock = BigInt(process.env.ORCHOR_DEPLOY_BLOCK ?? "0");
    g.__orchorStats = {
      lastBlock: deployBlock > 0n ? deployBlock - 1n : 0n,
      stats: new Map(),
      blockTs: new Map(),
      updatedAt: 0,
      refreshing: null,
    };
  }
  return g.__orchorStats;
}

const client = createPublicClient({ chain: activeChain, transport: http() });

function stat(c: Cache, id: number): SkillStat {
  let s = c.stats.get(id);
  if (!s) {
    s = { calls: 0, creatorEarnedWei: 0n, byDay: new Map(), seriesComplete: true };
    c.stats.set(id, s);
  }
  return s;
}

async function refresh(c: Cache): Promise<void> {
  const latest = await client.getBlockNumber();
  if (latest <= c.lastBlock) return;

  let from = c.lastBlock + 1n;
  let tsBudget = TS_BUDGET;
  let chunks = 0;

  while (from <= latest && chunks < MAX_CHUNKS_PER_CALL) {
    const to = from + CHUNK > latest ? latest : from + CHUNK;

    const [invoked, revenue] = await Promise.all([
      client.getLogs({ address: ORCHOR_CORE_ADDRESS, event: invokedEvt, fromBlock: from, toBlock: to }),
      client.getLogs({ address: ORCHOR_CORE_ADDRESS, event: revenueEvt, fromBlock: from, toBlock: to }),
    ]);

    for (const log of revenue) {
      const id = Number(log.args.skillId);
      stat(c, id).creatorEarnedWei += log.args.creatorAmount ?? 0n;
    }

    for (const log of invoked) {
      const id = Number(log.args.skillId);
      const s = stat(c, id);
      s.calls += 1;

      const key = log.blockNumber.toString();
      let ts = c.blockTs.get(key);
      if (ts === undefined && tsBudget > 0) {
        tsBudget -= 1;
        try {
          const blk = await client.getBlock({ blockNumber: log.blockNumber });
          ts = Number(blk.timestamp);
          c.blockTs.set(key, ts);
        } catch {
          ts = undefined;
        }
      }
      if (ts === undefined) {
        // 时间戳预算用完:总数照记,曲线如实标记为不完整。
        s.seriesComplete = false;
      } else {
        const day = Math.floor(ts / 86_400);
        s.byDay.set(day, (s.byDay.get(day) ?? 0) + 1);
      }
    }

    c.lastBlock = to;
    from = to + 1n;
    chunks += 1;
  }

  c.updatedAt = Date.now();
}

function toSeries(s: SkillStat): number[] {
  const today = Math.floor(Date.now() / 1000 / 86_400);
  const out: number[] = [];
  for (let d = today - 29; d <= today; d++) out.push(s.byDay.get(d) ?? 0);
  return out;
}

export async function GET() {
  const c = cache();
  try {
    if (Date.now() - c.updatedAt > TTL_MS) {
      // 并发请求共享同一次刷新,避免同时把 RPC 打爆
      if (!c.refreshing) {
        c.refreshing = refresh(c).finally(() => (c.refreshing = null));
      }
      await c.refreshing;
    }

    const stats: Record<
      number,
      { calls: number; creatorEarnedWei: string; series: number[] | null }
    > = {};
    c.stats.forEach((s, id) => {
      stats[id] = {
        calls: s.calls,
        creatorEarnedWei: s.creatorEarnedWei.toString(),
        // 曲线不完整就不给 —— 半真半假的图比没有图更糟。
        series: s.seriesComplete ? toSeries(s) : null,
      };
    });

    return NextResponse.json({
      ok: true,
      updatedAt: c.updatedAt,
      scannedTo: c.lastBlock.toString(),
      stats,
    });
  } catch (e) {
    console.error("[skills/stats] 扫链失败:", e);
    // 失败如实上报。前端显示破折号,绝不把失败伪装成 0。
    return NextResponse.json({ ok: false, error: "INDEXER_UNAVAILABLE" }, { status: 503 });
  }
}
