"use client";

import React, { ReactNode } from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
        {icon || <FolderOpen className="h-5 w-5" />}
      </div>
      <h5 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{title}</h5>
      <p className="mt-1 max-w-xs text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center rounded-xl bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
