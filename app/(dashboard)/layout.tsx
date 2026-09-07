"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandPalette } from "@/components/layout/command-palette";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-50/50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <Sidebar />
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 bg-white p-4 shadow-xl dark:bg-neutral-900">
            <Sidebar />
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-8 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
      <CommandPalette />
    </div>
  );
}