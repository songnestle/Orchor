import "./globals.css";
import "../styles/premium.css";
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Orchor — The Skill Layer for AI Agents · on Monad",
  description:
    "Orchor is a collectible, programmable, onchain AI skill economy. Collect agentic skill cards, invoke them with Energy, and build your deck — powered by Monad.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
