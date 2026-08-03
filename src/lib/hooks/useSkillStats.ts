"use client";

import { useEffect, useState } from "react";

/**
 * 链上统计(来自 /api/skills/stats 事件索引器)。
 *
 * 三种状态,卡面对应三种渲染,不许混淆:
 *   loading / 失败  -> undefined  -> 卡面显示破折号
 *   成功且有事件    -> 数字与曲线
 *   成功且零事件    -> 0 与平基线 —— 这是真实的零,新卡就该长这样
 */
export interface SkillStat {
  calls: number;
  creatorEarnedInj: number;
  series: number[] | null;
}

export function useSkillStats() {
  const [stats, setStats] = useState<Record<number, SkillStat> | undefined>(undefined);
  const [scannedTo, setScannedTo] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/skills/stats");
        if (!res.ok) return; // 保持 undefined,卡面显示破折号
        const d = await res.json();
        if (!alive || !d.ok) return;
        const out: Record<number, SkillStat> = {};
        for (const [id, s] of Object.entries(
          d.stats as Record<string, { calls: number; creatorEarnedWei: string; series: number[] | null }>
        )) {
          out[Number(id)] = {
            calls: s.calls,
            creatorEarnedInj: Number(BigInt(s.creatorEarnedWei) / 10n ** 12n) / 1e6,
            series: s.series,
          };
        }
        setStats(out);
        setScannedTo(d.scannedTo ?? null);
      } catch {
        /* 保持 undefined */
      }
    };
    load();
    const t = setInterval(load, 90_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return { stats, scannedTo };
}
