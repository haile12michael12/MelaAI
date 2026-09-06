"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, ArrowLeft, Clock, CheckCircle2, Star } from "lucide-react";

export default function ReadingPage() {
  const currentlyReading = [
    {
      id: "3",
      title: "The Psychology of Money",
      author: "Morgan Housel",
      progress: 65,
      pagesTotal: 256,
      pagesRead: 166,
      category: "Personal Finance & Psychology",
      startedDate: "2026-08-10",
      notes: "Chapters on compounding and freedom especially resonant for long-term Ethiopian capital allocation.",
    },
    {
      id: "5",
      title: "Girmawi Nigus (ግርማዊ ንጉሥ)",
      author: "Hadis Alemayehu",
      progress: 40,
      pagesTotal: 340,
      pagesRead: 136,
      category: "Ethiopian Classic Literature",
      startedDate: "2026-08-20",
      notes: "Rich Ge'ez terminology and historical social perspective.",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/books"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Books Library</span>
      </Link>

      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
            Currently Reading (በንባብ ላይ)
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Active reading progress, page counts, and chapter notes
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {currentlyReading.map((book) => (
          <div
            key={book.id}
            className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                  {book.category}
                </span>
                <h2 className="mt-2 text-base font-bold text-neutral-900 dark:text-white">
                  {book.title}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  by {book.author}
                </p>
              </div>

              <div className="text-right">
                <span className="font-mono text-base font-bold text-purple-600 dark:text-purple-400">
                  {book.progress}%
                </span>
                <p className="text-[10px] text-neutral-400">
                  {book.pagesRead} of {book.pagesTotal} pages
                </p>
              </div>
            </div>

            <div className="mt-4 h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className="h-2 rounded-full bg-purple-600"
                style={{ width: `${book.progress}%` }}
              />
            </div>

            <div className="mt-4 rounded-xl bg-neutral-50 p-3.5 text-xs text-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-300">
              <span className="font-semibold text-neutral-900 dark:text-white">Personal Notes: </span>
              {book.notes}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}