import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { AppChrome } from "@/components/AppChrome";

// Self-hosted at build time via next/font — no runtime dependency on
// fonts.googleapis.com (unreachable from mainland-China venues).
const bodyFont = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--nf-body",
  display: "swap",
});
const mono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--nf-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Orchor — The Skill Layer for AI Agents, on Injective",
  description:
    "Orchor turns AI capabilities into collectible, tradable Skill Cards — registered, priced and settled on-chain on Injective. The capital market for machine intelligence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`dark ${bodyFont.variable} ${mono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <Providers>
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
