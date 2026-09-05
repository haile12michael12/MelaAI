"use client";

import { useState } from "react";

export function useMela() {
  const [status, setStatus] = useState<"idle" | "thinking" | "ready">("ready");
  return { status, setStatus };
}
