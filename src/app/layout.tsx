import "./globals.css";
import "../styles/premium.css";
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Orchor — The Skill Layer for AI Agents",
  description:
    "Orchor is a collectible, programmable AI skill economy. Collect agentic skill cards, run them with Credits, and build your deck — funded across multiple chains.",
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
