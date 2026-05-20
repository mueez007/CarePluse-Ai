import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/lib/theme-context";

export const metadata: Metadata = {
  title: "CarePulse AI - Your Intelligent Health Companion",
  description: "AI-powered preventive healthcare companion for elderly wellness. Food safety, medication reminders, emotional support, and emergency alerts.",
  keywords: "healthcare AI, elderly care, medication reminder, food safety, emotional wellness",
  authors: [{ name: "CarePulse AI" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0A0A0F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

