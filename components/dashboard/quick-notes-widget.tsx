"use client";

import React, { useState, useEffect } from "react";
import { StickyNote, Check } from "lucide-react";

export function QuickNotesWidget() {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("mela_quick_note") || "";
      setNote(cached);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNote(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("mela_quick_note", val);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-3xl border border-neutral-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Quick Scratchpad</h3>
        </div>
        {saved && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <Check className="h-3 w-3" /> Saved
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Auto-saved persistent scratchpad</p>

      <div className="mt-3 flex-1">
        <textarea
          value={note}
          onChange={handleChange}
          placeholder="Jot down quick thoughts, tasks, or reminders..."
          className="h-full min-h-[120px] w-full resize-none rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-3 text-xs text-neutral-800 placeholder-neutral-400 focus:border-neutral-400 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-200 dark:placeholder-neutral-500"
        />
      </div>
    </div>
  );
}
