"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Compass, Wallet, Film, BookOpen, FileText, X, ArrowRight } from "lucide-react";
import type { SearchResultItem } from "@/lib/mela/search";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-mela-search", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-mela-search", handleCustomOpen);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      searchQuery(query);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  const searchQuery = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mela/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setSelectedIndex(0);
      }
    } catch (err) {
      console.error("[CommandPalette] Search error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    searchQuery(val);
  };

  const handleSelect = (item: SearchResultItem) => {
    setIsOpen(false);
    router.push(item.href);
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-20 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
        onKeyDown={handleListKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <Search className="h-5 w-5 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search across MELA (Finance, Tasks, Goals, Media, Notes, Navigation)..."
            className="ml-3 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                searchQuery("");
              }}
              className="mr-2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 dark:bg-neutral-800">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {loading && results.length === 0 ? (
            <div className="p-4 text-center text-xs text-neutral-400">Searching MELA...</div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-500">
              No results found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200"
                        : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-neutral-100 p-1.5 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                        {item.domain === "finance" ? (
                          <Wallet className="h-4 w-4" />
                        ) : item.domain === "media" ? (
                          <Film className="h-4 w-4" />
                        ) : item.domain === "notes" ? (
                          <FileText className="h-4 w-4" />
                        ) : (
                          <Compass className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">{item.title}</p>
                        {item.subtitle && (
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{item.subtitle}</p>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 opacity-40" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-4 py-2 text-[11px] text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/50">
          <span>Navigate with &uarr;&darr;</span>
          <span>Select with Enter</span>
        </div>
      </div>
    </div>
  );
}
