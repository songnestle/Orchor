import "./globals.css";
import "../styles/premium.css";
import type { Metadata } from "next";
import {
  Press_Start_2P,
  VT323,
  DM_Sans,
  Space_Grotesk,
  JetBrains_Mono,
} from "next/font/google";
import { Providers } from "@/components/Providers";
import { AppChrome } from "@/components/AppChrome";

// Self-hosted at build time via next/font — no runtime dependency on
// fonts.googleapis.com (unreachable from mainland-China venues).
const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-pixel",
  display: "swap",
});
const retro = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-retro",
  display: "swap",
});
const bodyFont = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--nf-body",
  display: "swap",
});
const displayFont = Space_Grotesk({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--nf-display",
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
      lang="en"
      className={`dark ${pixel.variable} ${retro.variable} ${bodyFont.variable} ${displayFont.variable} ${mono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <Providers>
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
