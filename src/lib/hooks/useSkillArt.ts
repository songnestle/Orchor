"use client";

import { useEffect, useReducer } from "react";

/**
 * 链上卡面图(来自 /api/skills/art)。
 *
 * 与 useSkillStats 同样的模块级共享缓存:一个页面上 SkillGrid、
 * 详情弹窗、卡组抽屉都会要图,各自 fetch 就是三份重复请求。
 *
 * 值是 data:image/svg+xml;base64,... 可直接进 <img src>。
 * 拿不到就是 undefined,卡片回退到无图版式,不塞占位图。
 */
type ArtMap = Record<number, string>;

let snapshot: ArtMap | undefined = undefined;
const subscribers = new Set<() => void>();
let loaded = false;
let loading = false;

async function load() {
  if (loading) return;
  loading = true;
  try {
    const res = await fetch("/api/skills/art");
    if (!res.ok) return;
    const d = await res.json();
    if (!d.ok) return;
    snapshot = d.art as ArtMap;
    subscribers.forEach((fn) => fn());
  } catch {
    /* 保持 undefined */
  } finally {
    loading = false;
  }
}

export function useSkillArt(): ArtMap | undefined {
  const [, bump] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    subscribers.add(bump);
    if (!loaded) {
      loaded = true;
      void load();
    }
    return () => {
      subscribers.delete(bump);
    };
  }, []);

  return snapshot;
}
