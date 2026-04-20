import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const metricsFont = JetBrains_Mono({
  variable: "--font-metrics",
  subsets: ["latin"],
  weight: ["500", "600"],
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
      className={`${headingFont.variable} ${bodyFont.variable} ${metricsFont.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col text-white lab-shell">
        {children}
      </body>
    </html>
  );
}
