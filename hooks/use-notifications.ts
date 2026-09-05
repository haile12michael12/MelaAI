"use client";

import { useState } from "react";

export function useNotifications() {
  const [notifications, setNotifications] = useState<string[]>([]);
  return { notifications, setNotifications };
}
