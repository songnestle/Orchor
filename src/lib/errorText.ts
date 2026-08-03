"use client";

import { useI18n } from "./i18n";

/**
 * 错误码 -> 本地化文案。
 *
 * 约定：后端路由、合约 hook、useSession 一律只抛稳定的大写代号，
 * 展示层用这个 hook 翻译。在业务代码里硬编码任何一种语言，
 * 都会让另一半用户看到夹生界面 —— 这个产品是 EN/中 双语的。
 *
 * 认不出的代号原样返回（钱包和 RPC 抛出的英文原文仍然比空白有用）。
 */
export function useErrorText() {
  const { t } = useI18n();
  return (err: unknown, chainName?: string): string => {
    const raw = err instanceof Error ? err.message : String(err ?? "");
    if (!raw) return t("err.SIGNIN_FAILED");
    const code = raw.trim().toUpperCase();
    const known = [
      "WALLET_REQUIRED", "NONCE_FAILED", "SIGNIN_FAILED", "USER_REJECTED",
      "NO_ACCESS", "UNAUTHORIZED", "PRICE_UNAVAILABLE", "WRONG_NETWORK",
      "NAME_LENGTH", "NAME_CHARS", "NOT_SIGNED_IN", "BAD_ADDRESS",
      "BAD_SIGNATURE", "MISSING_FIELDS", "EXECUTION_FAILED",
    ];
    if (known.includes(code)) {
      return t(`err.${code}` as never, chainName ? { chain: chainName } : undefined);
    }
    if (raw.toLowerCase().includes("user rejected")) return t("err.USER_REJECTED");
    return raw;
  };
}
