"use client";

import { useState } from "react";

export function useMelaChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  return { messages, setMessages };
}
