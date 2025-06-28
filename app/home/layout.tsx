// app/home/layout.tsx
import React from "react";
import Sidebar from "@/components/sidebar";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] z-40">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}