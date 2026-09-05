"use client";

import Link from "next/link";
import React from "react";

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-6 font-semibold text-lg">MelaAI</div>
      <nav className="space-y-1 text-sm">
        <Link href="/dashboard" className="block rounded px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">Dashboard</Link>
        <Link href="/finance" className="block rounded px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">Finance</Link>
        <Link href="/investments" className="block rounded px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">Investments</Link>
        <Link href="/goals" className="block rounded px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">Goals</Link>
        <Link href="/tasks" className="block rounded px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">Tasks</Link>
        <Link href="/mela" className="block rounded px-3 py-2 font-medium text-emerald-600 dark:text-emerald-400">Mela AI</Link>
      </nav>
    </aside>
  );
}
