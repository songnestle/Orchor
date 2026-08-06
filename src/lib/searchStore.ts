"use client";

import { useEffect, useReducer } from "react";

/**
 * 全站搜索词。
 *
 * 为什么不用 useSearchParams:它会让页面退出静态预渲染。首页因此只能
 * 输出一个空的 Suspense 骨架,32 张卡要等 JS 下载执行完才出现 —— 实测
 * 首屏从 HTML 就有内容变成了要等 4.4 秒。
 *
 * 这里用模块级 store:顶栏写、首页读,URL 用 history.pushState 同步
 * (链接仍可分享、前进后退仍可用),但读取发生在 effect 里,不参与
 * 服务端渲染,页面于是重新变回可静态预渲染。
 */
let query = "";
const subs = new Set<() => void>();

function emit() {
  subs.forEach((fn) => fn());
}

export function setSearchQuery(q: string, opts: { pushUrl?: boolean } = {}) {
  query = q;
  if (opts.pushUrl && typeof window !== "undefined") {
    const url = q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : "/";
    window.history.pushState({}, "", url);
  }
  emit();
}

/** 从当前 URL 读一次 —— 供首页挂载时与浏览器前进/后退时调用 */
export function syncFromUrl() {
  if (typeof window === "undefined") return;
  const q = new URLSearchParams(window.location.search).get("q") ?? "";
  if (q !== query) {
    query = q;
    emit();
  }
}

export function useSearchQuery(): string {
  const [, bump] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    subs.add(bump);
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => {
      subs.delete(bump);
      window.removeEventListener("popstate", syncFromUrl);
    };
  }, []);
  return query;
}
