import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import PWARegister from "@/components/PWARegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "NITJ Final Project - Campus Management System",
  description: "A centralized ecosystem for transparent campus management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
        <PWARegister />
      </body>
    </html>
  );
}
