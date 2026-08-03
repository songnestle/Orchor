import { createPublicClient, http } from "viem";
import { activeChain, ORCHOR_ABI, ORCHOR_CORE_ADDRESS } from "./chain";

/**
 * 服务端读链。
 *
 * 存在的理由:改造前 /api/skills/execute 只看链下 credits 余额,
 * 完全不查链上权限 —— 不解锁、不订阅、一分 INJ 不花,也能调用任何技能。
 * 这是整个「链上确权」叙事的技术信用缺口:README 说权限由合约裁决,
 * 而真正执行 AI 的那条路径根本没问过合约。
 *
 * 现在执行前必须过 hasAccess。
 */

const client = createPublicClient({
  chain: activeChain,
  transport: http(),
});

export async function hasOnchainAccess(
  user: string,
  skillId: number
): Promise<boolean> {
  try {
    return (await client.readContract({
      address: ORCHOR_CORE_ADDRESS,
      abi: ORCHOR_ABI,
      functionName: "hasAccess",
      args: [user as `0x${string}`, BigInt(skillId)],
    })) as boolean;
  } catch (e) {
    // 读链失败时**拒绝**而不是放行。
    // 放行会让一次 RPC 抖动变成免费调用的后门。
    console.error("[chainAccess] hasAccess 读取失败,按无权限处理:", e);
    return false;
  }
}
