import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Count23 - Countdown Timer",
  description: "Beautiful countdown timer PWA with notifications. Set a target time and watch it count down live.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Count23",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0f1e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="manifest" href="./manifest.json" />
        <link rel="icon" href="./icons/icon-192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="./icons/icon-192.svg" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
