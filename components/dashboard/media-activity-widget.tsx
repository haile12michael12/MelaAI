"use client";

import React from "react";
import type { WatchlistItem } from "@/types";
import { EmptyState } from "./empty-state";
import { Film, PlayCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface MediaActivityWidgetProps {
  watchlist: WatchlistItem[];
  onAddMedia?: () => void;
}

export function MediaActivityWidget({ watchlist, onAddMedia }: MediaActivityWidgetProps) {
  const activeMedia = watchlist.slice(0, 5);

  return (
    <div className="flex h-full flex-col rounded-3xl border border-neutral-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Media Activity</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Movies, TV & Anime</p>
        </div>
        <Link
          href="/media"
          className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          Watchlist <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {activeMedia.length === 0 ? (
        <div className="my-auto">
          <EmptyState
            icon={<Film className="h-5 w-5" />}
            title="Watchlist is empty"
            description="Sync with AniList/Trakt or add favorite movies and series."
            actionLabel="Add Title"
            onAction={onAddMedia}
          />
        </div>
      ) : (
        <div className="mt-4 space-y-2.5 overflow-y-auto max-h-52 pr-1">
          {activeMedia.map((m) => (
            <div
              key={m.id || m.title}
              className="flex items-center justify-between rounded-xl border border-neutral-100 p-2.5 transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/60"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                  <PlayCircle className="h-4 w-4" />
                </div>
                <div className="truncate">
                  <p className="truncate text-xs font-semibold text-neutral-800 dark:text-neutral-200">{m.title}</p>
                  <span className="text-[10px] uppercase text-neutral-400">{m.type} • {m.status.replace(/_/g, " ")}</span>
                </div>
              </div>
              {m.totalEpisodes ? (
                <span className="shrink-0 text-right font-mono text-[11px] text-neutral-500">
                  {m.progress || 0}/{m.totalEpisodes} ep
                </span>
              ) : (
                m.rating && <span className="shrink-0 font-mono text-[11px] text-amber-500">★ {m.rating}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
