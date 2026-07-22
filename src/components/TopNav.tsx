"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useOrchorState } from "@/lib/useOrchorState";
import { useCreditBalance } from "@/lib/hooks/useCreditBalance";
import { shortAddress } from "@/lib/chain";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { LangToggle } from "./LangToggle";

interface Props {
  onOpenDeck: () => void;
  onOpenTopUp: () => void;
  onOpenPublish: () => void;
  onOpenTopUpCredits: () => void;
}

const NAV: { key: TranslationKey; href: string }[] = [
  { key: "nav.discover", href: "/" },
  { key: "nav.explore", href: "/explore" },
  { key: "nav.marketplace", href: "/marketplace" },
  { key: "nav.rankings", href: "/rankings" },
  { key: "nav.deck", href: "/deck" },
  { key: "nav.creator", href: "/creator" },
];

export function TopNav({ onOpenDeck, onOpenTopUp, onOpenPublish, onOpenTopUpCredits }: Props) {
  const { walletBalanceMON: balance, energy, isConnected } = useOrchorState();
  const { creditsFormatted, usdValue, isLoading } = useCreditBalance();
  const { t } = useI18n();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-bg/55 border-b border-white/5">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 h-16 flex items-center justify-between gap-6">
        {/* logo */}
        <div className="flex items-center gap-3">
          <OrchorLogo />
          <div className="hidden sm:block font-display text-lg font-bold tracking-tight">
            Orch<span className="text-gradient">or</span>
            <span className="ml-2 align-middle inline-block px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider bg-accent/20 text-accent border border-accent/40">
              on Injective
            </span>
          </div>
        </div>

        {/* nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`relative px-3 h-8 flex items-center rounded-lg text-[11px] font-medium tracking-wide transition ${
                  isActive
                    ? "text-white"
                    : "text-mutedHi hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-white/10"
                    transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                  />
                )}
                <span className="relative">{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>

        {/* right */}
        <div className="flex items-center gap-2">
          {/* Orchor Credits - NEW */}
          {isConnected && (
            <button
              onClick={onOpenTopUpCredits}
              className="hidden sm:flex items-center gap-1.5 pl-2.5 pr-2 h-8 rounded-full glass hover:bg-white/[0.04] transition group relative"
              title="Top up Orchor Credits - Multi-chain instant payments"
            >
              <CreditIcon size={12} />
              {isLoading ? (
                <span className="font-mono text-[12px] text-[#edc26a] animate-pulse">...</span>
              ) : (
                <>
                  <span className="font-mono text-[12px] tabular text-[#edc26a]">{creditsFormatted}</span>
                  <span className="text-[10px] text-muted">credits</span>
                </>
              )}
              <span className="ml-0.5 inline-flex items-center justify-center h-6 w-6 rounded-full bg-white/10 group-hover:bg-white/20 text-[13px] leading-none pb-0.5 transition-all group-hover:scale-110">
                +
              </span>
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black/90 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                Multi-chain • Instant • ${usdValue}
              </div>
            </button>
          )}

          {/* Energy pill */}
          <button
            onClick={onOpenTopUp}
            className="hidden sm:flex items-center gap-1.5 pl-2 pr-1 h-8 rounded-full glass hover:bg-white/[0.04] transition group"
            title="Top up Energy"
          >
            <EnergyBolt />
            <span className="font-mono text-[12px] tabular text-white">{energy}</span>
            <span className="text-[10px] text-muted">⚡</span>
            <span className="ml-1 inline-flex items-center justify-center h-6 w-6 rounded-full bg-white/10 group-hover:bg-white/20 text-[13px] leading-none pb-0.5">
              +
            </span>
          </button>

          {/* Publish */}
          <button
            onClick={onOpenPublish}
            className="hidden md:flex items-center gap-1.5 px-3 h-8 rounded-lg text-[11px] font-medium border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition"
            title="Publish a new skill onchain"
          >
            <PlusIcon />
            <span className="text-white">Publish</span>
          </button>

          <div className="hidden lg:flex items-center gap-2 px-3 h-8 rounded-full glass text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulseDot" />
            <span className="text-mutedHi">Injective · MultiVM</span>
          </div>

          {isConnected && (
            <div className="hidden xl:flex items-center gap-2 px-3 h-8 rounded-full glass">
              <InjectiveIcon />
              <span className="font-mono text-[12px] tabular text-white">
                {balance.toFixed(2)}
              </span>
              <span className="text-[10px] text-muted">INJ</span>
            </div>
          )}

          <LangToggle />

          <WalletButton />
        </div>
      </div>
    </header>
  );
}

function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        return (
          <div>
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} className="btn-neon h-8 px-4 rounded-full text-[11px] font-medium">
                    Connect
                  </button>
                );
              }
              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openAccountModal}
                    className="flex items-center gap-2 pl-1 pr-3 h-8 rounded-full glass text-[11px] font-mono"
                  >
                    <span className="h-6 w-6 rounded-full bg-gradient-to-br from-accent to-accent2" />
                    {account.displayName}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

function OrchorLogo() {
  return (
    <div className="relative h-9 w-9">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#edc26a] via-[#d6a44c] to-[#bf5b4b] animate-gradientShift bg-[length:200%_200%]" />
      <div className="absolute inset-[2px] rounded-[10px] bg-bg2 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 32 32" className="h-5 w-5 text-white">
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#edc26a" />
              <stop offset="100%" stopColor="#d6a44c" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="10" fill="none" stroke="url(#logoGrad)" strokeWidth="2" />
          <circle cx="16" cy="16" r="4" fill="url(#logoGrad)" />
          <path
            d="M16 6 L16 10 M16 22 L16 26 M6 16 L10 16 M22 16 L26 16"
            stroke="url(#logoGrad)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

export function CreditIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="creditGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#edc26a" />
          <stop offset="100%" stopColor="#d6a44c" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="9" stroke="url(#creditGrad)" strokeWidth="2" />
      <path
        d="M12 8v8M8 12h8"
        stroke="url(#creditGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EnergyBolt({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="energyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0d493" />
          <stop offset="100%" stopColor="#d6a44c" />
        </linearGradient>
      </defs>
      <path
        d="M13 2 L4 14 L11 14 L9 22 L20 9 L13 9 Z"
        fill="url(#energyGrad)"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InjectiveIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="14" fill="url(#injectiveGrad)" />
      <defs>
        <linearGradient id="injectiveGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5ec9f8" />
          <stop offset="100%" stopColor="#0b63c9" />
        </linearGradient>
      </defs>
      <text
        x="16"
        y="20"
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="bold"
      >
        I
      </text>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5 V19 M5 12 H19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Fix: Import motion from framer-motion
import { motion } from "framer-motion";
