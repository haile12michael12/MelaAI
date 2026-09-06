import { RoutePlaceholder } from "@/components/route-placeholder";
"use client";

export default function BooksPage() { return <RoutePlaceholder title="Books" />; }
import React, { useState } from "react";
import { BookOpen, Search, Plus, Star, CheckCircle, Clock } from "lucide-react";
import type { BookItem } from "@/types/books";

export default function BooksLibraryPage() {
  const [books, setBooks] = useState<BookItem[]>([
    { id: "1", title: "Oromay (ኦሮማይ)", author: "Baalu Girma (በዓሉ ግርማ)", status: "completed", rating: 5, coverImage: "https://covers.openlibrary.org/b/id/10523364-M.jpg" },
    { id: "2", title: "Fikr Eske Mekabr (ፍቅር እስከ መቃብር)", author: "Haddis Alemayehu (ሀዲስ አለማየሁ)", status: "completed", rating: 5 },
    { id: "3", title: "The Psychology of Money", author: "Morgan Housel", status: "reading", progress: 65 },
    { id: "4", title: "Atomic Habits", author: "James Clear", status: "completed", rating: 5 },
  ]);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=6`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(
          (data.docs || []).map((d: any) => ({
            title: d.title,
            author: d.author_name?.[0] || "Unknown",
            coverImage: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const addBook = (item: { title: string; author: string; coverImage?: string | null }) => {
    const newBook: BookItem = {
      id: String(Date.now()),
      title: item.title,
      author: item.author,
      status: "reading",
      coverImage: item.coverImage || undefined,
      progress: 0,
    };
    setBooks([newBook, ...books]);
    setSearchResults([]);
    setQuery("");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Personal Library & Reading Logs
          </h1>
          <p className="text-xs text-neutral-500">
            Track reading progress, Ethiopian literature classics & OpenLibrary discovery
          </p>
        </div>
      </div>

      {/* OpenLibrary Search Bar */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search books by title or author on OpenLibrary..."
              className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-xs text-neutral-900 outline-none focus:border-emerald-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            {searching ? "Searching..." : "Search Books"}
          </button>
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-neutral-100 pt-4 sm:grid-cols-2 lg:grid-cols-3 dark:border-neutral-800">
            {searchResults.map((book, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-neutral-200/80 p-3 dark:border-neutral-700"
              >
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">{book.title}</p>
                  <p className="text-[10px] text-neutral-500">{book.author}</p>
                </div>
                <button
                  onClick={() => addBook(book)}
                  className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {books.map((b) => (
          <div
            key={b.id}
            className="flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900"
          >
            <div>
              <div className="flex h-36 w-full items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                {b.coverImage ? (
                  <img src={b.coverImage} alt={b.title} className="h-full w-full object-cover" />
                ) : (
                  <BookOpen className="h-8 w-8 text-neutral-400" />
                )}
              </div>

              <div className="mt-3">
                <h3 className="line-clamp-1 text-xs font-bold text-neutral-900 dark:text-white">{b.title}</h3>
                <p className="text-[11px] text-neutral-500">{b.author || "Unknown"}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-[10px] font-semibold text-neutral-500 dark:border-neutral-800">
              <span className="capitalize">{b.status}</span>
              {b.rating && (
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-3 w-3 fill-amber-500" />
                  <span>{b.rating}/5</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}