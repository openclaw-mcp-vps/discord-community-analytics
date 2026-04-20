import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Discord Community Analytics | Engagement + Churn Prediction",
  description:
    "Track top contributors, engagement trends, churn risk, and hot topics in your Discord server with a bot-first analytics dashboard.",
  metadataBase: new URL("https://discord-community-analytics.app"),
  openGraph: {
    title: "Discord Community Analytics",
    description:
      "Know which members drive engagement and predict churn before your community goes quiet.",
    type: "website",
    url: "https://discord-community-analytics.app"
  },
  twitter: {
    card: "summary_large_image",
    title: "Discord Community Analytics",
    description:
      "Identify at-risk members and growth opportunities with engagement-focused Discord analytics."
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script src="https://app.lemonsqueezy.com/js/lemon.js" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  );
}
