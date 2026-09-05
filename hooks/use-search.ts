"use client";

import { useState } from "react";

export function useSearch<T>(initialItems: T[] = []) {
  const [query, setQuery] = useState("");
  return { query, setQuery, items: initialItems };
}
