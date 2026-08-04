"use client";

import { useEffect, useReducer } from "react";

/**
 * 链上统计(来自 /api/skills/stats 事件索引器)。
 *
 * 三种状态,卡面对应三种渲染,不许混淆:
 *   loading / 失败  -> undefined  -> 卡面显示破折号
 *   成功且有事件    -> 数字与曲线
 *   成功且零事件    -> 0 与平基线 —— 这是真实的零,新卡就该长这样
 *
 * 模块级共享:SmartPicks / SkillGrid / 页面会同时用这个 hook,
 * 若各自 fetch,同屏就是 N 份请求 + N 个 90s 轮询。这里全局只有
 * 一份缓存、一个定时器,组件只是订阅者。
 */
export interface SkillStat {
  calls: number;
  creatorEarnedInj: number;
  series: number[] | null;
}

interface Snapshot {
  stats: Record<number, SkillStat> | undefined;
  scannedTo: string | null;
}

let snapshot: Snapshot = { stats: undefined, scannedTo: null };
const subscribers = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let loading = false;

async function load() {
  if (loading) return;
  loading = true;
  try {
    const res = await fetch("/api/skills/stats");
    if (!res.ok) return; // 保持现状,卡面显示破折号
    const d = await res.json();
    if (!d.ok) return;
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
    snapshot = { stats: out, scannedTo: d.scannedTo ?? null };
    subscribers.forEach((fn) => fn());
  } catch {
    /* 保持现状 */
  } finally {
    loading = false;
  }
}

export function useSkillStats(): Snapshot {
  const [, bump] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    subscribers.add(bump);
    if (!timer) {
      void load();
      timer = setInterval(() => void load(), 90_000);
    }
    return () => {
      subscribers.delete(bump);
      if (!subscribers.size && timer) {
        clearInterval(timer);
        timer = null;
      }
    };
  }, []);

  return snapshot;
}
