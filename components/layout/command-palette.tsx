"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Receipt,
  Target,
  FileText,
  FolderLock,
  CheckSquare,
  Flame,
  TrendingUp,
  Repeat,
  BookOpen,
  Film,
  Compass,
  ArrowRight,
  Clock,
  Sparkles,
  X,
  Tag
} from "lucide-react";
import { SearchDomain, DomainGroup, UniversalSearchItem } from "@/lib/search/universal-search";

const DOMAIN_FILTERS: { id: SearchDomain | 'all'; label: string }[] = [
  { id: 'all', label: 'All Domains' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'goals', label: 'Goals' },
  { id: 'notes', label: 'Notes' },
  { id: 'documents', label: 'Documents' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'habits', label: 'Habits' },
  { id: 'investments', label: 'Investments' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'books', label: 'Books' },
  { id: 'media', label: 'Media' },
];

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeDomain, setActiveDomain] = useState<SearchDomain | 'all'>('all');
  const [groups, setGroups] = useState<DomainGroup[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mela_search_history");
      if (stored) setSearchHistory(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveToHistory = (q: string) => {
    if (!q.trim()) return;
    try {
      const updated = [q.trim(), ...searchHistory.filter(h => h.toLowerCase() !== q.trim().toLowerCase())].slice(0, 8);
      setSearchHistory(updated);
      localStorage.setItem("mela_search_history", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem("mela_search_history");
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === "Escape" && isOpen) {
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

  const performSearch = useCallback(async (q: string, domain: SearchDomain | 'all') => {
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (domain !== 'all') params.set('domain', domain);

      const res = await fetch("/api/search?" + params.toString());
      const data = await res.json();
      if (data.success) {
        setGroups(data.groups || []);
        setTotalResults(data.totalResults || 0);
        setSuggestedQueries(data.suggestedQueries || []);
        setSelectedIndex(0);
      }
    } catch (err) {
      console.error("Universal search error", err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      performSearch(query, activeDomain);
    } else {
      setSelectedIndex(0);
    }
  }, [isOpen, activeDomain]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    performSearch(val, activeDomain);
  };

  const flatItems: UniversalSearchItem[] = groups.flatMap(g => g.items);

  const handleSelect = (item: UniversalSearchItem) => {
    if (query.trim()) saveToHistory(query.trim());
    setIsOpen(false);
    router.push(item.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === "Enter" && flatItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(flatItems[selectedIndex]);
    }
  };

  const getDomainIcon = (domain: SearchDomain) => {
    switch (domain) {
      case 'expenses':
        return <Receipt className="w-4 h-4 text-rose-400" />;
      case 'goals':
        return <Target className="w-4 h-4 text-indigo-400" />;
      case 'notes':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'documents':
        return <FolderLock className="w-4 h-4 text-emerald-400" />;
      case 'tasks':
        return <CheckSquare className="w-4 h-4 text-amber-400" />;
      case 'habits':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'investments':
        return <TrendingUp className="w-4 h-4 text-teal-400" />;
      case 'subscriptions':
        return <Repeat className="w-4 h-4 text-purple-400" />;
      case 'books':
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
      case 'media':
        return <Film className="w-4 h-4 text-pink-400" />;
      default:
        return <Compass className="w-4 h-4 text-slate-400" />;
    }
  };

  if (!isOpen) return null;

  let currentItemIdx = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-slate-900 rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-900/90 gap-3">
          <Search className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search across expenses, goals, notes, documents, habits, tasks..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); performSearch("", activeDomain); }}
              className="p-1 rounded text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-slate-800 border border-slate-700 rounded text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Domain Filter Chips */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800/80 bg-slate-950/40 overflow-x-auto custom-scrollbar">
          {DOMAIN_FILTERS.map(filter => (
            <button
              key={filter.id}
              onClick={() => { setActiveDomain(filter.id); }}
              className={"px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition " + (
                activeDomain === filter.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Results / History Workspace */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {!query && (
            <div className="space-y-4 px-2 py-1">
              {searchHistory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Recent Searches</span>
                    <button onClick={clearHistory} className="text-[10px] text-slate-500 hover:text-rose-400">Clear</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {searchHistory.map(term => (
                      <button
                        key={term}
                        onClick={() => { setQuery(term); performSearch(term, activeDomain); }}
                        className="px-2.5 py-1 rounded-md bg-slate-800/70 border border-slate-700/60 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Suggested Inquiries
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedQueries.map(sq => (
                    <button
                      key={sq}
                      onClick={() => { setQuery(sq); performSearch(sq, activeDomain); }}
                      className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 hover:bg-indigo-500/20 transition"
                    >
                      {sq}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {groups.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No results found for query.
            </div>
          ) : (
            groups.map(group => (
              <div key={group.domain} className="space-y-1.5">
                <div className="flex items-center gap-2 px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {getDomainIcon(group.domain)}
                  <span>{group.label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-500 ml-auto">
                    {group.items.length}
                  </span>
                </div>

                <div className="space-y-1">
                  {group.items.map(item => {
                    const itemIndex = currentItemIdx++;
                    const isSelected = itemIndex === selectedIndex;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        className={"flex items-center justify-between p-2.5 rounded-xl transition cursor-pointer border " + (
                          isSelected
                            ? "bg-slate-800/90 border-indigo-500/60 shadow-sm"
                            : "bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/40 hover:border-slate-700"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex-shrink-0">
                            {getDomainIcon(item.domain)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-2">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                              {item.subtitle}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.tags && item.tags.length > 0 && (
                            <span className="hidden md:inline-block px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
                              #{item.tags[0]}
                            </span>
                          )}
                          <ArrowRight className={"w-3.5 h-3.5 transition " + (isSelected ? "text-indigo-400 translate-x-0.5" : "text-slate-600")} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] font-mono border border-slate-700">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] font-mono border border-slate-700">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] font-mono border border-slate-700">Enter</kbd>
              Open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] font-mono border border-slate-700">Esc</kbd>
              Close
            </span>
          </div>
          <span className="text-slate-500 font-medium">{totalResults} items available</span>
        </div>
      </div>
    </div>
  );
}