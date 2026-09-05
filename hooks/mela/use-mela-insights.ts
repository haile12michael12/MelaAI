"use client";

import { useState } from "react";

export function useMelaInsights() {
  const [insights, setInsights] = useState<string[]>([]);
  return { insights, setInsights };
}
