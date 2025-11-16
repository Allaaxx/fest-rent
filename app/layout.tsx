/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fest Marketplace - Equipment Rental",
  description: "Rent event equipment for corporate and casual events",
  generator: "v0.app",
  icons: {
    // Provide explicit favicons for broad compatibility
    icon: [
      // Standard ICO fallback (used by many browsers)
      { url: "/favicon-32.png", type: "image/x-icon" },
      // PNG sized favicon (explicit size helps some browsers)
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      // Optional SVG (modern browsers)
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
