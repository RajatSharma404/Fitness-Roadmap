import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Syne } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const displayFont = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const metricsFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "FitFlow Planner - Fat Loss, Weight Loss, and Muscle Building",
  description:
    "Interactive roadmap for fat loss, weight loss, and muscle building using BMI, calories, macros, workout scheduling, hydration, and meal combinations.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: ["/icon.svg"],
    apple: [{ url: "/icon.svg" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${metricsFont.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-bg-void text-text-primary">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
