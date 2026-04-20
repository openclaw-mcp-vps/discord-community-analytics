import type { Metadata } from "next";
import Script from "next/script";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap"
});

const bodyFont = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
  display: "swap"
});

const title = "Discord Community Analytics | Engagement + Churn Insights";
const description =
  "Track who drives conversation, detect churn risk early, and surface hot topics in your Discord community.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title,
  description,
  keywords: [
    "discord analytics",
    "community health",
    "churn prediction",
    "discord dashboard",
    "engagement tracking"
  ],
  openGraph: {
    title,
    description,
    type: "website",
    url: "/",
    siteName: "Discord Community Analytics"
  },
  twitter: {
    card: "summary_large_image",
    title,
    description
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable} font-mono antialiased`}>
        {children}
        <Script
          src="https://assets.lemonsqueezy.com/lemon.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
