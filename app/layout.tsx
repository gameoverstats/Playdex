// app/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/navbar";
import Sidebar from "@/components/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GameTracker - Track Your Gaming Journey",
  description: "Track your games, improve your skills, and stay updated with the latest esports news.",
  generator: "v0.dev",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {/* Fixed Navbar */}
          <Navbar />

          {/* Page layout starts below fixed navbar */}
          <div className="flex pt-16 min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
            {/* Sidebar (sticky left) */}
            <div className="sticky top-16 h-[calc(100vh-4rem)]">
              <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 p-4 overflow-auto">{children}</main>
          </div>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
