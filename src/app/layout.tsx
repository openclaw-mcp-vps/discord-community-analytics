import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://discord-community-analytics.com"),
  title: {
    default: "Discord Community Analytics",
    template: "%s | Discord Community Analytics"
  },
  description:
    "Know which members drive engagement, spot churn risk early, and track topic momentum in your Discord community.",
  applicationName: "Discord Community Analytics",
  keywords: [
    "discord analytics",
    "community health",
    "member churn prediction",
    "discord engagement dashboard",
    "community managers"
  ],
  openGraph: {
    title: "Discord Community Analytics",
    description:
      "Engagement intelligence for Discord servers: contributor rankings, message trends, churn risk detection, and hot-topic clouds.",
    siteName: "Discord Community Analytics",
    type: "website",
    url: "https://discord-community-analytics.com"
  },
  twitter: {
    card: "summary_large_image",
    title: "Discord Community Analytics",
    description:
      "Understand your server health, protect retention, and focus moderation where it matters."
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
      <body>{children}</body>
    </html>
  );
}
