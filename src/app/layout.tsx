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
  description:
    "Live countdown timer with notification bar and floating popup. Install on Samsung Internet or home screen for a fluid app experience.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Count23",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0f1e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="manifest" href="./manifest.json" />
        <link rel="icon" href="./icons/icon-192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="./icons/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Count23" />
        <meta name="msapplication-TileColor" content="#0a0f1e" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
