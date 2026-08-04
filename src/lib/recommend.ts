import type { SkillModule } from "./skills";
import type { SkillStat } from "./hooks/useSkillStats";

/**
 * 智能推荐 —— 只从真实链上数据推导,规则可解释,每个推荐位都带理由:
 *
 *   trending  近 30 日真实调用最多
 *   value     每 INJ 换到的调用最多(调用数 / 解锁价)
 *   deckMatch 连了钱包且有持仓:与持仓同类目、调用最多的未持有卡
 *   topEarner 没有持仓可参考时的第三位:创作者真实收入最高
 *
 * 统计未加载(undefined)或全零时返回空数组 —— 页面隐藏推荐条,
 * 不摆没有依据的推荐。这里没有任何编造:理由本身就是链上指标。
 */

export type PickReason = "picks.trending" | "picks.value" | "picks.deckMatch" | "picks.topEarner";

export interface SmartPick {
  skill: SkillModule;
  reasonKey: PickReason;
  calls: number;
}

export function computePicks(
  skills: SkillModule[],
  stats: Record<number, SkillStat> | undefined,
  balances?: Map<number, number>,
  /** 链上解锁价(wei)。缺省才退回 skills.ts 的静态价 —— 卡面显示的是链上价,
   *  「性价比」若按静态价排序,推荐结论会和用户看到的价格对不上。 */
  unlockPriceWei?: Map<number, bigint>
): SmartPick[] {
  if (!stats || !skills.length) return [];
  const callsOf = (s: SkillModule) => stats[s.id]?.calls ?? 0;
  const earnedOf = (s: SkillModule) => stats[s.id]?.creatorEarnedInj ?? 0;
  const priceOf = (s: SkillModule) => {
    const wei = unlockPriceWei?.get(s.id);
    return wei !== undefined && wei > 0n ? Number(wei) / 1e18 : s.priceMON;
  };
  if (!skills.some((s) => callsOf(s) > 0)) return [];

  const taken = new Set<number>();
  const picks: SmartPick[] = [];
  const best = (pool: SkillModule[], score: (s: SkillModule) => number) => {
    let win: SkillModule | undefined;
    let winScore = 0;
    for (const s of pool) {
      if (taken.has(s.id)) continue;
      const sc = score(s);
      if (sc > winScore) { win = s; winScore = sc; }
    }
    return win;
  };
  const push = (skill: SkillModule | undefined, reasonKey: PickReason) => {
    if (!skill) return;
    taken.add(skill.id);
    picks.push({ skill, reasonKey, calls: callsOf(skill) });
  };

  push(best(skills, callsOf), "picks.trending");
  push(best(skills, (s) => callsOf(s) / Math.max(priceOf(s), 0.001)), "picks.value");

  const held = skills.filter((s) => (balances?.get(s.id) ?? 0) > 0);
  const heldCats = new Set(held.map((s) => s.category));
  const unheldSameCat = skills.filter(
    (s) => heldCats.has(s.category) && (balances?.get(s.id) ?? 0) === 0
  );
  const match = best(unheldSameCat, callsOf);
  if (match) push(match, "picks.deckMatch");
  else push(best(skills, earnedOf), "picks.topEarner");

  return picks;
}
