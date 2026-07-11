import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/layout/ThemeProvider";

export const metadata: Metadata = {
  title: "Weather AI — Intelligent Weather Forecasting Platform",
  description:
    "AI-powered weather dashboard with real-time forecasts, ML predictions, interactive maps, air quality monitoring, and smart alerts. Built with Next.js, FastAPI, and machine learning.",
  keywords: [
    "weather", "forecast", "AI", "machine learning", "predictions",
    "temperature", "rain", "air quality", "weather dashboard",
  ],
  authors: [{ name: "Weather AI" }],
  openGraph: {
    title: "Weather AI — Intelligent Weather Forecasting",
    description: "AI-powered weather dashboard with real-time data, ML predictions, and interactive charts.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          {/* Animated background */}
          <div className="weather-bg" aria-hidden="true" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
