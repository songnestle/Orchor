"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useOrchorState } from "@/lib/useOrchorState";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { LangToggle } from "./LangToggle";

interface Props {
  onOpenDeck: () => void;
  onOpenTopUp: () => void;
  onOpenPublish: () => void;
  onOpenTopUpCredits: () => void;
}

/**
 * 顶栏。
 *
 * 改版前这里有 13 个元素:6 个菜单 + Credits + Energy + Publish + 链标 +
 * INJ 余额 + 语言 + Connect,一行塞不下就靠断点逐个藏起来 —— 等于每种
 * 屏宽下用户看到的是不同的产品。
 *
 * 现在只留三组:身份(logo)、找东西(搜索)、我的账户(Energy / 语言 /
 * 钱包)。导航压到三个真正不同的目的地:市场、卡组、创作者。
 * Publish 收进创作者页,链标与 INJ 余额收进钱包菜单 —— 它们是状态,
 * 不是操作,不该常驻在最贵的一行像素里。
 */

const NAV: { key: TranslationKey; href: string }[] = [
  { key: "nav.marketplace", href: "/" },
  { key: "nav.deck", href: "/deck" },
  { key: "nav.creator", href: "/creator" },
];

export function TopNav({ onOpenTopUp }: Props) {
  const { energy } = useOrchorState();
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // "/" 聚焦搜索 —— 和 pools.trade 一样,是这类站点的通用肌肉记忆
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    router.push(v ? `/?q=${encodeURIComponent(v)}` : "/");
  };

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-xl"
      style={{ background: "rgba(10,9,6,.72)", borderBottom: "1px solid var(--o-hair)" }}
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0">
          <OrchorMark />
          <span
            className="hidden sm:block text-[18px]"
            style={{ fontFamily: "var(--o-serif)", color: "var(--o-ink)" }}
          >
            Orchor
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 shrink-0">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-[14px] no-underline transition-colors duration-150"
                style={{
                  borderRadius: "var(--o-r-pill)",
                  color: active ? "var(--o-ink)" : "var(--o-ink-dim)",
                  background: active ? "rgba(237,231,216,.07)" : "transparent",
                }}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        {/* 搜索占据中间的全部剩余宽度 —— 32 张卡之后,找卡才是主要动作 */}
        <form onSubmit={submit} className="flex-1 max-w-[520px] mx-auto">
          <div className="relative">
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("market.searchPlaceholder")}
              aria-label={t("market.searchPlaceholder")}
              className="w-full text-[14px] pl-9 pr-9 py-2 outline-none transition-colors duration-150"
              style={{
                borderRadius: "var(--o-r-pill)",
                background: "var(--o-raise)",
                border: "1px solid transparent",
                color: "var(--o-ink)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--o-hair-hi)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "transparent")}
            />
            <SearchIcon />
            <kbd
              className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 text-[11px] px-1.5 rounded"
              style={{ color: "var(--o-ink-faint)", background: "rgba(237,231,216,.06)" }}
            >
              /
            </kbd>
          </div>
        </form>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenTopUp}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[14px] transition-colors duration-150"
            style={{
              borderRadius: "var(--o-r-pill)",
              background: "var(--o-raise)",
              color: "var(--o-ink)",
            }}
            title={t("top.energy")}
          >
            <span className="num">{energy}</span>
            <span style={{ color: "var(--o-ink-faint)" }}>⚡</span>
          </button>
          <LangToggle />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
      width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden
    >
      <circle cx="11" cy="11" r="7" stroke="var(--o-ink-faint)" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="var(--o-ink-faint)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className="px-4 py-1.5 text-[14px] transition-[filter] duration-150 hover:brightness-95"
              style={{ borderRadius: "var(--o-r-pill)", background: "var(--o-ink)", color: "#141209" }}
            >
              Connect
            </button>
          );
        }
        return (
          <button
            onClick={openAccountModal}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 text-[14px] num"
            style={{ borderRadius: "var(--o-r-pill)", background: "var(--o-raise)", color: "var(--o-ink)" }}
          >
            <span
              className="h-5 w-5 rounded-full"
              style={{ background: "linear-gradient(160deg,#d9bc7e,#b8955a)" }}
            />
            {account.displayName}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}

function OrchorMark() {
  return (
    <span
      className="relative h-8 w-8 grid place-items-center rounded-[10px]"
      style={{ border: "1px solid var(--o-hair-gold)" }}
    >
      <svg viewBox="0 0 32 32" className="h-4 w-4" aria-hidden>
        <circle cx="16" cy="16" r="9" fill="none" stroke="var(--o-gold)" strokeWidth="1.6" />
        <circle cx="16" cy="16" r="3.2" fill="var(--o-gold)" />
        <path
          d="M16 5.5V9 M16 23v3.5 M5.5 16H9 M23 16h3.5"
          stroke="var(--o-gold)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function CreditIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="var(--o-gold)" strokeWidth="2" />
      <path d="M12 8v8M8 12h8" stroke="var(--o-gold)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* 顶栏不再常驻这两个图标,但充值弹窗/卡组抽屉/发布弹窗仍在用它们 */
export function EnergyBolt({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="var(--o-gold)" />
    </svg>
  );
}

export function InjectiveIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="var(--o-ink-dim)" strokeWidth="2" />
      <path d="M8 15c2-6 6-6 8 0" stroke="var(--o-ink-dim)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
