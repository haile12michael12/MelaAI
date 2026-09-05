"use client";

import React from "react";
import type { BookItem } from "@/types/books";
import { EmptyState } from "./empty-state";
import { BookOpen, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface ReadingActivityWidgetProps {
  books: BookItem[];
  onAddBook?: () => void;
}

export function ReadingActivityWidget({ books, onAddBook }: ReadingActivityWidgetProps) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-neutral-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Reading Activity</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Library & Bookshelf</p>
        </div>
        <Link
          href="/books"
          className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          Books <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="my-auto">
          <EmptyState
            icon={<BookOpen className="h-5 w-5" />}
            title="No reading activity"
            description="Track books you are currently reading or plan to read."
            actionLabel="Add Book"
            onAction={onAddBook}
          />
        </div>
      ) : (
        <div className="mt-4 space-y-2.5 overflow-y-auto max-h-52 pr-1">
          {books.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-xl border border-neutral-100 p-2.5 transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/60"
            >
              <div>
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{b.title}</p>
                <span className="text-[10px] text-neutral-400">by {b.author}</span>
              </div>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                {b.status.replace(/_/g, " ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
