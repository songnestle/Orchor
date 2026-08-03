"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";

/**
 * 钱包签名登录。
 *
 * 连上钱包不等于登录 —— 连接只证明浏览器里有个地址,
 * 签名才证明这个地址的私钥在场。所有会花钱或读私有数据的 API 都要求后者。
 *
 * 签名不发起交易、不花 gas,这一点在消息文本里也写给用户看了。
 */
export function useSession() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [signedIn, setSignedIn] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 页面加载时问一次后端"我是谁",避免每次刷新都要重签。 */
  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive) setSignedIn(d?.address ?? null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  /** 钱包切换地址后,旧会话立即失效。 */
  useEffect(() => {
    if (signedIn && address && signedIn.toLowerCase() !== address.toLowerCase()) {
      setSignedIn(null);
    }
  }, [address, signedIn]);

  const signIn = useCallback(async () => {
    if (!address) throw new Error("请先连接钱包");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/nonce?address=${address}`);
      if (!res.ok) throw new Error("获取登录消息失败");
      const { nonce, message } = await res.json();

      const signature = await signMessageAsync({ message });

      const verify = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, nonce, signature }),
      });
      if (!verify.ok) {
        const d = await verify.json().catch(() => ({}));
        throw new Error(d.error ?? "登录失败");
      }
      const d = await verify.json();
      setSignedIn(d.address);
      return d.address as string;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "登录失败";
      setError(msg.toLowerCase().includes("user rejected") ? "已取消签名" : msg);
      throw e;
    } finally {
      setBusy(false);
    }
  }, [address, signMessageAsync]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSignedIn(null);
  }, []);

  /** 需要鉴权的请求走这里:未登录时先弹签名,再发请求。 */
  const authedFetch = useCallback(
    async (input: string, init?: RequestInit) => {
      if (!signedIn) await signIn();
      return fetch(input, { ...init, credentials: "same-origin" });
    },
    [signedIn, signIn]
  );

  return {
    address,
    isConnected,
    /** 已签名登录的地址,未登录为 null */
    signedIn,
    isSignedIn: Boolean(signedIn),
    signIn,
    signOut,
    authedFetch,
    busy,
    error,
  };
}
