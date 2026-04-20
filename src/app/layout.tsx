import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://discord-community-analytics.com"),
  title: {
    default: "Discord Community Analytics",
    template: "%s | Discord Community Analytics",
  },
  description:
    "Know which members drive engagement, spot churn risk early, and scale healthier Discord communities.",
  openGraph: {
    title: "Discord Community Analytics",
    description:
      "Engagement analytics + churn prediction for serious Discord community managers.",
    url: "https://discord-community-analytics.com",
    siteName: "Discord Community Analytics",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Discord Community Analytics",
    description:
      "Track contributors, trends, at-risk members, and hot topics in your Discord server.",
  },
  keywords: [
    "discord analytics",
    "discord churn prediction",
    "community management",
    "discord dashboard",
    "engagement metrics",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${manrope.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
