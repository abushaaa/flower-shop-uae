import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bloom & Gift | Luxury Flowers & Gifts in UAE",
  description: "UAE's premier online flower and gift shop. Premium bouquets, chocolates, cakes, perfumes, and gift boxes with same-day delivery across all Emirates.",
  keywords: ["flowers UAE", "gifts Dubai", "bouquets Abu Dhabi", "flower delivery", "luxury gifts", "same day delivery", "rose bouquet", "wedding flowers"],
  authors: [{ name: "Bloom & Gift" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Bloom & Gift | Luxury Flowers & Gifts in UAE",
    description: "Send love with premium flowers and gifts. Same-day delivery across the UAE.",
    type: "website",
    locale: "en_AE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
