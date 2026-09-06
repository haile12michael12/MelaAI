import { RoutePlaceholder } from "@/components/route-placeholder";
"use client";

export default function MediaPage() { return <RoutePlaceholder title="Media" />; }
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { WatchlistItem } from "@/types";
import { Film, Tv, PlayCircle, Star, Plus, Check } from "lucide-react";

export default function MediaWatchlistPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [filter, setFilter] = useState<"all" | "movie" | "show" | "anime">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return setLoading(false);
      try {
        const res = await fetch("/api/watchlist", {
          headers: { Authorization: `Bearer ${user.idToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const filtered = items.filter((i) => filter === "all" || i.type === filter);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Media & Cine Watchlist
          </h1>
          <p className="text-xs text-neutral-500">
            Movies, TV series, and anime with Trakt & AniList synchronization
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
          {(["all", "movie", "show", "anime"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition ${
                filter === f
                  ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
              }`}
            >
              {f === "show" ? "TV Shows" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-neutral-300 p-12 text-center text-xs text-neutral-400 dark:border-neutral-700">
            No media items found in this category. Sync with AniList/Trakt from settings or add items in Classic View.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id || item.title}
              className="group overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800/80 dark:bg-neutral-900"
            >
              <div className="relative aspect-2/3 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                {item.coverImage ? (
                  <img src={item.coverImage} alt={item.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Film className="h-8 w-8 text-neutral-400" />
                  </div>
                )}
                {item.rating && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-xs">
                    <Star className="h-3 w-3 fill-amber-400" />
                    <span>{item.rating}</span>
                  </div>
                )}
              </div>

              <div className="p-3">
                <h3 className="line-clamp-1 text-xs font-bold text-neutral-900 dark:text-white">{item.title}</h3>
                <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-400 capitalize">
                  <span>{item.type}</span>
                  <span>{item.status.replace(/_/g, " ")}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}