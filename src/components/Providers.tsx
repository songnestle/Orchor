"use client";

import { ReactNode, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { monadTestnet } from "@/lib/chain";
import { I18nProvider } from "@/lib/i18n";

const wagmiConfig = getDefaultConfig({
  appName: "Orchor",
  // RainbowKit requires a WalletConnect projectId. Get one for free at
  // https://cloud.walletconnect.com — set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
  // to enable mobile + WC wallets. Falls back to a demo id locally.
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "orchor-demo-projectid",
  chains: [monadTestnet],
  ssr: true,
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={monadTestnet}
          theme={darkTheme({
            accentColor: "#d6a44c",
            accentColorForeground: "white",
            borderRadius: "large",
            fontStack: "system",
            overlayBlur: "small",
          })}
          modalSize="compact"
        >
          <I18nProvider>{children}</I18nProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
