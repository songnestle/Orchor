"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useOrchorState } from "@/lib/useOrchorState";

interface Props {
  onOpenDeck: () => void;
  onOpenTopUp: () => void;
  onOpenPublish: () => void;
}

const NAV = ["Discover", "Skill Packs", "Creators", "Inventory"] as const;

export function TopNav({ onOpenDeck, onOpenTopUp, onOpenPublish }: Props) {
  const { walletBalanceMON: balance, energy, isConnected } = useOrchorState();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-bg/55 border-b border-white/5">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 h-16 flex items-center justify-between gap-6">
        {/* logo */}
        <div className="flex items-center gap-3">
          <OrchorLogo />
          <div className="hidden sm:block font-display text-lg font-bold tracking-tight">
            Orch<span className="text-gradient">or</span>
            <span className="ml-2 align-middle text-[9px] uppercase tracking-[0.2em] text-mutedHi border border-white/10 rounded px-1.5 py-0.5">
              Skill Layer
            </span>
          </div>
        </div>

        {/* center nav */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full glass">
          {NAV.map((item) => {
            const active = item === "Discover";
            return (
              <button
                key={item}
                onClick={() => {
                  if (item === "Inventory") onOpenDeck();
                }}
                className={`relative px-4 py-1.5 text-[13px] rounded-full transition ${
                  active ? "text-white" : "text-mutedHi hover:text-white"
                }`}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/30 to-accent2/30 border border-white/10"
                  />
                )}
                <span className="relative">{item}</span>
              </button>
            );
          })}
        </nav>

        {/* right */}
        <div className="flex items-center gap-2">
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
            className="hidden sm:inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-semibold border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition"
            title="Publish a new skill onchain"
          >
            <PlusIcon />
            <span className="text-white">Publish</span>
          </button>

          <div className="hidden lg:flex items-center gap-2 px-3 h-8 rounded-full glass text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulseDot" />
            <span className="text-mutedHi">Monad · Hosted Runtime</span>
          </div>

          {isConnected && (
            <div className="hidden xl:flex items-center gap-2 px-3 h-8 rounded-full glass">
              <MonadIcon />
              <span className="font-mono text-[12px] tabular text-white">
                {balance.toFixed(2)}
              </span>
              <span className="text-[10px] text-muted">MON</span>
            </div>
          )}

          <WalletButton />
        </div>
      </div>
    </header>
  );
}

/** RainbowKit-powered connect / wrong-network / account button.
 *  All visuals stay native to Orchor (glass + neon). The 3 underlying
 *  modals (wallet picker, network switcher, account/disconnect) come from
 *  RainbowKit and handle every supported wallet incl. Phantom EVM. */
function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="btn-neon px-4 h-8 rounded-full text-[12px]"
                  >
                    Connect Wallet
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="px-4 h-8 rounded-full text-[12px] font-semibold bg-amber-500 text-black hover:bg-amber-400 transition"
                  >
                    Wrong network
                  </button>
                );
              }
              return (
                <div className="flex items-center gap-1">
                  <button
                    onClick={openChainModal}
                    className="hidden md:flex items-center gap-1 px-2 h-8 rounded-full glass text-[11px]"
                    title="Switch network"
                  >
                    {chain.hasIcon && chain.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={chain.iconUrl}
                        alt={chain.name ?? "chain"}
                        className="h-4 w-4 rounded-full"
                      />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    )}
                    <span className="text-mutedHi">
                      {chain.name?.replace(" Testnet", "") ?? "Network"}
                    </span>
                  </button>
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
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent via-fuchsia-500 to-accent2 animate-gradientShift bg-[length:200%_200%]" />
      <div className="absolute inset-[2px] rounded-[10px] bg-bg2 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 32 32" className="h-5 w-5">
          <defs>
            <linearGradient id="orchorGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="50%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="11" stroke="url(#orchorGrad)" strokeWidth="1.6" fill="none" />
          <circle cx="16" cy="16" r="6" stroke="url(#orchorGrad)" strokeWidth="1.6" fill="none" opacity="0.8" />
          <circle cx="16" cy="16" r="2" fill="url(#orchorGrad)" />
        </svg>
      </div>
    </div>
  );
}

export function MonadIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="monGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path
        d="M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 Z"
        fill="url(#monGrad)"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="0.8"
      />
      <path d="M12 6 L12 18" stroke="white" strokeOpacity="0.7" strokeWidth="1" />
    </svg>
  );
}

export function EnergyBolt({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="energyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#22d3ee" />
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
