"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen, ArrowLeft, Star, Clock, CheckCircle2 } from "lucide-react";

export default function BookDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/books"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Books Library</span>
      </Link>

      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
        <div className="flex items-center gap-3 border-b border-neutral-100 pb-4 dark:border-neutral-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white">
              Book Details
            </h1>
            <p className="text-xs text-neutral-400">Record ID: {id}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-xs text-neutral-600 dark:text-neutral-300">
          <p>
            Detailed reviews, key takeaways, and Ge'ez reading notes are cataloged in your personal bookshelf.
          </p>
          <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
            <Link
              href="/books"
              className="font-semibold text-purple-600 hover:underline dark:text-purple-400"
            >
              Return to full reading library & OpenLibrary search →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}