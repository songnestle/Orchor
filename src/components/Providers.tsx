"use client";

import { ReactNode, useState } from "react";
import { WagmiProvider, http, fallback } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { injectiveTestnet, monadTestnet } from "@/lib/chain";
import { I18nProvider } from "@/lib/i18n";

const wagmiConfig = getDefaultConfig({
  appName: "Orchor",
  // RainbowKit requires a WalletConnect projectId. Get one for free at
  // https://cloud.walletconnect.com — set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
  // to enable mobile + WC wallets. Falls back to a demo id locally.
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "orchor-demo-projectid",
  chains: [injectiveTestnet, monadTestnet],
  // The public Injective testnet RPCs are flaky under load — fall back
  // across three endpoints with retries so one bad node can't stall the UI.
  transports: {
    [injectiveTestnet.id]: fallback([
      http("https://testnet.sentry.chain.json-rpc.injective.network/", {
        retryCount: 2,
        timeout: 12_000,
      }),
      http("https://k8s.testnet.json-rpc.injective.network/", {
        retryCount: 2,
        timeout: 12_000,
      }),
      http("https://1439.rpc.thirdweb.com", { retryCount: 2, timeout: 12_000 }),
    ]),
    [monadTestnet.id]: http(),
  },
  ssr: true,
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Chain reads change slowly; avoid refetch storms on the
            // rate-limited public testnet RPCs.
            staleTime: 30_000,
            retry: 2,
          },
        },
      })
  );
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={injectiveTestnet}
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
